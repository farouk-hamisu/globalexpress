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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search tickets by name, email or tracking..." 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="px-2">
          <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Active Support Queue: {filteredTickets?.length || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {isLoading ? (
          <div className="col-span-full py-32 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Synchronizing Support Feed...</div>
        ) : filteredTickets && filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-secondary font-black text-xl shadow-lg shadow-primary/20 border-2 border-white">
                  {ticket.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-primary text-base tracking-tight">{ticket.full_name}</h3>
                  <div className="text-[11px] text-gray-400 font-bold flex items-center gap-2 mt-1">
                    <Mail size={12} className="text-secondary" /> {ticket.email}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                ticket.status === 'resolved' ? 'bg-green-500 text-white' : ticket.status === 'pending' ? 'bg-primary text-white' : 'bg-secondary text-primary'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-6 flex-grow">
              {ticket.tracking_number && (
                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Related Manifest</span>
                  <span className="text-sm font-black text-secondary tracking-wider">{ticket.tracking_number}</span>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-2">{ticket.subject || 'UNTITLED INQUIRY'}</h4>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                    {ticket.message}
                  </p>
                </div>
              </div>
              
              <div className="text-[10px] text-gray-300 font-black uppercase tracking-tighter flex items-center gap-2">
                <Clock size={12} /> Received: {format(new Date(ticket.created_at), 'MMM dd, yyyy • HH:mm')}
              </div>
            </div>

            <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => updateStatus.mutate({ id: ticket.id, status: 'resolved' })}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3 bg-white border border-green-200 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all shadow-sm"
                >
                  <CheckCircle size={14} /> Resolve
                </button>
                <button 
                  onClick={() => updateStatus.mutate({ id: ticket.id, status: 'pending' })}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3 bg-white border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all shadow-sm"
                >
                  <Clock size={14} /> Pending
                </button>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('IRREVERSIBLE: Purge this support ticket?')) deleteTicket.mutate(ticket.id);
                }}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-inner">
            <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Support Queue Clear</p>
          </div>
        )}
      </div>
    </div>
  );

};

export default AdminSupport;
