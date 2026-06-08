import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: total },
        { count: active },
        { count: delivered },
        { count: pendingPayments }
      ] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true }),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).neq('status', 'Delivered'),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'Delivered'),
        supabase.from('shipment_fees').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        total: total || 0,
        active: active || 0,
        delivered: delivered || 0,
        pendingPayments: pendingPayments || 0
      };
    }
  });

  const { data: recentShipments } = useQuery({
    queryKey: ['recent-shipments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Shipments" 
          value={stats?.total.toString() || '0'} 
          icon={<Package className="text-blue-600" />}
          trend="+12% from last month"
          color="bg-blue-50"
        />
        <StatCard 
          title="Active Shipments" 
          value={stats?.active.toString() || '0'} 
          icon={<Truck className="text-orange-600" />}
          trend="8 in transit now"
          color="bg-orange-50"
        />
        <StatCard 
          title="Delivered" 
          value={stats?.delivered.toString() || '0'} 
          icon={<CheckCircle className="text-green-600" />}
          trend="99.2% success rate"
          color="bg-green-50"
        />
        <StatCard 
          title="Pending Payments" 
          value={stats?.pendingPayments.toString() || '0'} 
          icon={<CreditCard className="text-red-600" />}
          trend="Action required"
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-primary uppercase tracking-wider text-sm">Recent Shipments</h3>
            <button className="text-secondary text-[10px] font-black hover:text-primary transition-colors uppercase tracking-[0.2em] bg-secondary/10 px-3 py-1.5 rounded-lg">View All Manifests</button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
                    <th className="px-8 py-5">Tracking ID</th>
                    <th className="px-8 py-5">Recipient</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentShipments?.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-primary text-sm tracking-tight">{shipment.tracking_number}</td>
                      <td className="px-8 py-5 text-gray-500 font-bold text-xs">{shipment.recipient_name}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          shipment.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[11px] text-gray-400 font-black uppercase tracking-tighter">
                        {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <ArrowUpRight size={18} className="text-gray-300 group-hover:text-secondary cursor-pointer transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {recentShipments?.map((shipment) => (
              <div key={shipment.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Tracking ID</div>
                    <div className="font-bold text-primary text-sm">{shipment.tracking_number}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    shipment.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                  }`}>
                    {shipment.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</div>
                    <div className="text-xs font-bold text-gray-600 truncate">{shipment.recipient_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Manifest Date</div>
                    <div className="text-xs font-bold text-gray-600">
                      {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-gray-50 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100">
                  Inspect Details <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Status */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-3 uppercase tracking-tight">Create Manifest</h3>
              <p className="text-white/60 text-[11px] font-bold mb-8 leading-relaxed uppercase tracking-wider">Initialize new logistics entries with optimized network forms.</p>
              <button className="bg-secondary text-primary px-8 py-4 rounded-2xl font-black text-xs hover:bg-white transition-all w-full uppercase tracking-[0.2em] shadow-lg shadow-black/20 transform hover:-translate-y-1 active:scale-95">
                New Shipment
              </button>
            </div>
            <Package className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
            <h3 className="font-black text-primary uppercase tracking-widest text-xs mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> System Intelligence
            </h3>
            <div className="space-y-6">
              <StatusItem label="Cloud Database" status="Operational" />
              <StatusItem label="Neural Storage" status="Operational" />
              <StatusItem label="Auth Matrix" status="Operational" />
              <StatusItem label="Realtime API" status="Operational" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <TrendingUp size={16} className="text-green-500" />
    </div>
    <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-gray-400 text-sm font-medium mb-3">{title}</div>
    <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
      {trend}
    </div>
  </div>
);

const StatusItem = ({ label, status }: { label: string, status: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-500">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <span className="text-sm font-bold text-gray-800">{status}</span>
    </div>
  </div>
);

export default AdminDashboard;
