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
import { useState } from 'react';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Tracking or Recipient..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg ml-auto md:ml-0"
          >
            <Plus size={18} /> New Shipment
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-500">Loading shipments...</div>
        ) : filteredShipments && filteredShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Shipment Info</th>
                  <th className="px-6 py-4">Sender & Recipient</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{shipment.tracking_number}</div>
                      <div className="text-xs text-gray-500 mt-1">{shipment.package_name || 'Generic Package'}</div>
                      <div className="text-xs font-medium text-gray-400">{shipment.weight} • {shipment.shipping_method}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span className="w-4 text-gray-400 text-[10px] uppercase">From:</span> {shipment.sender_name}
                        </div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span className="w-4 text-gray-400 text-[10px] uppercase">To:</span> {shipment.recipient_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        shipment.status === 'Delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {shipment.current_location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(shipment)}
                          className="p-2 text-gray-400 hover:text-secondary transition-colors"
                          title="Update Status"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(shipment)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this shipment?')) {
                              deleteMutation.mutate(shipment.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        <a 
                          href={`/track/${shipment.tracking_number}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-secondary transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">No Shipments Found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              {searchTerm ? `No results for "${searchTerm}". Try a different search.` : "You haven't created any shipments yet."}
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
