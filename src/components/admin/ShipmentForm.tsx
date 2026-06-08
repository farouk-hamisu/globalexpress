import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, RotateCcw, MapPin, Camera, Trash2, DollarSign } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary text-white">
          <div>
            <h2 className="text-xl font-bold">{shipment ? 'Edit Shipment' : 'Create New Shipment'}</h2>
            <p className="text-white/60 text-xs mt-1">Fill in the details to manage the logistics record.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div> Core Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tracking Number</label>
                  <div className="flex gap-2">
                    <input 
                      {...register('tracking_number')}
                      className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={generateTracking}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      title="Regenerate"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                  {errors.tracking_number && <p className="text-red-500 text-xs mt-1">{errors.tracking_number.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select 
                      {...register('status')}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">Method</label>
                    <input 
                      {...register('shipping_method')}
                      placeholder="Air Freight, etc."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Est. Delivery Date</label>
                  <input 
                    type="date"
                    {...register('estimated_delivery')}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Dispatch Date</label>
                  <input 
                    type="date"
                    {...register('dispatch_date')}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Reference Number</label>
                  <input 
                    {...register('reference_number')}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 pt-4">
                <div className="w-2 h-2 bg-secondary rounded-full"></div> Package Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Package Name</label>
                  <input 
                    {...register('package_name')}
                    placeholder="e.g. Industrial Server"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <input 
                      {...register('shipment_category')}
                      placeholder="Electronics"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                    <input 
                      {...register('shipment_type')}
                      placeholder="Box / Pallet"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Weight</label>
                    <input 
                      {...register('weight')}
                      placeholder="25kg"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    {...register('package_description')}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right Column: Address & Map */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div> Sender & Recipient
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-primary uppercase">Sender Details</div>
                  <input 
                    {...register('sender_name')}
                    placeholder="Sender Name"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input 
                    {...register('sender_address')}
                    placeholder="Sender Address"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input 
                    {...register('sender_country')}
                    placeholder="Sender Country"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-primary uppercase">Recipient Details</div>
                  <input 
                    {...register('recipient_name')}
                    placeholder="Recipient Name"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input 
                    {...register('recipient_address')}
                    placeholder="Recipient Address"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      {...register('recipient_country')}
                      placeholder="Country"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input 
                      {...register('recipient_phone')}
                      placeholder="Phone"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 pt-4">
                <div className="w-2 h-2 bg-secondary rounded-full"></div> Coordinates & Location
              </h3>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <MapPin size={16} /> Current Position (Click Map to Move)
                </div>
                
                <MapPicker 
                  lat={currentLat} 
                  lng={currentLng} 
                  onChange={(lat, lng) => {
                    setValue('current_lat', lat);
                    setValue('current_lng', lng);
                  }} 
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Latitude</label>
                    <input 
                      type="number" step="any"
                      {...register('current_lat', { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Longitude</label>
                    <input 
                      type="number" step="any"
                      {...register('current_lng', { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Location Name</label>
                  <input 
                    {...register('current_location')}
                    placeholder="New York, USA"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {shipment && (
                <>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 pt-4">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div> Financial Records
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <DollarSign size={16} className="text-secondary" /> Shipment Fees
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowFeeModal(true)}
                        className="text-xs font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                      >
                        + Add Fee
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div key={fee.id} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center group">
                          <div>
                            <div className="font-bold text-xs text-gray-800">{fee.title}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">${Number(fee.amount).toLocaleString()} • {fee.status}</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => deleteFee(fee.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {fees.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 italic">No fees recorded yet.</div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 pt-4">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div> Shipment Gallery
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Camera className="text-gray-400" size={24} />
                      <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Add Photo</span>
                      <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 flex justify-end gap-4 pb-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {isSubmitting ? 'Saving...' : 'Save Shipment'}
            </button>
          </div>
        </form>

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
