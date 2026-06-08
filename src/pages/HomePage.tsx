import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Ship, Plane, Truck, Shield, Globe, 
  ArrowRight, 
  Headphones, Briefcase, 
  ChevronRight, Play, Hash
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GallerySection } from '../components/home/GallerySection';
import { RecentDeliveries } from '../components/home/RecentDeliveries';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { LogisticsNetwork } from '../components/home/LogisticsNetwork';
import ServiceModal from '../components/home/ServiceModal';

interface Service {
  title: string;
  desc: string;
  details: string[];
  image: string;
}

const servicesData: Record<string, Service> = {
  "Air Freight": {
    title: "Global Air Freight",
    desc: "Time-critical air cargo services covering 220+ countries with door-to-door delivery and real-time visibility.",
    details: ["Next-day express delivery", "Charter flights for oversized cargo", "Temperature-controlled shipments", "Customs clearance acceleration"],
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800"
  },
  "Ocean Freight": {
    title: "Ocean Freight Solutions",
    desc: "Global sea shipping solutions for bulk and containerized cargo, optimized for cost and environmental efficiency.",
    details: ["Full Container Load (FCL)", "Less than Container Load (LCL)", "Intermodal ocean-rail solutions", "Hazardous material handling"],
    image: "https://images.unsplash.com/photo-1512310604669-443f86c570b3?auto=format&fit=crop&q=80&w=800"
  },
  "Road Network": {
    title: "Regional Road Network",
    desc: "Comprehensive ground transport across continents with a modern fleet and optimized route planning.",
    details: ["Full Truckload (FTL) services", "Express parcel distribution", "Last-mile specialized delivery", "GPS-tracked fleet management"],
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"
  },
  "Warehousing": {
    title: "Smart Warehousing",
    desc: "AI-driven inventory management and global distribution hubs designed for maximum fulfillment speed.",
    details: ["Automated inventory tracking", "Climate-controlled storage", "Cross-docking operations", "E-commerce integration ready"],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
  }
};

const HomePage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track/${trackingNumber.trim()}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Cinematic Hero 3.0 - Professional Redesign */}
      <section className="relative min-h-[95vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Advanced Background Layer */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img 
              src="/hero.jpg" 
              alt="Global Logistics Hub" 
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
          
          {/* Refined Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-primary/20 z-10"></div>
          
          {/* Animated Particles/Accents for Depth */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] z-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl"
          >
            {/* Premium Badge */}
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl mb-8 shadow-2xl"
            >
              <div className="relative">
                <Globe size={16} className="text-secondary animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 bg-secondary/40 blur-md rounded-full animate-ping"></div>
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/90">Global Supply Chain Excellence</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-7xl font-light italic mb-6 leading-[1.05] tracking-tight text-white drop-shadow-2xl"
            >
              NAVIGATING THE <br />
              <span className="text-secondary relative font-black not-italic tracking-tighter">
                FUTURE OF FLOW.
                <div className="absolute -bottom-2 left-0 w-24 h-1.5 bg-secondary rounded-full"></div>
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-base md:text-xl mb-12 text-white/80 max-w-xl font-light italic leading-relaxed drop-shadow-md"
            >
              Engineered for precision. Scaled for impact. We transform complex global logistics into a seamless, predictable engine for your business growth.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
              <Link to="/contact" className="bg-secondary text-primary px-10 py-5 rounded-[1.25rem] font-black text-sm hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(255,153,0,0.5)] flex items-center space-x-4 group relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative z-10">START SHIPPING</span>
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform relative z-10" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Re-engineered Tracking Hub - More Integrated Look */}
      <section className="relative z-30 -mt-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col lg:flex-row items-center gap-8"
          >
            <div className="lg:w-1/3 flex items-center space-x-6 pr-8 lg:border-r border-gray-100">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shrink-0">
                <Hash size={28} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">Live Tracking</h3>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-0.5">Real-time GPS visibility</p>
              </div>
            </div>
            
            <div className="lg:w-2/3 w-full">
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Enter Tracking ID (e.g. GEL784...)" 
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-dark text-sm focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none font-bold transition-all placeholder:text-gray-300"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-dark transition-all shadow-xl active:scale-95 shrink-0">
                  TRACK SHIPMENT
                </button>
              </form>
              <div className="mt-4 flex items-center space-x-6 text-sm font-bold text-gray-400 uppercase tracking-widest px-4">
                <span className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> <span>Live Updates</span></span>
                <span className="flex items-center space-x-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> <span>SMS Alerts</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Global Logistic Alliance Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
            <PartnerLogo name="SKYFREIGHT" />
            <PartnerLogo name="OCEANIC" />
            <PartnerLogo name="RAPIDTRUCK" />
            <PartnerLogo name="GLOBE HUB" />
            <PartnerLogo name="VANTAGE" />
          </div>
        </div>
      </section>

      {/* Global Services Grid */}
      <section className="py-32 bg-accent/50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 tracking-tighter uppercase">Our Capabilities.</h2>
              <p className="text-xl text-gray-500 font-medium">From complex oversized cargo to sensitive pharmaceutical transport, we have the fleet and the expertise to deliver anything, anywhere.</p>
            </div>
            <Link to="/contact" className="text-primary font-black flex items-center space-x-2 group border-b-4 border-secondary pb-1">
              <span>EXPLORE FULL SOLUTIONS</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernServiceCard 
              icon={<Plane size={40} />}
              title="Air Freight"
              tags={["Urgent", "Global", "Charter"]}
              desc="Time-critical air cargo services covering 220+ countries."
              onClick={() => setSelectedService(servicesData["Air Freight"])}
            />
            <ModernServiceCard 
              icon={<Ship size={40} />}
              title="Ocean Freight"
              tags={["LCL", "FCL", "Project"]}
              desc="Global sea shipping solutions for bulk and containerized cargo."
              onClick={() => setSelectedService(servicesData["Ocean Freight"])}
            />
            <ModernServiceCard 
              icon={<Truck size={40} />}
              title="Road Network"
              tags={["Express", "FTL", "Cross-Border"]}
              desc="Comprehensive ground transport across continents."
              onClick={() => setSelectedService(servicesData["Road Network"])}
            />
            <ModernServiceCard 
              icon={<Briefcase size={40} />}
              title="Warehousing"
              tags={["Smart", "3PL", "Fulfillment"]}
              desc="AI-driven inventory management and global distribution hubs."
              onClick={() => setSelectedService(servicesData["Warehousing"])}
            />
          </div>
        </div>
      </section>

      {/* Process Guide ("How it Works") */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-black mb-6 tracking-tight uppercase">Logistics Simplified.</h2>
            <p className="text-white/60 text-base font-medium italic">Four steps to seamless global delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <ProcessStep 
              num="01"
              title="Booking"
              desc="Request a digital quote and book your slot in minutes."
            />
            <ProcessStep 
              num="02"
              title="Collection"
              desc="Our specialized couriers collect from your location."
            />
            <ProcessStep 
              num="03"
              title="Transit"
              desc="Goods move through our global multi-modal hubs."
            />
            <ProcessStep 
              num="04"
              title="Delivery"
              desc="Last-mile delivery with full proof of receipt."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2 relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Modern Warehouse" 
                  className="rounded-[3rem] shadow-2xl"
                />
                <div className="absolute -bottom-10 -right-10 bg-secondary p-8 rounded-3xl shadow-2xl hidden md:block">
                  <div className="text-3xl font-black text-primary leading-tight">25+</div>
                  <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mt-1">Years of <br />Excellence</div>
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent rounded-full -z-0"></div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-10 tracking-tighter leading-none uppercase">Engineered for <br /><span className="text-secondary">Efficiency.</span></h2>
              <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed">
                Global Express combines traditional logistics expertise with cutting-edge digital tracking to provide a shipping experience that is predictable, secure, and infinitely scalable.
              </p>

              <div className="space-y-8">
                <ValuePoint 
                  icon={<Shield className="text-secondary" size={28} />}
                  title="Total Security Protocols"
                  desc="Military-grade security at every hub and transit point."
                />
                <ValuePoint 
                  icon={<Globe className="text-secondary" size={28} />}
                  title="220+ Countries Served"
                  desc="A truly borderless network with localized expertise."
                />
                <ValuePoint 
                  icon={<Headphones className="text-secondary" size={28} />}
                  title="24/7 Command Center"
                  desc="Real humans monitoring your cargo 365 days a year."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Logistics Network Section */}
      <LogisticsNetwork />

      {/* Global Deliveries in Action (Bento Gallery) */}
      <GallerySection />

      {/* Recent Deliveries Showcase */}
      <RecentDeliveries />

      {/* Customer Success Stories Section */}
      <TestimonialsSection />

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-dark rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="grid grid-cols-12 h-full">
                {[...Array(48)].map((_, i) => <div key={i} className="border-r border-b border-white/20"></div>)}
              </div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight tracking-tighter uppercase">Ready to move <br />your cargo?</h2>
              <p className="text-white/60 text-lg mb-10 font-medium">Join 5,000+ businesses who trust us for their global operations. Get a tailored quote in less than 5 minutes.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/contact" className="bg-secondary text-primary px-12 py-5 rounded-2xl font-black text-xl hover:bg-white transition-all shadow-2xl flex items-center space-x-3 group">
                  <span>GET STARTED NOW</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
        service={selectedService} 
      />
    </div>
  );
};

const ModernServiceCard = ({ icon, title, tags, desc, onClick }: { icon: React.ReactNode, title: string, tags: string[], desc: string, onClick?: () => void }) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all border border-gray-50 group flex flex-col h-full hover:-translate-y-2 duration-500">
    <div className="bg-primary text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-secondary group-hover:text-primary transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-primary mb-4 tracking-tighter">{title.toUpperCase()}</h3>
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map(tag => <span key={tag} className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-wider">{tag}</span>)}
    </div>
    <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-grow">{desc}</p>
    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
      <button onClick={onClick} className="text-xs font-black text-primary uppercase tracking-widest hover:text-secondary transition-colors">Learn More</button>
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:translate-x-1 transition-all cursor-pointer" onClick={onClick}>
        <ChevronRight size={16} />
      </div>
    </div>
  </div>
);

const ProcessStep = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
  <div className="relative z-10 group">
    <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-secondary transition-colors duration-500">
      <span className="text-3xl font-black text-white group-hover:text-primary transition-colors">{num}</span>
    </div>
    <h4 className="text-2xl font-black mb-4 tracking-tighter uppercase">{title}</h4>
    <p className="text-white/50 font-medium leading-relaxed">{desc}</p>
  </div>
);

const ValuePoint = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-6 group">
    <div className="shrink-0 w-16 h-16 bg-accent rounded-2xl flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
      {icon}
    </div>
    <div>
      <h4 className="font-black text-xl text-primary uppercase tracking-tighter mb-2">{title}</h4>
      <p className="text-gray-500 font-medium leading-tight">{desc}</p>
    </div>
  </div>
);

const PartnerLogo = ({ name }: { name: string }) => (
  <span className="text-2xl font-black tracking-tighter border-2 border-gray-400 px-4 py-1 rounded leading-none">{name}</span>
);

export default HomePage;

