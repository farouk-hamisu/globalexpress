import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login successful');
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden border border-white">
          <div className="bg-primary p-10 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 group-hover:rotate-12 transition-transform duration-500">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Management <span className="text-secondary">Console</span></h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Global Express Logistics</p>
            </div>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>
          </div>

          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Network Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-primary placeholder:text-gray-300"
                    placeholder="admin@globalexpress.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Access Protocol</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-primary placeholder:text-gray-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50 transform active:scale-[0.98] mt-4"
              >
                {loading ? 'Authorizing Access...' : 'Establish Connection'}
              </button>
            </form>
            
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                <Lock size={12} /> Restricted Environment
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">
          © 2026 Global Express Logistics Infrastructure
        </p>
      </div>
    </div>
  );

};

export default LoginPage;
