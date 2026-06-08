import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';

const contactSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  tracking_number: z.string().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (values: ContactValues) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          full_name: values.full_name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          tracking_number: values.tracking_number,
          status: 'open'
        }]);

      if (error) throw error;

      toast.success('Message sent successfully! Our team will contact you soon.');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Our Global Team</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Have questions about a shipment, pricing, or our services? We're here to help 24/7.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <ContactInfoCard 
              icon={<Phone className="text-secondary" />}
              title="Call Us"
              details="+1 (234) 567-890"
              subDetails="Mon-Fri, 24 Hours"
            />
            <ContactInfoCard 
              icon={<Mail className="text-secondary" />}
              title="Email Us"
              details="support@globalexpress.com"
              subDetails="sales@globalexpress.com"
            />
            <ContactInfoCard 
              icon={<MapPin className="text-secondary" />}
              title="Visit Us"
              details="123 Logistics Way"
              subDetails="Shipping City, World 54321"
            />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <MessageSquare className="text-secondary" /> Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    {...register('full_name')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="John Doe"
                  />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                  <input 
                    {...register('email')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Subject / Tracking Number</label>
                  <input 
                    {...register('subject')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Inquiry about shipment GEL784..."
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Your Message</label>
                  <textarea 
                    {...register('message')}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-fit bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInfoCard = ({ icon, title, details, subDetails }: { icon: React.ReactNode, title: string, details: string, subDetails: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex items-start gap-6">
    <div className="shrink-0 w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-primary mb-1">{title}</h3>
      <p className="text-gray-800 font-medium">{details}</p>
      <p className="text-gray-500 text-sm mt-1">{subDetails}</p>
    </div>
  </div>
);

export default ContactPage;
