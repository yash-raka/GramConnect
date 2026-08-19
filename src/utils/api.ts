import { Ticket } from '../types/ticket';

// --- Local Storage -----------------------------------------------------------
const LOCAL_STORAGE_KEY = 'gramconnect_tickets';

function getLocalTickets(): Ticket[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error('Browser storage is full. Please clear some space and try again.');
    }
    throw new Error(`Failed to save: ${error.message}`);
  }
}

// --- Public API (all localStorage-backed) ------------------------------------

/** Always returns false — this build uses local storage only. */
export async function isBackendAvailable(): Promise<boolean> {
  return false;
}

export async function fetchTickets(_forceLocal = false): Promise<Ticket[]> {
  return getLocalTickets();
}

export async function createTicket(
  ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Ticket> {
  const newTicket: Ticket = {
    ...ticketData,
    id: `TICKET-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const tickets = getLocalTickets();
  tickets.unshift(newTicket);
  saveLocalTickets(tickets);
  return newTicket;
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
  adminNotes: string,
  _accessToken: string
): Promise<Ticket> {
  const tickets = getLocalTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);

  if (idx === -1) {
    throw new Error(`Ticket ${ticketId} not found. Please refresh the page.`);
  }

  const updatedTicket: Ticket = {
    ...tickets[idx],
    status: status as Ticket['status'],
    adminNotes,
    updatedAt: new Date().toISOString(),
  };

  tickets[idx] = updatedTicket;
  saveLocalTickets(tickets);
  return updatedTicket;
}

export async function deleteTicket(ticketId: string, _accessToken: string): Promise<void> {
  const tickets = getLocalTickets().filter((t) => t.id !== ticketId);
  saveLocalTickets(tickets);
}

/** Not available in local-only mode. */
export async function signUp(
  _email: string,
  _password: string,
  _name: string,
  _role = 'user'
): Promise<never> {
  throw new Error('User creation is not available in local mode.');
}

/** Not available in local-only mode. */
export async function debugAdminAuth(_accessToken: string): Promise<never> {
  throw new Error('Auth debug is not available in local mode.');
}
