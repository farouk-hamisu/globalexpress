import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Wallet,
  Coins,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import FeeModal from '../../components/admin/FeeModal';
import WalletModal from '../../components/admin/WalletModal';

const AdminFees = () => {
  const [activeTab, setActiveTab] = useState<'fees' | 'payments' | 'wallets'>('fees');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(undefined);
  const [selectedWallet, setSelectedWallet] = useState<any>(undefined);
  const queryClient = useQueryClient();

  const { data: fees } = useQuery({
    queryKey: ['admin-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipment_fees')
        .select('*, shipments(tracking_number, recipient_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: submissions } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_submissions')
        .select('*, shipments(tracking_number, recipient_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: wallets } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateSubmissionStatus = useMutation({
    mutationFn: async ({ id, status, shipmentId }: { id: string, status: string, shipmentId: string }) => {
      const { error: subError } = await supabase
        .from('payment_submissions')
        .update({ status })
        .eq('id', id);
      
      if (subError) throw subError;

      if (status === 'approved') {
        const { error: feeError } = await supabase
          .from('shipment_fees')
          .update({ status: 'paid' })
          .eq('shipment_id', shipmentId);
        if (feeError) throw feeError;
      }
    },
    onSuccess: () => {
      toast.success('Status updated and fees synchronized');
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-fees'] });
    }
  });

  const deleteFee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipment_fees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Fee deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-fees'] });
    }
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Wallet deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
    }
  });

  const handleEditFee = (fee: any) => {
    setSelectedFee(fee);
    setIsFeeModalOpen(true);
  };

  const handleEditWallet = (wallet: any) => {
    setSelectedWallet(wallet);
    setIsWalletModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
          <TabButton active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} icon={<CreditCard size={18} />} label="Outstanding Fees" />
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<FileText size={18} />} label="Payment Proofs" />
          <TabButton active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} icon={<Wallet size={18} />} label="Wallet Management" />
        </div>
        {activeTab === 'fees' && (
          <div className="text-sm text-gray-500 font-medium italic">
            * Fees can also be added directly within each shipment's edit form.
          </div>
        )}
      </div>

      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-primary uppercase tracking-wider text-sm">Global Fee Records</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Active Fees: {fees?.length || 0}</div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
                <th className="px-6 py-4">Shipment</th>
                <th className="px-6 py-4">Fee Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees?.map((fee: any) => (
                <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">
                    {fee.shipments?.tracking_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{fee.title}</div>
                    <div className="text-xs text-gray-500">{fee.description}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">${Number(fee.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      fee.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditFee(fee)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Delete this fee?')) deleteFee.mutate(fee.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions?.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Tracking Number</div>
                  <div className="font-bold text-primary">{sub.shipments?.tracking_number}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  sub.status === 'approved' ? 'bg-green-100 text-green-700' : sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {sub.status}
                </span>
              </div>
              
              <div className="p-6 space-y-4 flex-grow">
                {sub.screenshot_url && (
                  <a href={sub.screenshot_url} target="_blank" rel="noreferrer" className="block aspect-video bg-gray-100 rounded-xl overflow-hidden group relative">
                    <img src={sub.screenshot_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-sm">View Full Screenshot</span>
                    </div>
                  </a>
                )}
                
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Transaction Hash</div>
                  <div className="text-sm font-mono bg-gray-50 p-2 rounded-lg break-all">{sub.transaction_hash || 'N/A'}</div>
                </div>
                
                {sub.notes && (
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Customer Notes</div>
                    <div className="text-sm text-gray-600 italic">"{sub.notes}"</div>
                  </div>
                )}
              </div>

              {sub.status === 'pending' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateSubmissionStatus.mutate({ id: sub.id, status: 'rejected', shipmentId: sub.shipment_id })}
                    className="py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => updateSubmissionStatus.mutate({ id: sub.id, status: 'approved', shipmentId: sub.shipment_id })}
                    className="py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
          {submissions?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No payment submissions to review.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Crypto Wallets</h3>
            <button 
              onClick={() => { setSelectedWallet(undefined); setIsWalletModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
            >
              <Plus size={18} /> Add Wallet
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets?.map((wallet: any) => (
              <div key={wallet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Coins className="text-secondary" />
                    </div>
                    <div>
                      <div className="font-bold text-primary">{wallet.name} ({wallet.symbol})</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{wallet.network}</div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${wallet.is_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-2">Wallet Address</div>
                  <div className="text-xs font-mono bg-gray-50 p-3 rounded-xl break-all border border-gray-100">
                    {wallet.wallet_address}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleEditWallet(wallet)}
                    className="flex-grow py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Delete this wallet?')) deleteWallet.mutate(wallet.id); }}
                    className="flex-grow py-2 bg-gray-50 text-red-500 rounded-lg font-bold text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isFeeModalOpen && (
        <FeeModal 
          fee={selectedFee}
          onClose={() => setIsFeeModalOpen(false)}
          onSuccess={() => { setIsFeeModalOpen(false); queryClient.invalidateQueries({ queryKey: ['admin-fees'] }); }}
        />
      )}

      {isWalletModalOpen && (
        <WalletModal 
          wallet={selectedWallet}
          onClose={() => setIsWalletModalOpen(false)}
          onSuccess={() => { setIsWalletModalOpen(false); queryClient.invalidateQueries({ queryKey: ['admin-wallets'] }); }}
        />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 py-3 px-6 rounded-xl transition-all font-bold text-sm ${
      active 
      ? 'bg-primary text-white shadow-md' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AdminFees;
