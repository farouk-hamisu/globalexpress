import { motion } from 'framer-motion';
import { Globe, Shield, Package, Target } from 'lucide-react';

export const LogisticsNetwork = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-24 mb-32">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-10 tracking-tighter leading-[0.9] uppercase">
              Our Global <br />
              <span className="text-secondary">Logistics Network</span>
            </h2>
            <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed italic">
              Connecting businesses and individuals through a reliable worldwide shipping infrastructure. Our network is designed for speed, scale, and uncompromising security.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary group-hover:bg-secondary transition-colors">
                  <Globe size={24} />
                </div>
                <h4 className="font-black text-lg text-primary uppercase tracking-tighter">Countries Served</h4>
                <div className="text-3xl font-black text-secondary">220+</div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-tight">A truly borderless <br />shipping network.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary group-hover:bg-secondary transition-colors">
                  <Target size={24} />
                </div>
                <h4 className="font-black text-lg text-primary uppercase tracking-tighter">Active Routes</h4>
                <div className="text-3xl font-black text-secondary">15,000+</div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-tight">Optimized paths <br />for every delivery.</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary group-hover:bg-secondary transition-colors">
                  <Package size={24} />
                </div>
                <h4 className="font-black text-lg text-primary uppercase tracking-tighter">Annual Shipments</h4>
                <div className="text-3xl font-black text-secondary">2.5M+</div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-tight">Moving the world <br />at scale.</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary group-hover:bg-secondary transition-colors">
                  <Shield size={24} />
                </div>
                <h4 className="font-black text-lg text-primary uppercase tracking-tighter">Global Partners</h4>
                <div className="text-3xl font-black text-secondary">500+</div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-tight">Trusted network <br />of excellence.</p>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 order-1 lg:order-2 relative">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <motion.img 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                src="/hero.jpg" 
                alt="Logistics Port" 
                className="rounded-[2.5rem] shadow-2xl h-80 w-full object-cover"
              />
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                src="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800" 
                alt="Air Freight" 
                className="rounded-[2.5rem] shadow-2xl h-80 w-full object-cover mt-12"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full -z-0"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NetworkBlock 
            image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
            title="Strategic Seaports"
            desc="Dominating the major oceanic trade routes with deep-water terminal access."
          />
          <NetworkBlock 
            image="/airpothubs.jpeg"
            title="Airport Hubs"
            desc="24/7 air cargo operations at all major international aviation gateways."
          />
          <NetworkBlock 
            image="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800"
            title="Warehousing"
            desc="Automated fulfillment centers strategically located for last-mile efficiency."
          />
        </div>
      </div>
    </section>
  );
};

const NetworkBlock = ({ image, title, desc }: { image: string, title: string, desc: string }) => (
  <div className="group relative h-[400px] overflow-hidden rounded-[3rem] shadow-2xl">
    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent flex flex-col justify-end p-12">
      <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">{title}</h3>
      <p className="text-white/70 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);
