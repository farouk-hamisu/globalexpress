import { Link } from 'react-router-dom';
import { Menu, X, Globe, Phone, Mail, Search } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="bg-dark text-white/70 py-2 text-xs border-b border-white/5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a href="https://wa.me/18502816053" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors">
              <Phone size={14} className="text-secondary" />
              <span>+1 (850) 281-6053</span>
            </a>
            <div className="flex items-center space-x-2">
              <Mail size={14} className="text-secondary" />
              <span>support@globalexpress.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors">
              <Globe size={14} className="text-secondary" />
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-primary text-white shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter block leading-none">GLOBAL EXPRESS</span>
              <span className="text-[10px] font-bold text-secondary tracking-widest uppercase opacity-80">Logistics Solutions</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-10 items-center font-bold text-sm uppercase tracking-wider">
            <Link to="/" className="hover:text-secondary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-secondary after:transition-all hover:after:w-full">Home</Link>
            <Link to="/track" className="hover:text-secondary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-secondary after:transition-all hover:after:w-full">Track</Link>
            <Link to="/contact" className="hover:text-secondary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-secondary after:transition-all hover:after:w-full">Contact</Link>
            
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            
            <Link to="/track" className="bg-secondary text-primary px-8 py-3 rounded-xl font-black hover:bg-white transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 flex items-center space-x-2">
              <Search size={18} />
              <span>Track Now</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-primary border-t border-white/10 px-4 py-8 space-y-6 animate-in slide-in-from-top duration-300">
            <div className="space-y-4">
              <Link to="/" className="block text-lg font-bold hover:text-secondary" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/track" className="block text-lg font-bold hover:text-secondary" onClick={() => setIsOpen(false)}>Track</Link>
              <Link to="/contact" className="block text-lg font-bold hover:text-secondary" onClick={() => setIsOpen(false)}>Contact</Link>
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4 text-sm text-white/60">
              <a href="https://wa.me/18502816053" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
                <Phone size={16} className="text-secondary" />
                <span>+1 (850) 281-6053</span>
              </a>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-secondary" />
                <span>support@globalexpress.com</span>
              </div>
            </div>
            <Link to="/track" className="block w-full bg-secondary text-primary text-center py-4 rounded-xl font-black shadow-lg" onClick={() => setIsOpen(false)}>
              TRACK YOUR SHIPMENT
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
