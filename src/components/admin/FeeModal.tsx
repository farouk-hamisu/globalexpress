import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, DollarSign, FileText, Calendar, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const feeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  due_date: z.string().optional(),
  status: z.string().min(1),
});

type FeeValues = z.infer<typeof feeSchema>;

interface FeeModalProps {
  shipmentId?: string; // If provided, we're creating
  fee?: any; // If provided, we're editing
  onClose: () => void;
  onSuccess: () => void;
}

const FeeModal = ({ shipmentId, fee, onClose, onSuccess }: FeeModalProps) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FeeValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: fee ? {
      ...fee,
      due_date: fee.due_date ? new Date(fee.due_date).toISOString().split('T')[0] : '',
      amount: Number(fee.amount)
    } : {
      status: 'pending',
      amount: 0
    }
  });

  const onSubmit = async (values: FeeValues) => {
    try {
      if (fee) {
        const { error } = await supabase
          .from('shipment_fees')
          .update(values)
          .eq('id', fee.id);
        if (error) throw error;
        toast.success('Fee updated successfully');
      } else {
        const { error } = await supabase
          .from('shipment_fees')
          .insert([{ ...values, shipment_id: shipmentId }]);
        if (error) throw error;
        toast.success('Fee added successfully');
      }
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
            <h2 className="text-xl font-bold">{fee ? 'Edit Fee' : 'Add New Fee'}</h2>
            <p className="text-white/60 text-xs mt-1">Specify shipment costs for the customer.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-secondary" /> Fee Title
            </label>
            <input 
              {...register('title')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Customs Clearance Fee"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-secondary" /> Amount (USD)
              </label>
              <input 
                type="number" step="any"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-secondary" /> Due Date
              </label>
              <input 
                type="date"
                {...register('due_date')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Info size={16} className="text-secondary" /> Status
            </label>
            <select 
              {...register('status')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-secondary" /> Description (Optional)
            </label>
            <textarea 
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Provide context for this fee..."
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
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeModal;
