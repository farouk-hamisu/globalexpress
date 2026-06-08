import { motion } from 'framer-motion';

const images = [
  {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    title: "Modern Warehousing",
    size: "large"
  },
  {
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
    title: "Global Shipping",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1521331015254-842b1f3ff5ef?auto=format&fit=crop&q=80&w=800",
    title: "Package Handling",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    title: "Delivery Fleet",
    size: "medium"
  },
  {
    url: "https://images.unsplash.com/photo-1494412574005-4811f29f9543?auto=format&fit=crop&q=80&w=1200",
    title: "Industrial Operations",
    size: "large"
  },
  {
    url: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800",
    title: "Air Freight",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1512310604669-443f86c570b3?auto=format&fit=crop&q=80&w=800",
    title: "Container Port",
    size: "medium"
  },
  {
    url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    title: "Distribution Center",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    title: "Logistics Expert",
    size: "medium"
  },
  {
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    title: "Global Network",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    title: "Last Mile Delivery",
    size: "medium"
  },
  {
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
    title: "Smart Logistics",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1570675621549-4467d0efdb0c?auto=format&fit=crop&q=80&w=800",
    title: "Cargo Plane",
    size: "medium"
  },
  {
    url: "https://images.unsplash.com/photo-1473445733995-882ed5544ad4?auto=format&fit=crop&q=80&w=800",
    title: "Ocean Vessel",
    size: "small"
  },
  {
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
    title: "Courier Service",
    size: "medium"
  }
];

export const GallerySection = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 tracking-tighter">GLOBAL DELIVERIES IN ACTION</h2>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto italic">
            Explore our worldwide logistics network and successful deliveries across continents.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] gap-4">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 0.98 }}
              className={`
                relative rounded-[2rem] overflow-hidden group shadow-lg
                ${img.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${img.size === 'medium' ? 'md:col-span-2' : ''}
              `}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <span className="text-white font-black text-xl uppercase tracking-tighter">{img.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
