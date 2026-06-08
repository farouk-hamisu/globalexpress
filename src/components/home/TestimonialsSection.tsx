import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Alexander Hoffman",
    country: "Germany",
    rating: 5,
    role: "Supply Chain Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    review: "Global Express Logistics has transformed our European distribution. Their reliability and real-time tracking are unmatched in the industry."
  },
  {
    name: "Sarah Chen",
    country: "Singapore",
    rating: 5,
    role: "E-commerce Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    review: "As a fast-growing retail brand, we needed a partner who could scale with us. They handle everything from freight to last-mile delivery flawlessly."
  },
  {
    name: "James Wilson",
    country: "USA",
    rating: 5,
    role: "Logistics Manager",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    review: "The level of professionalism and customer support is incredible. They are truly an extension of our own team."
  },
  {
    name: "Elena Rodriguez",
    country: "Spain",
    rating: 5,
    role: "Operations Chief",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    review: "Efficient, transparent, and proactive. They solve problems before they even reach us. Highly recommended for international shipping."
  },
  {
    name: "David Okafor",
    country: "Nigeria",
    rating: 5,
    role: "Tech CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    review: "Shipping critical tech equipment to Africa can be challenging. Global Express makes it feel easy and secure."
  },
  {
    name: "Yuki Tanaka",
    country: "Japan",
    rating: 5,
    role: "Production Lead",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    review: "Precision is everything in Japanese manufacturing. They deliver with the exact timing we require for our just-in-time systems."
  },
  {
    name: "Michael Knight",
    country: "Australia",
    rating: 5,
    role: "Distribution Specialist",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    review: "We've tried many carriers, but none provide the global reach and local expertise that Global Express consistently offers."
  },
  {
    name: "Sofia Rossi",
    country: "Italy",
    rating: 5,
    role: "Fashion Consultant",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    review: "The handling of sensitive luxury goods is superb. Our clients always receive their items in pristine condition."
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-32 bg-primary text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <div className="grid grid-cols-6 gap-0 h-full w-full">
          {[...Array(24)].map((_, i) => <div key={i} className="border border-white"></div>)}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter uppercase">What Our Customers Say</h2>
          <p className="text-xl text-white/60 font-medium italic">Premium logistics experiences trusted by industry leaders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] flex flex-col justify-between group hover:bg-white/20 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <Quote className="text-secondary/30 group-hover:text-secondary transition-colors" size={32} />
                </div>
                <p className="text-lg italic text-white/80 mb-10 leading-relaxed font-medium">"{t.review}"</p>
              </div>
              
              <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                <div className="relative">
                  <img src={t.image} alt={t.name} className="w-14 h-14 rounded-2xl object-cover shadow-2xl border-2 border-white/20" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-black text-white uppercase tracking-tighter leading-none mb-1">{t.name}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{t.country} • {t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
