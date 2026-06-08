import { motion } from 'framer-motion';
import { Package, Calendar, CheckCircle2 } from 'lucide-react';

const deliveries = [
  {
    image: "/electronics.jpeg",
    type: "Electronics",
    origin: "China",
    destination: "Germany",
    status: "Delivered",
    date: "June 2, 2026"
  },
  {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    type: "Medical Equipment",
    origin: "USA",
    destination: "Canada",
    status: "Delivered",
    date: "June 1, 2026"
  },
  {
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
    type: "Industrial Machinery",
    origin: "Japan",
    destination: "Australia",
    status: "Delivered",
    date: "May 31, 2026"
  },
  {
    image: "/businessdocuments.jpeg",
    type: "Business Documents",
    origin: "United Kingdom",
    destination: "France",
    status: "Delivered",
    date: "May 30, 2026"
  },
  {
    image: "/retailsgoods.jpeg",
    type: "Retail Goods",
    origin: "Vietnam",
    destination: "Italy",
    status: "Delivered",
    date: "May 29, 2026"
  },
  {
    image: "/luxurycar.jpeg",
    type: "Luxury Automotive",
    origin: "Germany",
    destination: "UAE",
    status: "Delivered",
    date: "May 28, 2026"
  },
  {
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800",
    type: "Food & Beverage",
    origin: "Brazil",
    destination: "Netherlands",
    status: "Delivered",
    date: "May 27, 2026"
  },
  {
    image: "/pharmacy.jpeg",
    type: "Pharmaceuticals",
    origin: "Switzerland",
    destination: "South Africa",
    status: "Delivered",
    date: "May 26, 2026"
  }
];

export const RecentDeliveries = () => {
  return (
    <section className="py-32 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 tracking-tighter uppercase">Recent Successful Deliveries</h2>
            <p className="text-xl text-gray-500 font-medium italic">Thousands of packages delivered safely across the globe.</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-black text-primary uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {deliveries.map((delivery, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={delivery.image} alt={delivery.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center space-x-2">
                  <CheckCircle2 size={14} />
                  <span>{delivery.status}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-2 text-secondary mb-2">
                  <Package size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{delivery.type}</span>
                </div>
                <h3 className="text-2xl font-black text-primary mb-6 tracking-tighter uppercase">
                  {delivery.origin} <span className="text-secondary">→</span> {delivery.destination}
                </h3>
                
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Carrier</span>
                    <span className="text-primary font-black uppercase">Global Express</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Date
                    </span>
                    <span className="text-primary font-black uppercase">{delivery.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
