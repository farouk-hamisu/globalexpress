import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, 
  Search, 
  CheckCircle,
  Clock,
  Trash2,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const AdminSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ticket status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    }
  });

  const deleteTicket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('support_tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ticket deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    }
  });

  const filteredTickets = tickets?.filter(t => 
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Loading tickets...</div>
        ) : filteredTickets && filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold">
                  {ticket.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{ticket.full_name}</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={12} /> {ticket.email}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-grow">
              {ticket.tracking_number && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Related Shipment</span>
                  <span className="text-sm font-bold text-primary">{ticket.tracking_number}</span>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">{ticket.subject || 'No Subject'}</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                Received on {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus.mutate({ id: ticket.id, status: 'resolved' })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-green-200 text-green-600 rounded-lg text-xs font-bold hover:bg-green-50 transition-all"
                >
                  <CheckCircle size={14} /> Resolve
                </button>
                <button 
                  onClick={() => updateStatus.mutate({ id: ticket.id, status: 'pending' })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-yellow-200 text-yellow-600 rounded-lg text-xs font-bold hover:bg-yellow-50 transition-all"
                >
                  <Clock size={14} /> Mark Pending
                </button>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Delete this ticket?')) deleteTicket.mutate(ticket.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No support tickets found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
