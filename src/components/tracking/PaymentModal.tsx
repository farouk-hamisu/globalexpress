import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, Camera, Hash, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const paymentSchema = z.object({
  transaction_hash: z.string().min(10, 'Please enter a valid transaction hash'),
  notes: z.string().optional(),
});

type PaymentValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  shipmentId: string;
  onClose: () => void;
}

const PaymentModal = ({ shipmentId, onClose }: PaymentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema)
  });

  const onSubmit = async (values: PaymentValues) => {
    setUploading(true);
    try {
      let screenshot_url = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);
        
        screenshot_url = publicUrl;
      }

      const { error } = await supabase
        .from('payment_submissions')
        .insert([{
          shipment_id: shipmentId,
          transaction_hash: values.transaction_hash,
          notes: values.notes,
          screenshot_url,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Payment proof submitted successfully! Our team will verify it shortly.');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Submit Payment Proof</h2>
            <p className="text-white/60 text-xs mt-1">Provide details of your transaction for verification.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Hash size={16} className="text-secondary" /> Transaction Hash / ID
            </label>
            <input 
              {...register('transaction_hash')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
              placeholder="Enter your crypto transaction hash"
            />
            {errors.transaction_hash && <p className="text-red-500 text-xs mt-1">{errors.transaction_hash.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Camera size={16} className="text-secondary" /> Upload Screenshot (Optional)
            </label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center group-hover:border-primary transition-colors bg-gray-50">
                <Camera className="text-gray-400 group-hover:text-primary mb-2" size={32} />
                <span className="text-sm font-medium text-gray-500 group-hover:text-primary">
                  {file ? file.name : 'Click or drag to upload screenshot'}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-secondary" /> Additional Notes
            </label>
            <textarea 
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Any extra information for our finance team..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? 'Submitting...' : (
              <>
                Confirm Submission <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
