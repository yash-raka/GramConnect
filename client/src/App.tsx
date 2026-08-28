import { useState, useEffect } from 'react';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { Chatbot } from './components/Chatbot';
import { Ticket } from './types/ticket';
import { fetchTickets, createTicket } from './utils/api';

type ViewMode = 'user' | 'admin';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeView, setActiveView] = useState<'form' | 'list'>('form');
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets().then(() => setLoading(false));
  }, []);

  async function loadTickets() {
    try {
      const fetchedTickets = await fetchTickets();
      setTickets(fetchedTickets);
    } catch (error: any) {
      console.error('Failed to load tickets:', error);
    }
  }

  async function handleSubmitTicket(ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      const newTicket = await createTicket(ticketData);
      setTickets([newTicket, ...tickets]);
      setActiveView('list');
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    }
  }

  function handleAdminLogout() {
    setViewMode('user');
  }

  function handleTicketUpdate(updatedTicket: Ticket) {
    setTickets((current) =>
      current.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  }

  function handleTicketDelete(ticketId: string) {
    setTickets((currentTickets) =>
      currentTickets.filter((ticket) => ticket.id !== ticketId)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="village-shell min-h-screen bg-transparent">
      <Header onAdminToggle={() => setViewMode(viewMode === 'admin' ? 'user' : 'admin')} isAdminView={viewMode === 'admin'} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <section className="village-panel mb-6 overflow-hidden rounded-[28px]">
          <div className="grid gap-6 px-6 py-7 md:grid-cols-[1.2fr_0.8fr] md:px-8">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full bg-[#e6f0db] px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#54733f]">
                Village Help Desk
              </p>
              <h2 className="village-title max-w-2xl text-3xl font-bold text-[#2f3a22] md:text-4xl">
                Raise local issues in a way that feels close to home.
              </h2>
              <p className="village-subtle mt-3 max-w-2xl text-sm md:text-base">
                Report water, roads, sanitation, street lights, and other Panchayat concerns through a warmer, simpler public service portal built for villagers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 self-start">
              <div className="rounded-3xl bg-[#fff3dd] p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#aa6b28]">Local Services</p>
                <p className="mt-2 text-sm text-[#6f624f]">Water, roads, lights, and sanitation in one place.</p>
              </div>
              <div className="rounded-3xl bg-[#e4f0dd] p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4f7a3a]">Village First</p>
                <p className="mt-2 text-sm text-[#546249]">Simple language and clear updates for everyday use.</p>
              </div>
            </div>
          </div>
        </section>

        {/* View Mode Toggle */}
        <div className="village-panel mb-6 rounded-[24px] p-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setViewMode('user')}
            className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all ${
              viewMode === 'user'
                ? 'bg-[#5d7f46] text-white shadow-md'
                : 'bg-[#efe4cf] text-[#685c49] hover:bg-[#e7dbc4]'
            }`}
          >
            <span>🏡</span>
            Citizen View
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all ${
              viewMode === 'admin'
                ? 'bg-[#5d7f46] text-white shadow-md'
                : 'bg-[#efe4cf] text-[#685c49] hover:bg-[#e7dbc4]'
            }`}
          >
            <span>🛡️</span>
            Admin View
          </button>
        </div>

        {/* Content */}
        {viewMode === 'user' ? (
          <>
            {/* Tab Navigation */}
            <div className="village-panel rounded-[24px] p-2 flex gap-2">
              <button
                onClick={() => setActiveView('form')}
                className={`flex-1 rounded-[18px] py-3 px-6 font-semibold transition-all ${
                  activeView === 'form'
                    ? 'bg-[#5d7f46] text-white shadow-md'
                    : 'bg-[#f8f1e5] text-[#6b5e49] hover:bg-[#efe3d1]'
                }`}
              >
                Raise Ticket
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`flex-1 rounded-[18px] py-3 px-6 font-semibold transition-all ${
                  activeView === 'list'
                    ? 'bg-[#5d7f46] text-white shadow-md'
                    : 'bg-[#f8f1e5] text-[#6b5e49] hover:bg-[#efe3d1]'
                }`}
              >
                All Tickets
              </button>
            </div>

            {activeView === 'form' ? (
              <TicketForm onSubmit={handleSubmitTicket} />
            ) : (
              <TicketList tickets={tickets} />
            )}
          </>
        ) : (
          <AdminDashboard
            tickets={tickets}
            accessToken="local-mode"
            onTicketUpdate={handleTicketUpdate}
            onTicketDelete={handleTicketDelete}
            isLocalMode
          />
        )}
      </main>

      {/* Chatbot - Available in user view only */}
      {viewMode === 'user' && <Chatbot />}
    </div>
  );
}
