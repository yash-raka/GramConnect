import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { Ticket } from '../types/ticket';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { isBackendAvailable } from '../utils/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  tickets?: Ticket[];
}

const categoryLabels = {
  road: 'Road & Potholes',
  water: 'Water Supply',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  street_light: 'Street Light',
  drainage: 'Drainage',
  other: 'Other',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I can help you check the status of your submitted tickets. Please provide your Ticket ID or Phone Number.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function searchTickets(query: string): Promise<Ticket[]> {
    // Check if backend is available
    const backendOnline = await isBackendAvailable();
    
    if (!backendOnline) {
      // Local mode - search from localStorage
      try {
        const stored = localStorage.getItem('gramconnect_tickets');
        const allTickets: Ticket[] = stored ? JSON.parse(stored) : [];
        
        const matchingTickets = allTickets.filter(ticket => {
          const matchesId = ticket.id.toLowerCase().includes(query.toLowerCase());
          const matchesPhone = ticket.phoneNumber && ticket.phoneNumber.includes(query);
          return matchesId || matchesPhone;
        });

        return matchingTickets;
      } catch (error) {
        console.error('Error searching local tickets:', error);
        return [];
      }
    }

    // Production mode - use Supabase API
    try {
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/ticket-server`;
      const response = await fetch(`${API_BASE}/tickets/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to search tickets');
      }

      const data = await response.json();
      return data.tickets;
    } catch (error) {
      console.error('Error searching tickets from backend, falling back to local:', error);
      
      // Fallback to local search
      try {
        const stored = localStorage.getItem('gramconnect_tickets');
        const allTickets: Ticket[] = stored ? JSON.parse(stored) : [];
        
        const matchingTickets = allTickets.filter(ticket => {
          const matchesId = ticket.id.toLowerCase().includes(query.toLowerCase());
          const matchesPhone = ticket.phoneNumber && ticket.phoneNumber.includes(query);
          return matchesId || matchesPhone;
        });

        return matchingTickets;
      } catch (localError) {
        console.error('Error searching local tickets:', localError);
        return [];
      }
    }
  }

  async function handleSend() {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const tickets = await searchTickets(inputValue.trim());

      let botResponse: Message;

      if (tickets.length === 0) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: 'I couldn\'t find any tickets matching your query. Please check your Ticket ID or Phone Number and try again. Make sure you enter the complete information.',
          sender: 'bot',
          timestamp: new Date(),
        };
      } else if (tickets.length === 1) {
        const ticket = tickets[0];
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: `I found your ticket! Here are the details:`,
          sender: 'bot',
          timestamp: new Date(),
          tickets: [ticket],
        };
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: `I found ${tickets.length} tickets associated with this information:`,
          sender: 'bot',
          timestamp: new Date(),
          tickets: tickets,
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while searching for your tickets. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 z-50"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-2">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">GramConnect Assistant</h3>
                <p className="text-xs text-green-100">Check your ticket status</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-700 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'bot' && (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                      <p className="text-sm">{message.text}</p>
                      {message.sender === 'user' && (
                        <User className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Tickets */}
                {message.tickets && message.tickets.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {message.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">{ticket.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{ticket.description}</p>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <p><strong>Category:</strong> {categoryLabels[ticket.category]}</p>
                          <p><strong>Location:</strong> {ticket.location}</p>
                          <p><strong>Ticket ID:</strong> {ticket.id}</p>
                          <p><strong>Submitted:</strong> {formatDate(ticket.createdAt)}</p>
                          <p><strong>Last Updated:</strong> {formatDate(ticket.updatedAt)}</p>
                          {ticket.adminNotes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-500">
                              <p className="text-blue-900"><strong>Admin Notes:</strong> {ticket.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter Ticket ID or Phone Number..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  inputValue.trim() && !isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Enter your full ticket ID (e.g., TICKET-1234567890) or your registered phone number
            </p>
          </div>
        </div>
      )}
    </>
  );
}