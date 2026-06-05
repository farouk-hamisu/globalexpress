import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  Globe,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
    } else {
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Package size={20} />, label: 'Shipments', path: '/admin/shipments' },
    { icon: <CreditCard size={20} />, label: 'Fees & Payments', path: '/admin/fees' },
    { icon: <MessageSquare size={20} />, label: 'Support Tickets', path: '/admin/support' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-primary text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <Link to="/" className={`flex items-center space-x-2 ${!isSidebarOpen && 'hidden'}`}>
            <Globe className="w-6 h-6 text-secondary" />
            <span className="font-bold tracking-tight">GEL ADMIN</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-secondary text-primary font-bold shadow-lg' 
                : 'hover:bg-white/10'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span>{item.label}</span>}
              {isSidebarOpen && location.pathname === item.path && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-all w-full`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Administrator</span>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
              AD
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
