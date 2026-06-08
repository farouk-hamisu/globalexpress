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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:flex bg-primary text-white transition-all duration-300 ease-in-out flex-col shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarExpanded ? 'w-72' : 'w-20'}
      `}>
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/5">
          <Link to="/" className={`flex items-center space-x-3 transition-all duration-300 ${!isSidebarExpanded && 'lg:opacity-0 lg:pointer-events-none'}`}>
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="font-black tracking-tighter text-lg whitespace-nowrap">GEL <span className="text-secondary">ADMIN</span></span>
          </Link>
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              } else {
                setIsSidebarExpanded(!isSidebarExpanded);
              }
            }} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
          >
            {window.innerWidth < 1024 ? <X size={20} /> : (isSidebarExpanded ? <X size={20} /> : <Menu size={20} />)}
          </button>
        </div>

        <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all group relative ${
                  isActive 
                  ? 'bg-secondary text-primary font-black shadow-lg shadow-secondary/20' 
                  : 'hover:bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className={`transition-all duration-300 whitespace-nowrap text-sm tracking-wide ${!isSidebarExpanded && 'lg:hidden lg:opacity-0'}`}>
                  {item.label}
                </span>
                {isSidebarExpanded && isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                {!isSidebarExpanded && isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full hidden lg:block"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className={`flex items-center space-x-3 p-3.5 rounded-xl hover:bg-red-500/10 text-red-400/70 hover:text-red-400 transition-all w-full group`}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`transition-all duration-300 text-sm font-bold ${!isSidebarExpanded && 'lg:hidden lg:opacity-0'}`}>Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto flex flex-col relative bg-gray-50/50">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-primary"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] leading-none mb-1 hidden md:block">Management Console</span>
              <h1 className="text-base md:text-xl font-black text-primary uppercase tracking-tight">
                {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Super Administrator</span>
              <span className="text-[9px] text-green-500 font-bold uppercase mt-1 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div> Network Active
              </span>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-secondary shadow-xl shadow-primary/10 border-2 border-white">
              AD
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto w-full flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );

};

export default AdminLayout;
