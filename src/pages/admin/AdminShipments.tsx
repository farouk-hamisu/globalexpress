import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Filter,
  MapPin,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ShipmentForm from '../../components/admin/ShipmentForm';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import type { Shipment } from '../../types';

const AdminShipments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | undefined>(undefined);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openForm) {
      handleCreate();
      // Clear state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['admin-shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Shipment deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsFormOpen(true);
  };

  const handleUpdateStatus = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsStatusModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedShipment(undefined);
    setIsFormOpen(true);
  };

  const filteredShipments = shipments?.filter(s => 
    s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="relative flex-grow max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Tracking, Sender or Recipient..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
            <Filter size={14} /> Filter
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-dark transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus size={14} /> New Shipment
          </button>
        </div>
      </div>

      {/* Shipments Table Container */}
      <div className="bg-transparent md:bg-white md:rounded-[2rem] md:shadow-sm md:border md:border-gray-100 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-20 text-center text-gray-500 font-bold animate-pulse">Synchronizing Global Network...</div>
        ) : filteredShipments && filteredShipments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em] border-b border-gray-100">
                    <th className="px-8 py-6">Shipment Details</th>
                    <th className="px-8 py-6">Route Protocol</th>
                    <th className="px-8 py-6 text-center">Network Status</th>
                    <th className="px-8 py-6">Current Hub</th>
                    <th className="px-8 py-6">Manifested</th>
                    <th className="px-8 py-6 text-right">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-primary text-sm tracking-tight">{shipment.tracking_number}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-2">
                          <Package size={10} className="text-secondary" /> {shipment.package_name || 'Unlabeled Cargo'}
                        </div>
                        <div className="text-[10px] font-black text-primary/40 mt-1 uppercase tracking-tighter">
                          {shipment.weight} • {shipment.shipping_method}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-bold flex items-center gap-2 text-gray-600">
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                            <span className="text-[9px] text-gray-400 uppercase w-8">From:</span> {shipment.sender_name}
                          </div>
                          <div className="text-xs font-bold flex items-center gap-2 text-gray-600">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-[9px] text-gray-400 uppercase w-8">To:</span> {shipment.recipient_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          shipment.status === 'Delivered' 
                          ? 'bg-green-500 text-white shadow-green-200' 
                          : 'bg-primary text-white shadow-primary/20'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 italic">
                          <MapPin size={12} className="text-secondary shrink-0" />
                          {shipment.current_location || 'Transit Hub'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleUpdateStatus(shipment)}
                            className="p-2.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all"
                            title="Update Status"
                          >
                            <History size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(shipment)}
                            className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            title="Edit Manifest"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('IRREVERSIBLE: Delete this shipment record?')) {
                                deleteMutation.mutate(shipment.id);
                              }
                            }}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Purge Record"
                          >
                            <Trash2 size={16} />
                          </button>
                          <a 
                            href={`/track/${shipment.tracking_number}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            title="Public View"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-1">
              {filteredShipments.map((shipment) => (
                <div key={shipment.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Tracking Number</div>
                      <div className="font-black text-primary text-base">{shipment.tracking_number}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-2">
                        <Package size={10} className="text-secondary" /> {shipment.package_name || 'Unlabeled'}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      shipment.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
                    <div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Origin</div>
                      <div className="text-xs font-bold text-gray-600 truncate">{shipment.sender_name}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</div>
                      <div className="text-xs font-bold text-gray-600 truncate">{shipment.recipient_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tight">
                      <MapPin size={12} className="text-secondary" />
                      {shipment.current_location || 'Transit'}
                    </div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                      {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <button 
                      onClick={() => handleUpdateStatus(shipment)}
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all"
                    >
                      <History size={18} />
                      <span className="text-[8px] font-black uppercase mt-1">Status</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(shipment)}
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Edit size={18} />
                      <span className="text-[8px] font-black uppercase mt-1">Edit</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('IRREVERSIBLE: Delete this shipment?')) {
                          deleteMutation.mutate(shipment.id);
                        }
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                      <span className="text-[8px] font-black uppercase mt-1">Delete</span>
                    </button>
                    <a 
                      href={`/track/${shipment.tracking_number}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <ExternalLink size={18} />
                      <span className="text-[8px] font-black uppercase mt-1">View</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (

          <div className="p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Zero Shipments Detected</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-3 text-sm font-medium leading-relaxed">
              {searchTerm ? `No records matched your query for "${searchTerm}". Verify tracking ID and try again.` : "The global manifest is currently empty. Initialize the network by creating your first shipment."}
            </p>
          </div>
        )}
      </div>

      {/* Shipment Form Modal */}
      {isFormOpen && (
        <ShipmentForm 
          shipment={selectedShipment}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
          }}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedShipment && (
        <StatusUpdateModal 
          shipment={selectedShipment}
          onClose={() => setIsStatusModalOpen(false)}
          onSuccess={() => {
            setIsStatusModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
          }}
        />
      )}
    </div>
  );
};

export default AdminShipments;
