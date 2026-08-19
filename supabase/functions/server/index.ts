import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

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

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  console.log('Auth check - Has header:', !!authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header');
    return null;
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Token verification failed:', error?.message ?? 'No user found');
      return null;
    }

    console.log('User authenticated:', user.id, 'Role:', getUserRole(user));
    return user;
  } catch (error: any) {
    console.log('Exception during auth:', error.message);
    return null;
  }
}

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
      email_confirm: true,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role,
      },
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.get('/tickets', async (c) => {
  try {
    const tickets = await kv.getByPrefix('ticket:');
    const sortedTickets = tickets.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ tickets: sortedTickets });
  } catch (error) {
    console.log('Error fetching tickets:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

app.get('/tickets/search', async (c) => {
  try {
    const query = c.req.query('query');

    if (!query) {
      return c.json({ error: 'Query parameter is required' }, 400);
    }

    const allTickets = await kv.getByPrefix('ticket:');
    const matchingTickets = allTickets.filter((ticket: any) => {
      const matchesId = ticket.id?.toLowerCase().includes(query.toLowerCase());
      const matchesPhone = ticket.phoneNumber && ticket.phoneNumber.includes(query);
      return matchesId || matchesPhone;
    });

    return c.json({ tickets: matchingTickets });
  } catch (error) {
    console.log('Error searching tickets:', error);
    return c.json({ error: 'Failed to search tickets' }, 500);
  }
});

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

    await kv.set(`ticket:${ticket.id}`, ticket);
    return c.json({ success: true, ticket });
  } catch (error) {
    console.log('Error creating ticket:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

app.patch('/tickets/:id', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);

    if (!user) {
      return c.json({ error: 'Unauthorized. Please login.' }, 401);
    }

    if (getUserRole(user) !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const ticketId = c.req.param('id');
    const { status, adminNotes } = await c.req.json();
    const existingTicket = await kv.get(`ticket:${ticketId}`);

    if (!existingTicket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    const updatedTicket = {
      ...existingTicket,
      status,
      adminNotes,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`ticket:${ticketId}`, updatedTicket);
    return c.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.log('Error updating ticket:', error?.message ?? error);
    return c.json({ error: `Failed to update ticket: ${error?.message || 'Unknown error'}` }, 500);
  }
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/debug-auth', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ error: 'No auth header' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

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
        },
      },
    });
  } catch (error: any) {
    console.log('Debug auth error:', error?.message ?? error);
    return c.json({ error: error?.message || 'Unknown error' }, 500);
  }
});

Deno.serve(app.fetch);
