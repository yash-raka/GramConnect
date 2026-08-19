import { useState } from 'react';
import { 
  Construction, 
  Droplet, 
  Zap, 
  Trash2, 
  Lightbulb, 
  Waves,
  AlertCircle,
  User,
  Phone,
  MapPin,
  ImagePlus,
  Video,
  X
} from 'lucide-react';
import { Ticket, TicketAttachment, TicketCategory, TicketPriority } from '../types/ticket';

interface TicketFormProps {
  onSubmit: (ticket: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

const categories = [
  { value: 'road' as TicketCategory, label: 'Road & Potholes', icon: Construction },
  { value: 'water' as TicketCategory, label: 'Water Supply', icon: Droplet },
  { value: 'electricity' as TicketCategory, label: 'Electricity', icon: Zap },
  { value: 'sanitation' as TicketCategory, label: 'Sanitation', icon: Trash2 },
  { value: 'street_light' as TicketCategory, label: 'Street Light', icon: Lightbulb },
  { value: 'drainage' as TicketCategory, label: 'Drainage', icon: Waves },
  { value: 'other' as TicketCategory, label: 'Other', icon: AlertCircle },
];

const priorities = [
  { value: 'low' as TicketPriority, label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium' as TicketPriority, label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high' as TicketPriority, label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent' as TicketPriority, label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export function TicketForm({ onSubmit }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as TicketCategory,
    priority: 'medium' as TicketPriority,
    location: '',
    userName: '',
    phoneNumber: '',
    attachment: undefined as TicketAttachment | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError('');

    if (!file) {
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadError('Please upload an image or video file.');
      e.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Please keep the file under 8 MB for smooth upload and storage.');
      e.target.value = '';
      return;
    }

    try {
      const url = await fileToDataUrl(file);
      setFormData((current) => ({
        ...current,
        attachment: {
          kind: isVideo ? 'video' : 'image',
          name: file.name,
          url,
        },
      }));
    } catch (error: any) {
      setUploadError(error?.message || 'Failed to process file.');
    } finally {
      e.target.value = '';
    }
  }

  function handleRemoveAttachment() {
    setFormData((current) => ({ ...current, attachment: undefined }));
    setUploadError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '' as TicketCategory,
        priority: 'medium',
        location: '',
        userName: '',
        phoneNumber: '',
        attachment: undefined,
      });
      setUploadError('');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.category && 
    formData.location && formData.userName && formData.phoneNumber;

  return (
    <div className="village-panel rounded-[28px] p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#aa6b28]">Public Issue Form</p>
          <h2 className="village-title text-2xl font-bold text-[#2f3a22]">Report a village concern</h2>
          <p className="village-subtle mt-2 text-sm">Share the issue clearly so the Panchayat team can respond faster.</p>
        </div>
        <div className="rounded-3xl bg-[#e6f0db] px-4 py-3 text-sm text-[#4f6d3a]">
          Simple details are enough to start action.
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Your Name *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full rounded-2xl border border-[#d7c7ab] bg-white/90 px-4 py-3 focus:border-[#7ba35a] focus:ring-2 focus:ring-[#cfe3bf]"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full rounded-2xl border border-[#d7c7ab] bg-white/90 px-4 py-3 focus:border-[#7ba35a] focus:ring-2 focus:ring-[#cfe3bf]"
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* Issue Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-2xl border border-[#d7c7ab] bg-white/90 px-4 py-3 focus:border-[#7ba35a] focus:ring-2 focus:ring-[#cfe3bf]"
            placeholder="e.g., Large pothole on main road"
            required
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Issue Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`rounded-3xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                    formData.category === cat.value
                      ? 'border-[#6f9850] bg-[#e9f4df] text-[#50723a]'
                      : 'border-[#e1d3ba] bg-white/80 text-[#665844] hover:border-[#d3b58d]'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs text-center font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-[#d7c7ab] bg-white/90 px-4 py-3 focus:border-[#7ba35a] focus:ring-2 focus:ring-[#cfe3bf] resize-none"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full rounded-2xl border border-[#d7c7ab] bg-white/90 px-4 py-3 focus:border-[#7ba35a] focus:ring-2 focus:ring-[#cfe3bf]"
            placeholder="e.g., Near village temple, Main road"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photo or Video Evidence
          </label>
          <div className="rounded-[24px] border border-dashed border-[#cfbd9d] bg-[#fffaf1] p-4">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[20px] bg-[#f4ead7] px-4 py-4 transition-colors hover:bg-[#ecdfc7]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <ImagePlus className="h-5 w-5 text-[#7b6a4f]" />
                </div>
                <div>
                  <p className="font-semibold text-[#524632]">Upload image or video</p>
                  <p className="text-sm text-[#7b6d57]">Helpful for potholes, water leaks, damaged lights, and similar issues.</p>
                </div>
              </div>
              <span className="rounded-full bg-[#5d7f46] px-4 py-2 text-sm font-semibold text-white">Choose File</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleAttachmentChange}
                className="hidden"
              />
            </label>

            {uploadError && (
              <p className="mt-3 text-sm font-medium text-red-600">{uploadError}</p>
            )}

            {formData.attachment && (
              <div className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#3f3427]">{formData.attachment.name}</p>
                    <p className="text-sm text-[#7a6e5a]">
                      {formData.attachment.kind === 'video' ? 'Video attachment' : 'Image attachment'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="rounded-full bg-[#efe3d0] p-2 text-[#6e5f49] transition-colors hover:bg-[#e3d3bb]"
                    title="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {formData.attachment.kind === 'image' ? (
                  <img
                    src={formData.attachment.url}
                    alt="Issue attachment preview"
                    className="max-h-72 w-full rounded-[18px] object-cover"
                  />
                ) : (
                  <video
                    src={formData.attachment.url}
                    controls
                    className="max-h-72 w-full rounded-[18px] bg-black object-contain"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="flex flex-wrap gap-3">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: priority.value })}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  formData.priority === priority.value
                    ? `${priority.color} ring-2 ring-offset-2 ring-current`
                    : 'bg-[#efe6d7] text-[#6b5d48] hover:bg-[#e4d7c1]'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full rounded-full py-3 px-6 font-semibold transition-all ${
            isFormValid && !isSubmitting
              ? 'bg-[#5d7f46] text-white hover:bg-[#4f6d3a] shadow-md hover:shadow-lg'
              : 'bg-[#d9d0c0] text-[#8b7f6b] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
