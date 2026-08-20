import { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '../types/ticket';
import { AdminTicketCard } from './AdminTicketCard';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Filter,
  AlertCircle,
  Map as MapIcon
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

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

      {/* Heat Map Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Real-Time Issue Heat Map</h3>
        </div>
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredTickets.map(t => {
              // Demo fallback coordinates based on ticket ID hash if lat/lng are missing
              let lat = t.lat;
              let lng = t.lng;
              if (!lat || !lng) {
                const num = parseInt(t.id.replace(/\D/g, '').slice(-4) || '1000');
                lat = 20.5937 + (num % 10 - 5) * 2;
                lng = 78.9629 + (num % 20 - 10) * 2;
              }
              const color = t.status === 'resolved' ? 'green' : t.status === 'pending' ? 'orange' : 'blue';
              
              return (
                <CircleMarker 
                  key={t.id} 
                  center={[lat, lng]} 
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                  radius={8}
                >
                  <Popup>
                    <strong>{t.title}</strong><br/>
                    Status: {t.status}<br/>
                    Location: {t.location}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
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

    </div>
  );
}
