import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, MapPin, Info, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Shipment } from '../../types';

const statusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
});

type StatusValues = z.infer<typeof statusSchema>;

interface StatusUpdateModalProps {
  shipment: Shipment;
  onClose: () => void;
  onSuccess: () => void;
}

const StatusUpdateModal = ({ shipment, onClose, onSuccess }: StatusUpdateModalProps) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<StatusValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      location: shipment.current_location || '',
      status: shipment.status
    }
  });

  const onSubmit = async (values: StatusValues) => {
    try {
      // 1. Add to history
      const { error: historyError } = await supabase
        .from('shipment_status_history')
        .insert([{
          shipment_id: shipment.id,
          status: values.status,
          location: values.location,
          description: values.description
        }]);

      if (historyError) throw historyError;

      // 2. Update shipment main status and location
      const { error: shipmentError } = await supabase
        .from('shipments')
        .update({ 
          status: values.status,
          current_location: values.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipment.id);

      if (shipmentError) throw shipmentError;

      toast.success('Shipment status updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Update Shipment Status</h2>
            <p className="text-white/60 text-xs mt-1">{shipment.tracking_number} • {shipment.recipient_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Info size={16} className="text-secondary" /> New Status
            </label>
            <select 
              {...register('status')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Package Collected">Package Collected</option>
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Arrived At Hub">Arrived At Hub</option>
              <option value="Customs Inspection">Customs Inspection</option>
              <option value="Clearance Pending">Clearance Pending</option>
              <option value="Clearance Approved">Clearance Approved</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-secondary" /> Current Location
            </label>
            <input 
              {...register('location')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Heathrow Airport, London"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-secondary" /> Status Description (Optional)
            </label>
            <textarea 
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Provide more context about this update..."
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-grow py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-grow bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : (
                <>
                  Update Status <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
