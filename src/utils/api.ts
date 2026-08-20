import axios from 'axios';
import { Ticket } from '../types/ticket';

const API_URL = 'http://localhost:5000/api/tickets';

export async function isBackendAvailable(): Promise<boolean> {
  return true;
}

export async function fetchTickets(): Promise<Ticket[]> {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

export async function createTicket(
  ticketData: any
): Promise<Ticket> {
  const formData = new FormData();

  // Map frontend field names -> backend field names
  formData.append('name', ticketData.userName || ticketData.name || '');
  formData.append('phone', ticketData.phoneNumber || ticketData.phone || '');
  formData.append('title', ticketData.title || '');
  formData.append('description', ticketData.description || '');
  formData.append('category', ticketData.category || '');
  formData.append('priority', ticketData.priority || 'medium');
  formData.append('location', ticketData.location || '');

  // Optional lat/lng
  if (ticketData.lat) formData.append('lat', String(ticketData.lat));
  if (ticketData.lng) formData.append('lng', String(ticketData.lng));

  // Voice note - multer expects a File under key 'voiceNote'
  if (ticketData.voiceNote instanceof File) {
    formData.append('voiceNote', ticketData.voiceNote, 'voice-note.webm');
  }

  const response = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function generateOTP(ticketId: string): Promise<void> {
  await axios.post(`${API_URL}/${ticketId}/generate-otp`);
}

export async function resolveTicket(ticketId: string, otp: string, adminNotes: string): Promise<Ticket> {
  const response = await axios.put(`${API_URL}/${ticketId}/resolve`, { otp, adminNotes });
  return response.data.ticket;
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
  adminNotes: string,
  _accessToken: string
): Promise<Ticket> {
  if (status === 'resolved') {
    throw new Error('To resolve a ticket, please use the OTP Satisfaction Lock flow.');
  }
  console.warn('Backend generic update not fully implemented, simulating for now');
  return { id: ticketId, status, adminNotes } as Ticket; 
}

export async function deleteTicket(ticketId: string, _accessToken: string): Promise<void> {
  console.warn('Backend delete not implemented, simulating for now');
}
