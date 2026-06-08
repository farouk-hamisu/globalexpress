import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, RotateCcw, MapPin, Camera, Trash2, DollarSign, Globe } from 'lucide-react';
import type { Shipment } from '../../types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import MapPicker from './MapPicker';
import FeeModal from './FeeModal';

const shipmentSchema = z.object({
  tracking_number: z.string().min(5, 'Tracking number is required'),
  reference_number: z.string().optional().nullable(),
  status: z.string().min(1, 'Status is required'),
  shipping_method: z.string().optional().nullable(),
  sender_name: z.string().min(1, 'Sender name is required'),
  sender_address: z.string().optional().nullable(),
  sender_country: z.string().optional().nullable(),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_address: z.string().optional().nullable(),
  recipient_country: z.string().optional().nullable(),
  recipient_phone: z.string().optional().nullable(),
  package_name: z.string().min(1, 'Package name is required'),
  package_description: z.string().optional().nullable(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  weight: z.string().optional().nullable(),
  shipment_category: z.string().optional().nullable(),
  shipment_type: z.string().optional().nullable(),
  current_location: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  current_lat: z.number().optional().nullable(),
  current_lng: z.number().optional().nullable(),
  destination_lat: z.number().optional().nullable(),
  destination_lng: z.number().optional().nullable(),
  estimated_delivery: z.string().optional().nullable(),
  dispatch_date: z.string().optional().nullable(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  shipment?: Shipment;
  onClose: () => void;
  onSuccess: () => void;
}

const ShipmentForm = ({ shipment, onClose, onSuccess }: ShipmentFormProps) => {
  const [images, setImages] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: shipment ? {
      ...shipment,
      estimated_delivery: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toISOString().split('T')[0] : '',
      dispatch_date: shipment.dispatch_date ? new Date(shipment.dispatch_date).toISOString().split('T')[0] : '',
    } : {
      tracking_number: `GEL${Math.floor(100000000 + Math.random() * 900000000)}US`,
      status: 'Pending',
      quantity: 1,
    }
  });

  // Log validation errors for easier debugging
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form errors:', errors);
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) toast.error(`Validation error: ${firstError}`);
    }
  }, [errors]);

  const currentLat = watch('current_lat') || 0;
  const currentLng = watch('current_lng') || 0;

  useEffect(() => {
    if (shipment) {
      fetchImages();
      fetchFees();
    }
  }, [shipment]);

  const fetchImages = async () => {
    const { data } = await supabase.from('shipment_images').select('*').eq('shipment_id', shipment?.id);
    setImages(data || []);
  };

  const fetchFees = async () => {
    const { data } = await supabase.from('shipment_fees').select('*').eq('shipment_id', shipment?.id);
    setFees(data || []);
  };

  const deleteFee = async (id: string) => {
    const { error } = await supabase.from('shipment_fees').delete().eq('id', id);
    if (error) toast.error(error.message);
    else fetchFees();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !shipment) {
      if (!shipment) toast.error('Save the shipment first before uploading images');
      return;
    }
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${shipment.id}/${Math.random()}.${fileExt}`;
    const filePath = `shipments/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('shipment-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('shipment-images').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('shipment_images').insert([{
        shipment_id: shipment.id,
        url: publicUrl,
        caption: 'Cargo Photo'
      }]);

      if (dbError) throw dbError;

      toast.success('Image uploaded');
      fetchImages();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from('shipment_images').delete().eq('id', id);
    if (error) toast.error(error.message);
    else fetchImages();
  };

  const onSubmit = async (values: ShipmentFormValues) => {
    try {
      // Convert empty strings to null for optional database fields
      const formattedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key, 
          value === '' ? null : value
        ])
      );

      if (shipment) {
        const { error } = await supabase
          .from('shipments')
          .update(formattedValues)
          .eq('id', shipment.id);
        if (error) throw error;
        toast.success('Shipment updated successfully');
      } else {
        const { error } = await supabase
          .from('shipments')
          .insert([formattedValues]);
        if (error) throw error;
        toast.success('Shipment created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(`Error: ${error.message || 'Failed to save shipment'}`);
    }
  };

  const generateTracking = () => {
    setValue('tracking_number', `GEL${Math.floor(100000000 + Math.random() * 900000000)}US`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-gray-100 flex justify-between items-center bg-primary text-white shrink-0 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{shipment ? 'Edit Manifest' : 'Initialize Manifest'}</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div> Global Logistics Authority
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors relative z-10">
            <X size={24} />
          </button>
          {/* Decorative background for header */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:rotate-12 transition-transform duration-700">
            <Globe className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-grow bg-gray-50/30 scrollbar-hide">
          <div className="p-6 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Column: Basic Info */}
              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Network Intelligence
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Tracking Identification</label>
                      <div className="flex gap-3">
                        <input 
                          {...register('tracking_number')}
                          className="flex-grow px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm"
                        />
                        <button 
                          type="button" 
                          onClick={generateTracking}
                          className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-colors shadow-sm"
                          title="Regenerate"
                        >
                          <RotateCcw size={20} />
                        </button>
                      </div>
                      {errors.tracking_number && <p className="text-red-500 text-[10px] font-black uppercase mt-2 px-1">{errors.tracking_number.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Network Status</label>
                        <select 
                          {...register('status')}
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Package Collected">Package Collected</option>
                          <option value="Processing">Processing</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Arrived At Hub">Arrived At Hub</option>
                          <option value="Customs Inspection">Customs Inspection</option>
                          <option value="Clearance Pending">Clearance Pending</option>
                          <option value="Clearance Approved">Clearance Approved</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Transit Method</label>
                        <input 
                          {...register('shipping_method')}
                          placeholder="e.g. Express Air"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Est. Arrival Fix</label>
                        <input 
                          type="date"
                          {...register('estimated_delivery')}
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Dispatch Matrix</label>
                        <input 
                          type="date"
                          {...register('dispatch_date')}
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Cargo Specifications
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Package Designation</label>
                      <input 
                        {...register('package_name')}
                        placeholder="Industrial Equipment, etc."
                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Intelligence Category</label>
                        <input 
                          {...register('shipment_category')}
                          placeholder="Electronics"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Manifest Type</label>
                        <input 
                          {...register('shipment_type')}
                          placeholder="Standard Box"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Gross Mass</label>
                        <input 
                          {...register('weight')}
                          placeholder="45.0 kg"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Unit Quantity</label>
                        <input 
                          type="number"
                          {...register('quantity', { valueAsNumber: true })}
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-black text-primary shadow-sm text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Routing & Geo */}
              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Transit Protocol
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-6 md:p-8 bg-white rounded-3xl border border-gray-100 space-y-5 shadow-sm">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div> Origin Matrix
                      </div>
                      <input 
                        {...register('sender_name')}
                        placeholder="Sender Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                      />
                      <input 
                        {...register('sender_address')}
                        placeholder="Location Address"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                      />
                      <input 
                        {...register('sender_country')}
                        placeholder="Origin Country"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                      />
                    </div>

                    <div className="p-6 md:p-8 bg-primary/[0.03] rounded-3xl border border-primary/5 space-y-5 shadow-sm">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> Destination Matrix
                      </div>
                      <input 
                        {...register('recipient_name')}
                        placeholder="Recipient Name"
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                      />
                      <input 
                        {...register('recipient_address')}
                        placeholder="Delivery Address"
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                          {...register('recipient_country')}
                          placeholder="Target Country"
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                        />
                        <input 
                          {...register('recipient_phone')}
                          placeholder="Contact Comm"
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Geospatial Fix
                  </h3>
                  
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                      <MapPin size={16} className="text-secondary" /> Active Coordinate Matrix
                    </div>
                    
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                      <MapPicker 
                        lat={currentLat} 
                        lng={currentLng} 
                        onChange={(lat, lng) => {
                          setValue('current_lat', lat);
                          setValue('current_lng', lng);
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Latitude</label>
                        <input 
                          type="number" step="any"
                          {...register('current_lat', { valueAsNumber: true })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono text-[10px] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Longitude</label>
                        <input 
                          type="number" step="any"
                          {...register('current_lng', { valueAsNumber: true })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono text-[10px] font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Hub Descriptor</label>
                      <input 
                        {...register('current_location')}
                        placeholder="Hub Alpha-1, NY"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-black text-primary"
                      />
                    </div>
                  </div>
                </section>

                {shipment && (
                  <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                        <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Financial Ledger
                      </h3>
                      <div className="bg-primary p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl shadow-primary/20">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                            <DollarSign size={16} className="text-secondary" /> Network Fees
                          </div>
                          <button 
                            type="button"
                            onClick={() => setShowFeeModal(true)}
                            className="text-[9px] font-black text-secondary hover:text-white transition-all uppercase tracking-[0.25em] border border-secondary/30 px-4 py-2 rounded-xl hover:bg-secondary/10 bg-black/20"
                          >
                            + Ingest Fee
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {fees.map((fee) => (
                            <div key={fee.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                              <div>
                                <div className="font-black text-[11px] text-white tracking-tight uppercase">{fee.title}</div>
                                <div className="text-[9px] text-white/40 font-bold uppercase mt-1 tracking-widest flex items-center gap-3">
                                  <span className="text-secondary font-black">${Number(fee.amount).toLocaleString()}</span>
                                  <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                  <span className={fee.status === 'paid' ? 'text-green-400' : 'text-orange-400'}>{fee.status}</span>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => deleteFee(fee.id)}
                                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          {fees.length === 0 && (
                            <div className="text-center py-8 text-[10px] text-white/20 font-black uppercase tracking-[0.2em] italic border border-dashed border-white/10 rounded-2xl">Financial Manifest Empty</div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary flex items-center gap-3 mb-8">
                        <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div> Visual Manifest
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img) => (
                          <div key={img.id} className="relative group aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <button 
                              type="button"
                              onClick={() => deleteImage(img.id)}
                              className="absolute top-3 right-3 p-2.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group shadow-sm bg-white">
                          <div className="p-4 bg-gray-50 rounded-2xl shadow-inner border border-gray-100 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary">
                            <Camera size={28} />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 mt-4 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Ingest Intel</span>
                          <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 md:p-10 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto px-12 py-5 bg-gray-50 text-gray-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-100"
          >
            Abort Matrix
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-16 py-5 bg-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-dark transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 disabled:opacity-50 transform active:scale-95"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Save size={20} className="text-secondary" />}
            {isSubmitting ? 'Synchronizing...' : 'Commit Manifest'}
          </button>
        </div>


        {showFeeModal && shipment && (
          <FeeModal 
            shipmentId={shipment.id}
            onClose={() => setShowFeeModal(false)}
            onSuccess={() => {
              setShowFeeModal(false);
              fetchFees();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShipmentForm;
