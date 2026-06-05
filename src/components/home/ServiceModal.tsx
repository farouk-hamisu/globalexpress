import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Globe, Shield, Clock } from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    title: string;
    desc: string;
    details: string[];
    image: string;
  } | null;
}

const ServiceModal = ({ isOpen, onClose, service }: ServiceModalProps) => {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-accent rounded-full text-primary hover:bg-secondary transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-auto relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>
              
              <div className="p-12">
                <div className="flex items-center space-x-2 text-secondary mb-4">
                  <Globe size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Premium Service</span>
                </div>
                
                <h2 className="text-4xl font-black text-primary mb-6 tracking-tighter uppercase">{service.title}</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-10 italic">
                  {service.desc}
                </p>

                <div className="space-y-4 mb-10">
                  {service.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start space-x-3 group">
                      <div className="mt-1">
                        <CheckCircle2 size={18} className="text-secondary" />
                      </div>
                      <span className="text-primary font-bold">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent p-4 rounded-2xl border border-gray-100">
                    <Shield size={20} className="text-secondary mb-2" />
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security</div>
                    <div className="text-sm font-black text-primary">Full Insurance</div>
                  </div>
                  <div className="bg-accent p-4 rounded-2xl border border-gray-100">
                    <Clock size={20} className="text-secondary mb-2" />
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Speed</div>
                    <div className="text-sm font-black text-primary">Priority Transit</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal;
