import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-secondary" />
              <span className="text-xl font-bold tracking-tight">GLOBAL EXPRESS</span>
            </div>
            <p className="text-gray-400">
              Leading the world in logistics and international shipping solutions. Fast, secure, and reliable delivery worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-secondary hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-secondary hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-secondary w-fit pb-1">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-secondary transition-colors">Home</Link></li>
              <li><Link to="/track" className="text-gray-400 hover:text-secondary transition-colors">Track Shipment</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-secondary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-secondary w-fit pb-1">Our Services</h3>
            <ul className="space-y-3">
              <li className="text-gray-400 hover:text-secondary cursor-pointer transition-colors">Air Freight</li>
              <li className="text-gray-400 hover:text-secondary cursor-pointer transition-colors">Ocean Freight</li>
              <li className="text-gray-400 hover:text-secondary cursor-pointer transition-colors">Road Transport</li>
              <li className="text-gray-400 hover:text-secondary cursor-pointer transition-colors">Warehousing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-secondary w-fit pb-1">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>123 Logistics Way, Shipping City, World 54321</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <a href="https://wa.me/18502816053" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">+1 (850) 281-6053</a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>support@globalexpress.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Global Express Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
