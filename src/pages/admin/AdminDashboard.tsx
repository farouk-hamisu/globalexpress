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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Shipments</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-400 font-bold">
                  <th className="px-6 py-4">Tracking Number</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentShipments?.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{shipment.tracking_number}</td>
                    <td className="px-6 py-4 text-gray-600">{shipment.recipient_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowUpRight size={18} className="text-gray-300 hover:text-primary cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / Status */}
        <div className="space-y-6">
          <div className="bg-primary text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Need to create a shipment?</h3>
              <p className="text-white/60 text-sm mb-6">Quickly add new logistics entries to the system.</p>
              <button className="bg-secondary text-primary px-6 py-3 rounded-xl font-bold hover:bg-white transition-all w-full">
                New Shipment
              </button>
            </div>
            <Package className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-6">System Status</h3>
            <div className="space-y-4">
              <StatusItem label="Database" status="Operational" />
              <StatusItem label="Storage" status="Operational" />
              <StatusItem label="Auth Service" status="Operational" />
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
