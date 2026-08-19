import { 
  Construction, 
  Droplet, 
  Zap, 
  Trash2, 
  Lightbulb, 
  Waves,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  User
} from 'lucide-react';
import { Ticket, TicketCategory } from '../types/ticket';

interface TicketCardProps {
  ticket: Ticket;
}

const categoryIcons: Record<TicketCategory, any> = {
  road: Construction,
  water: Droplet,
  electricity: Zap,
  sanitation: Trash2,
  street_light: Lightbulb,
  drainage: Waves,
  other: AlertCircle,
};

const categoryLabels: Record<TicketCategory, string> = {
  road: 'Road & Potholes',
  water: 'Water Supply',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  street_light: 'Street Light',
  drainage: 'Drainage',
  other: 'Other',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TicketCard({ ticket }: TicketCardProps) {
  const Icon = categoryIcons[ticket.category];
  const date = new Date(ticket.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="village-panel rounded-[28px] p-5 transition-shadow hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="rounded-2xl bg-[#e4f0dd] p-3">
            <Icon className="w-5 h-5 text-[#567640]" />
          </div>
          <div className="flex-1">
            <h3 className="village-title mb-1 text-xl font-semibold text-[#2f3a22]">{ticket.title}</h3>
            <p className="text-sm text-[#7d715d]">{categoryLabels[ticket.category]}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
          {statusLabels[ticket.status]}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-[#584c3e]">{ticket.description}</p>

      {ticket.attachment && (
        <div className="mb-4 overflow-hidden rounded-[22px] border border-[#e6d8be] bg-[#fcf7ee] p-3">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8b6a3e]">Uploaded Evidence</p>
          {ticket.attachment.kind === 'image' ? (
            <img
              src={ticket.attachment.url}
              alt={ticket.attachment.name}
              className="max-h-80 w-full rounded-[16px] object-cover"
            />
          ) : (
            <video
              src={ticket.attachment.url}
              controls
              className="max-h-80 w-full rounded-[16px] bg-black object-contain"
            />
          )}
          <p className="mt-2 text-xs text-[#88755d]">{ticket.attachment.name}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#6b5d48]">
          <MapPin className="w-4 h-4" />
          <span>{ticket.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6b5d48]">
          <User className="w-4 h-4" />
          <span>{ticket.userName}</span>
          <Phone className="w-4 h-4 ml-4" />
          <span>{ticket.phoneNumber}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eadcc4] pt-4">
        <div className="flex items-center gap-2 text-sm text-[#887b67]">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
          </span>
          <span className="font-mono text-xs text-[#8a7f70]">{ticket.id}</span>
        </div>
      </div>
    </div>
  );
}
