import { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '../types/ticket';
import { AdminTicketCard } from './AdminTicketCard';
import { CreateUser } from './CreateUser';
import { debugAdminAuth } from '../utils/api';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Filter,
  AlertCircle,
  UserPlus,
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  tickets: Ticket[];
  accessToken: string;
  onTicketUpdate: (updatedTicket: Ticket) => void;
  onTicketDelete: (ticketId: string) => void;
  isLocalMode?: boolean;
}

type FilterStatus = 'all' | TicketStatus;

export function AdminDashboard({ tickets, accessToken, onTicketUpdate, onTicketDelete, isLocalMode = false }: AdminDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      rejected: tickets.filter(t => t.status === 'rejected').length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (filterStatus === 'all') return tickets;
    return tickets.filter(t => t.status === filterStatus);
  }, [tickets, filterStatus]);

  async function handleCheckAuth() {
    if (accessToken === 'local-mode') {
      alert('Local mode is active. No cloud admin token is being used.');
      return;
    }

    setIsCheckingAuth(true);

    try {
      const result = await debugAdminAuth(accessToken);
      alert(
        `Debug Auth Result\n\n` +
        `HTTP Status: ${result.status}\n` +
        `Success: ${result.ok ? 'Yes' : 'No'}\n\n` +
        `${JSON.stringify(result.data, null, 2)}`
      );
    } catch (error: any) {
      alert(`Debug Auth Failed\n\n${error?.message || 'Unknown error'}`);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  return (
    <div className="space-y-6">
      {isLocalMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-900 font-medium">
              Admin Dashboard - Local Mode
            </p>
            <p className="text-xs text-amber-700 mt-1">
              You can update ticket statuses and add notes. Changes are saved locally in browser storage. Deploy the backend to sync across devices.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
            filterStatus === 'all' ? 'ring-2 ring-green-600' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total</span>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
            filterStatus === 'pending' ? 'ring-2 ring-yellow-600' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Pending</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </button>

        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
            filterStatus === 'in_progress' ? 'ring-2 ring-blue-600' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">In Progress</span>
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </button>

        <button
          onClick={() => setFilterStatus('resolved')}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
            filterStatus === 'resolved' ? 'ring-2 ring-green-600' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Resolved</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
            filterStatus === 'rejected' ? 'ring-2 ring-red-600' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Rejected</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </button>
      </div>

      {/* Filter Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-800">
            {filterStatus === 'all' ? 'All Tickets' : `${filterStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tickets`}
          </span>
          <span className="text-gray-500">({filteredTickets.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckAuth}
            disabled={isCheckingAuth}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-400"
          >
            <Shield className="w-5 h-5" />
            <span>{isCheckingAuth ? 'Checking...' : 'Check Auth'}</span>
          </button>
          <button
            onClick={() => setShowCreateUser(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No tickets found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <AdminTicketCard
              key={`${ticket.id}-${ticket.updatedAt}`}
              ticket={ticket}
              accessToken={accessToken}
              onUpdate={onTicketUpdate}
              onDelete={onTicketDelete}
            />
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <CreateUser
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => setShowCreateUser(false)}
        />
      )}
    </div>
  );
}
