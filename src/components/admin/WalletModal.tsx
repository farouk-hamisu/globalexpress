import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Coins, Globe, Hash, QrCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const walletSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  wallet_address: z.string().min(10, 'Address is required'),
  network: z.string().min(1, 'Network is required'),
  is_enabled: z.boolean().default(true),
});

type WalletValues = z.infer<typeof walletSchema>;

interface WalletModalProps {
  wallet?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const WalletModal = ({ wallet, onClose, onSuccess }: WalletModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>({
    resolver: zodResolver(walletSchema),
    defaultValues: wallet ? {
      name: wallet.name,
      symbol: wallet.symbol,
      wallet_address: wallet.wallet_address,
      network: wallet.network,
      is_enabled: wallet.is_enabled
    } : {
      is_enabled: true,
      network: 'Mainnet'
    }
  });

  const onSubmit = async (values: WalletValues) => {
    setUploading(true);
    try {
      let qr_code_url = wallet?.qr_code_url || '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${values.symbol}-${Math.random()}.${fileExt}`;
        const filePath = `wallets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('site-assets')
          .getPublicUrl(filePath);
        
        qr_code_url = publicUrl;
      }

      if (wallet) {
        const { error } = await supabase
          .from('payment_methods')
          .update({ ...values, qr_code_url })
          .eq('id', wallet.id);
        if (error) throw error;
        toast.success('Wallet updated successfully');
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([{ ...values, qr_code_url }]);
        if (error) throw error;
        toast.success('Wallet added successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{wallet ? 'Edit Wallet' : 'Add Crypto Wallet'}</h2>
            <p className="text-white/60 text-xs mt-1">Configure your accepted payment methods.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Coins size={16} className="text-secondary" /> Asset Name
              </label>
              <input 
                {...register('name')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Bitcoin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-secondary" /> Symbol
              </label>
              <input 
                {...register('symbol')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none uppercase"
                placeholder="BTC"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Globe size={16} className="text-secondary" /> Network
            </label>
            <input 
              {...register('network')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Mainnet, ERC20, BEP20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Hash size={16} className="text-secondary" /> Wallet Address
            </label>
            <input 
              {...register('wallet_address')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
              placeholder="Enter receiving address"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <QrCode size={16} className="text-secondary" /> QR Code Image
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-dashed border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
            <input 
              type="checkbox" 
              id="is_enabled"
              {...register('is_enabled')}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_enabled" className="text-sm font-bold text-gray-700">Enable this payment method</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-grow py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || uploading}
              className="flex-grow bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting || uploading ? 'Processing...' : 'Save Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletModal;
