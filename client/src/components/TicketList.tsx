import { Ticket } from '../types/ticket';
import { TicketCard } from './TicketCard';
import { FileText } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="village-panel rounded-[28px] p-12 text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-[#d1b891]" />
        <h3 className="village-title mb-2 text-2xl font-semibold text-[#4b5736]">No tickets yet</h3>
        <p className="village-subtle">
          You haven't raised any tickets yet. Start by reporting an issue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="village-panel mb-4 rounded-[24px] p-5">
        <h2 className="village-title text-xl font-semibold text-[#314026]">Your village requests</h2>
        <p className="village-subtle text-sm">Track updates on the issues you have reported to the Panchayat.</p>
      </div>
      
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
