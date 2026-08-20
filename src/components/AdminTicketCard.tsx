import { useState } from 'react';
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
  User,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Ticket, TicketCategory, TicketStatus } from '../types/ticket';
import { deleteTicket, updateTicketStatus, generateOTP, resolveTicket } from '../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';

interface AdminTicketCardProps {
  ticket: Ticket;
  accessToken: string;
  onUpdate: (updatedTicket: Ticket) => void;
  onDelete: (ticketId: string) => void;
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

export function AdminTicketCard({ ticket, accessToken, onUpdate, onDelete }: AdminTicketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [adminNotes, setAdminNotes] = useState(ticket.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionCode, setResolutionCode] = useState('');
  const [resolutionCodeError, setResolutionCodeError] = useState('');

  const Icon = categoryIcons[ticket.category];
  const createdDate = new Date(ticket.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  async function performSave() {
    setIsSaving(true);
    try {
      console.log('💾 Saving ticket update:', {
        ticketId: ticket.id,
        newStatus,
        adminNotes,
      });
      
      const currentAccessToken = accessToken || 'no-token';
      
      // Attempt the update
      const updatedTicket = await updateTicketStatus(ticket.id, newStatus, adminNotes, currentAccessToken);
      console.log('✅ Ticket update successful:', updatedTicket);
      
      setIsEditing(false);
      
      // Update app state immediately so the UI reflects the new status without waiting for a re-fetch.
      onUpdate(updatedTicket);
      
      // Show success message after a brief delay to let UI update
      setTimeout(() => {
        alert(`✅ Ticket updated successfully!\\n\\nNew Status: ${statusLabels[newStatus]}\\n${adminNotes ? `Notes: ${adminNotes}` : ''}\\n\\nTicket ID: ${ticket.id}`);
      }, 100);
    } catch (error: any) {
      console.error('❌ Update error:', error);
      alert(`❌ Update Failed\\n\\n${error?.message || 'Unknown error occurred. Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setNewStatus(ticket.status);
    setAdminNotes(ticket.adminNotes || '');
    setIsEditing(false);
    setIsResolveDialogOpen(false);
    setResolutionCode('');
    setResolutionCodeError('');
  }

  async function handleSave() {
    if (newStatus === 'resolved' && ticket.status !== 'resolved') {
      setIsSaving(true);
      try {
        await generateOTP(ticket.id);
        setResolutionCode('');
        setResolutionCodeError('');
        setIsResolveDialogOpen(true);
      } catch (err) {
        alert('Failed to generate OTP');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    void performSave();
  }

  async function handleResolveCodeSubmit() {
    if (!resolutionCode.trim()) {
      setResolutionCodeError('Please enter the OTP.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedTicket = await resolveTicket(ticket.id, resolutionCode, adminNotes);
      setIsEditing(false);
      setIsResolveDialogOpen(false);
      setResolutionCode('');
      setResolutionCodeError('');
      onUpdate(updatedTicket);
      setTimeout(() => {
        alert(`✅ Ticket resolved successfully!`);
      }, 100);
    } catch (err: any) {
      setResolutionCodeError(err.response?.data?.error || 'Incorrect or expired OTP');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ticket ${ticket.id}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const currentAccessToken = accessToken || 'no-token';
      await deleteTicket(ticket.id, currentAccessToken);
      onDelete(ticket.id);
      alert(`✅ Ticket deleted successfully!\n\nTicket ID: ${ticket.id}`);
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      alert(`❌ Delete Failed\n\n${error?.message || 'Unknown error occurred. Please try again.'}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border-l-4 border-green-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-green-100 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{ticket.title}</h3>
            <p className="text-sm text-gray-500">{categoryLabels[ticket.category]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
                {statusLabels[ticket.status]}
              </span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete ticket"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit status"
              >
                <Edit3 className="w-4 h-4 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{ticket.description}</p>

      {ticket.attachment && (
        <div className="mb-4 overflow-hidden rounded-xl border border-[#e4d6bd] bg-[#fbf5ea] p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8c6d45]">Attached Evidence</p>
          {ticket.attachment.kind === 'image' ? (
            <img
              src={ticket.attachment.url}
              alt={ticket.attachment.name}
              className="max-h-80 w-full rounded-lg object-cover"
            />
          ) : (
            <video
              src={ticket.attachment.url}
              controls
              className="max-h-80 w-full rounded-lg bg-black object-contain"
            />
          )}
          <p className="mt-2 text-xs text-[#7c6e5c]">{ticket.attachment.name}</p>
        </div>
      )}

      {/* Status Editor */}
      {isEditing && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(statusLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNewStatus(value as TicketStatus)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    newStatus === value
                      ? statusColors[value as TicketStatus].replace('bg-', 'bg-') + ' border-current'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
              placeholder="Add notes about this ticket..."
            />
          </div>
        </div>
      )}

      {/* Admin Notes Display */}
      {!isEditing && ticket.adminNotes && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">Admin Notes:</p>
          <p className="text-sm text-blue-900">{ticket.adminNotes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{ticket.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{ticket.userName}</span>
          <Phone className="w-4 h-4 ml-4" />
          <span>{ticket.phoneNumber}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{createdDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
          </span>
          <span className="text-xs text-gray-500 font-mono">{ticket.id}</span>
        </div>
      </div>
      </div>

      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="border-[#d8ccb8] bg-[#fcf8ef] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2f3a22]">Satisfaction Lock</DialogTitle>
            <DialogDescription>
            This ticket can only be resolved with citizen consent. 
            An OTP has been generated for the citizen's phone number. Please enter the OTP to confirm resolution.
            <br/><br/>
            <i>(For development, check the server console for the simulated OTP!)</i>
          </DialogDescription>
        </DialogHeader>

          <div className="space-y-2">
            <label htmlFor={`resolve-code-${ticket.id}`} className="block text-sm font-medium text-[#4e463b]">
              Enter resolution code
            </label>
            <Input
              id={`resolve-code-${ticket.id}`}
              value={resolutionCode}
              onChange={(e) => {
                setResolutionCode(e.target.value.replace(/\D/g, ''));
                if (resolutionCodeError) {
                  setResolutionCodeError('');
                }
              }}
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="border-[#d6c8b4] bg-white"
            />
            <p className="text-xs text-[#7c6e5c]">Enter the 6-digit OTP sent to the citizen</p>
            {resolutionCodeError ? (
              <p className="text-sm text-red-600">{resolutionCodeError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setIsResolveDialogOpen(false);
                setResolutionCode('');
                setResolutionCodeError('');
              }}
              className="rounded-lg border border-[#d6c8b4] px-4 py-2 text-sm font-medium text-[#5c5246] transition-colors hover:bg-[#f2eadc]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResolveCodeSubmit}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Verify & Resolve
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
