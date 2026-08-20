export type TicketCategory = 
  | 'road'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'street_light'
  | 'drainage'
  | 'other';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketAttachment {
  kind: 'image' | 'video';
  name: string;
  url: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  location: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  userName: string;
  phoneNumber: string;
  adminNotes?: string;
  attachment?: TicketAttachment;
  lat?: number;
  lng?: number;
  escalation_level?: string;
  VoiceNote?: { filePath: string };
}
