import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for edge function.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function getUserRole(user: { user_metadata?: { role?: string }; app_metadata?: { role?: string } } | null | undefined) {
  return user?.user_metadata?.role ?? user?.app_metadata?.role;
}

// Helper to get authenticated user
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  console.log('🔐 Auth check - Has header:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid auth header');
    return null;
  }
  
  const accessToken = authHeader.replace('Bearer ', '');
  console.log('🔑 Token length:', accessToken.length);
  
  try {
    // Use service role client to verify the user's JWT token
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log('❌ Token verification failed:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('❌ No user found for token');
      return null;
    }
    
    console.log('✅ User authenticated:', user.id, 'Role:', getUserRole(user));
    return user;
  } catch (error: any) {
    console.log('❌ Exception during auth:', error.message);
    return null;
  }
}

// User signup route
app.post('/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'user' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role
      }
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get all tickets
app.get('/tickets', async (c) => {
  try {
    // Use kv_store helper to get all tickets
    const tickets = await kv.getByPrefix('ticket:');
    
    // Sort by createdAt descending
    const sortedTickets = tickets.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ tickets: sortedTickets });
  } catch (error) {
    console.log('Error fetching tickets:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Search tickets by ID or phone number
app.get('/tickets/search', async (c) => {
  try {
    const query = c.req.query('query');
    
    if (!query) {
      return c.json({ error: 'Query parameter is required' }, 400);
    }

    console.log('Searching tickets with query:', query);
    
    // Use kv_store helper to get all tickets
    const allTickets = await kv.getByPrefix('ticket:');
    
    // Search by ticket ID or phone number
    const matchingTickets = allTickets.filter((ticket: any) => {
      const matchesId = ticket.id?.toLowerCase().includes(query.toLowerCase());
      const matchesPhone = ticket.phoneNumber && ticket.phoneNumber.includes(query);
      return matchesId || matchesPhone;
    });

    console.log('Found tickets:', matchingTickets.length);

    return c.json({ tickets: matchingTickets });
  } catch (error) {
    console.log('Error searching tickets:', error);
    return c.json({ error: 'Failed to search tickets' }, 500);
  }
});

// Create a new ticket
app.post('/tickets', async (c) => {
  try {
    const ticketData = await c.req.json();
    
    const ticket = {
      id: `TICKET-${Date.now()}`,
      ...ticketData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in kv_store using the helper
    await kv.set(`ticket:${ticket.id}`, ticket);

    return c.json({ success: true, ticket });
  } catch (error) {
    console.log('Error creating ticket:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// Update ticket status (admin only)
app.patch('/tickets/:id', async (c) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TICKET UPDATE REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const user = await getAuthenticatedUser(c.req.raw);
    
    if (!user) {
      console.log('❌ AUTHENTICATION FAILED - No valid user token');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return c.json({ error: 'Unauthorized. Please login.' }, 401);
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('👤 User ID:', user.id);
    console.log('🎭 User role:', getUserRole(user));
    
    if (getUserRole(user) !== 'admin') {
      console.log('❌ AUTHORIZATION FAILED - User is not admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const ticketId = c.req.param('id');
    const { status, adminNotes } = await c.req.json();
    
    console.log('📋 Ticket ID:', ticketId);
    console.log('🔄 New Status:', status);
    console.log('📝 Admin Notes:', adminNotes ? `"${adminNotes.substring(0, 50)}..."` : '(none)');

    // Get the existing ticket
    const existingTicket = await kv.get(`ticket:${ticketId}`);
    
    if (!existingTicket) {
      console.log('❌ TICKET NOT FOUND:', ticketId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return c.json({ error: 'Ticket not found' }, 404);
    }

    console.log('✅ Ticket found, updating...');

    // Update the ticket
    const updatedTicket = {
      ...existingTicket,
      status: status,
      adminNotes: adminNotes,
      updatedAt: new Date().toISOString(),
    };

    // Save back to kv_store
    await kv.set(`ticket:${ticketId}`, updatedTicket);

    console.log('✅ TICKET UPDATED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.log('❌ ERROR UPDATING TICKET');
    console.log('Error:', error?.message);
    console.log('Stack:', error?.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return c.json({ error: `Failed to update ticket: ${error?.message || 'Unknown error'}` }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug auth endpoint
app.get('/debug-auth', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      return c.json({ error: 'No auth header' }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    console.log('Access token length:', accessToken?.length);
    
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    console.log('User lookup result:', { userId: user?.id, error: error?.message });
    
    if (error) {
      return c.json({ error: error.message, details: 'Failed to verify token' }, 401);
    }
    
    if (!user) {
      return c.json({ error: 'No user found' }, 401);
    }
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: getUserRole(user),
        metadata: {
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
        }
      }
    });
  } catch (error) {
    console.log('Debug auth error:', error);
    return c.json({ error: error?.message || 'Unknown error' }, 500);
  }
});

Deno.serve(app.fetch);
