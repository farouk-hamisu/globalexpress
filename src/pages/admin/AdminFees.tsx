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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-full sm:w-fit overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} icon={<CreditCard size={18} />} label="Fees" />
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<FileText size={18} />} label="Proofs" />
          <TabButton active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} icon={<Wallet size={18} />} label="Wallets" />
        </div>
        {activeTab === 'fees' && (
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic px-2">
            * Direct fee injection available in shipment manifest
          </div>
        )}
      </div>

      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-primary uppercase tracking-widest text-sm">Global Fee Records</h3>
            <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Total Active: {fees?.length || 0}</div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
                  <th className="px-8 py-5">Shipment</th>
                  <th className="px-8 py-5">Fee Details</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Due Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fees?.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-black text-primary text-sm tracking-tight">
                      {fee.shipments?.tracking_number}
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-800 text-xs">{fee.title}</div>
                      <div className="text-[10px] text-gray-400 font-bold truncate max-w-xs">{fee.description}</div>
                    </td>
                    <td className="px-8 py-5 font-black text-primary text-sm">${Number(fee.amount).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        fee.status === 'paid' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-8 py-5 text-right">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {fees?.map((fee: any) => (
              <div key={fee.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Manifest ID</div>
                    <div className="font-black text-primary text-sm">{fee.shipments?.tracking_number}</div>
                  </div>
                  <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    fee.status === 'paid' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                  }`}>
                    {fee.status}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-gray-800 mb-1">{fee.title}</div>
                  <div className="text-[10px] text-gray-500 leading-relaxed italic">"{fee.description}"</div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</div>
                    <div className="text-sm font-black text-primary">${Number(fee.amount).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</div>
                    <div className="text-xs font-bold text-gray-600">
                      {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleEditFee(fee)} className="flex-grow py-3 bg-gray-50 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100">
                    <Edit size={14} /> Adjust Fee
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Delete this fee?')) deleteFee.mutate(fee.id); }}
                    className="px-4 py-3 bg-red-50 text-red-500 rounded-xl transition-colors border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions?.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                <div>
                  <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Tracking Matrix</div>
                  <div className="font-black text-primary text-sm">{sub.shipments?.tracking_number}</div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                  sub.status === 'approved' ? 'bg-green-500 text-white' : sub.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                }`}>
                  {sub.status}
                </span>
              </div>
              
              <div className="p-6 space-y-6 flex-grow">
                {sub.screenshot_url && (
                  <a href={sub.screenshot_url} target="_blank" rel="noreferrer" className="block aspect-video bg-gray-100 rounded-2xl overflow-hidden group relative shadow-inner">
                    <img src={sub.screenshot_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/30 px-4 py-2 rounded-xl">Expand Proof</span>
                    </div>
                  </a>
                )}
                
                <div>
                  <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Transaction Hash</div>
                  <div className="text-[10px] font-mono bg-gray-50 p-3 rounded-xl break-all border border-gray-100 font-bold text-primary">{sub.transaction_hash || 'UNAVAILABLE'}</div>
                </div>
                
                {sub.notes && (
                  <div>
                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">User Intelligence</div>
                    <div className="text-xs text-gray-600 italic font-medium">"{sub.notes}"</div>
                  </div>
                )}
              </div>

              {sub.status === 'pending' && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateSubmissionStatus.mutate({ id: sub.id, status: 'rejected', shipmentId: sub.shipment_id })}
                    className="py-3 bg-white border border-red-200 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => updateSubmissionStatus.mutate({ id: sub.id, status: 'approved', shipmentId: sub.shipment_id })}
                    className="py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-dark transition-all shadow-lg shadow-primary/20"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
          {submissions?.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-gray-100">
              <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Zero Payment Submissions Detected</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-primary uppercase tracking-widest text-sm">Crypto Infrastructure</h3>
            <button 
              onClick={() => { setSelectedWallet(undefined); setIsWalletModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-dark transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> Initialize Wallet
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets?.map((wallet: any) => (
              <div key={wallet.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-inner">
                      <Coins className="text-secondary w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-black text-primary text-base tracking-tight">{wallet.name} <span className="text-secondary">({wallet.symbol})</span></div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{wallet.network} Network</div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full shadow-lg ${wallet.is_enabled ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}></div>
                </div>
                
                <div>
                  <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-3">Network Address</div>
                  <div className="text-[10px] font-mono bg-gray-50 p-4 rounded-2xl break-all border border-gray-100 font-bold text-primary shadow-inner">
                    {wallet.wallet_address}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleEditWallet(wallet)}
                    className="py-3 bg-gray-50 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100"
                  >
                    <Edit size={14} /> Adjust
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Delete this wallet?')) deleteWallet.mutate(wallet.id); }}
                    className="py-3 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                  >
                    <Trash2 size={14} /> Purge
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
