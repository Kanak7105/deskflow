import React, { useState, useEffect, useCallback } from 'react';
import { getTickets, getStats, createTicket, updateTicketStatus } from './api';
import FilterBar from './components/FilterBar';
import StatsStrip from './components/StatsStrip';
import TicketCard from './components/TicketCard';
import CreateTicketForm from './components/CreateTicketForm';
import { Toaster, toast } from 'react-hot-toast';

const STATUS_COLUMNS = [
  { id: 'open', title: 'Open', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { id: 'resolved', title: 'Resolved', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { id: 'closed', title: 'Closed', color: 'bg-gray-50 border-gray-200 text-gray-800' }
];

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ priority: '', breached: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        getTickets(filters),
        getStats()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTicket = async (data) => {
    const newTicket = await createTicket(data);
    toast.success('Ticket created successfully!');
    fetchData(); // Refresh to update stats and board
  };

  const handleMoveTicket = async (id, newStatus) => {
    if (!newStatus) return;
    
    // Optimistic update
    const previousTickets = [...tickets];
    setTickets(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    
    try {
      await updateTicketStatus(id, newStatus);
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
      fetchData(); // Refresh to update stats and recalculated times
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to move ticket');
      setTickets(previousTickets); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        onNewTicket={() => setIsModalOpen(true)} 
      />
      
      <StatsStrip stats={stats} />

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full items-start w-max min-w-full">
          {STATUS_COLUMNS.map(col => {
            const columnTickets = tickets.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col w-80 max-h-full bg-gray-100/50 rounded-2xl border border-gray-200/60 overflow-hidden">
                <div className={`px-4 py-3 border-b flex justify-between items-center ${col.color}`}>
                  <h2 className="font-bold text-sm tracking-wide uppercase">{col.title}</h2>
                  <span className="bg-white/60 text-current text-xs font-bold px-2 py-0.5 rounded-full">
                    {columnTickets.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {loading && tickets.length === 0 ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-white/60 rounded-xl border border-gray-100"></div>
                      ))}
                    </div>
                  ) : columnTickets.length > 0 ? (
                    columnTickets.map(ticket => (
                      <TicketCard 
                        key={ticket._id} 
                        ticket={ticket} 
                        onMove={handleMoveTicket} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-400 font-medium">
                      No tickets
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CreateTicketForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateTicket} 
      />
    </div>
  );
}

export default App;
