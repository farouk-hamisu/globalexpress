import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/18502816053"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] flex items-center justify-center group"
    >
      <MessageCircle size={32} />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 bg-dark text-white text-xs font-bold py-2 px-4 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
        Need Help? Chat with Support
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-dark border-r border-t border-white/10 rotate-45"></div>
      </div>
      
      {/* Floating Animation Ping */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10"></div>
    </motion.a>
  );
};

export default WhatsAppButton;
