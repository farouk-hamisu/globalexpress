// @ts-nocheck
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  MapPin, 
  Truck, 
  User, 
  Phone, 
  Globe, 
  Info,
  ChevronRight,
  AlertCircle,
  FileText,
  CreditCard,
  History,
  Shield,
  Coins,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';
import PaymentModal from '../components/tracking/PaymentModal';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TrackingPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'map' | 'timeline' | 'fees'>('info');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: shipment, isLoading, error } = useQuery({
    queryKey: ['shipment', trackingNumber],
    queryFn: async () => {
      if (!trackingNumber) return null;
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_images(*),
          shipment_status_history(*),
          shipment_fees(*)
        `)
        .eq('tracking_number', trackingNumber)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!trackingNumber
  });

  const { data: wallets } = useQuery({
    queryKey: ['public-wallets'],
    queryFn: async () => {
      const { data } = await supabase.from('payment_methods').select('*').eq('is_enabled', true);
      return data || [];
    }
  });

  if (!trackingNumber) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Track Your Shipment</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Please enter your tracking number on the homepage or via the link provided in your confirmation email.
        </p>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Retrieving shipment data...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Shipment Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We couldn't find any shipment matching tracking number: <span className="font-bold text-primary">{trackingNumber}</span>. Please verify the number and try again.
        </p>
        <Link to="/" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
          Try another tracking number <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  const sortedHistory = [...(shipment.shipment_status_history || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unpaidFees = shipment.shipment_fees?.filter((f: any) => f.status !== 'paid') || [];
  const totalUnpaid = unpaidFees.reduce((sum: number, f: any) => sum + Number(f.amount), 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Shipment Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-secondary text-primary px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
                  {shipment.status}
                </span>
                <span className="text-white/60 text-sm">Tracking Number</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{shipment.tracking_number}</h1>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md">
                <div className="text-white/60 text-xs uppercase mb-1">Estimated Delivery</div>
                <div className="font-bold">
                  {shipment.estimated_delivery 
                    ? format(new Date(shipment.estimated_delivery), 'MMM dd, yyyy') 
                    : 'TBD'}
                </div>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md">
                <div className="text-white/60 text-xs uppercase mb-1">Last Update</div>
                <div className="font-bold">
                  {sortedHistory[0] ? format(new Date(sortedHistory[0].timestamp), 'MMM dd, HH:mm') : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden flex p-1 border border-gray-100">
              <TabButton 
                active={activeTab === 'info'} 
                onClick={() => setActiveTab('info')} 
                icon={<Info size={18} />} 
                label="General Info" 
              />
              <TabButton 
                active={activeTab === 'map'} 
                onClick={() => setActiveTab('map')} 
                icon={<MapPin size={18} />} 
                label="Live Map" 
              />
              <TabButton 
                active={activeTab === 'timeline'} 
                onClick={() => setActiveTab('timeline')} 
                icon={<History size={18} />} 
                label="Timeline" 
              />
              <TabButton 
                active={activeTab === 'fees'} 
                onClick={() => setActiveTab('fees')} 
                icon={<CreditCard size={18} />} 
                label="Fees & Payment" 
              />
            </div>

            {/* Tab Panels */}
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Logistics Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard title="Sender Information" icon={<User className="text-primary" />}>
                    <p className="font-bold text-gray-800">{shipment.sender_name}</p>
                    <p className="text-gray-600 text-sm mt-1">{shipment.sender_address}</p>
                    <p className="text-gray-600 text-sm">{shipment.sender_country}</p>
                  </InfoCard>
                  
                  <InfoCard title="Recipient Information" icon={<Truck className="text-primary" />}>
                    <p className="font-bold text-gray-800">{shipment.recipient_name}</p>
                    <p className="text-gray-600 text-sm mt-1">{shipment.recipient_address}</p>
                    <p className="text-gray-600 text-sm">{shipment.recipient_country}</p>
                    <div className="flex items-center gap-2 mt-2 text-primary font-medium text-sm">
                      <Phone size={14} /> {shipment.recipient_phone}
                    </div>
                  </InfoCard>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Package className="text-secondary" /> Package Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <DetailItem label="Package Name" value={shipment.package_name} />
                    <DetailItem label="Weight" value={shipment.weight} />
                    <DetailItem label="Quantity" value={shipment.quantity?.toString()} />
                    <DetailItem label="Shipment Type" value={shipment.shipment_type} />
                    <DetailItem label="Shipping Method" value={shipment.shipping_method} />
                    <DetailItem label="Category" value={shipment.shipment_category} />
                    <DetailItem label="Dispatch Date" value={shipment.dispatch_date ? format(new Date(shipment.dispatch_date), 'MMM dd, yyyy') : 'N/A'} />
                    <DetailItem label="Reference" value={shipment.reference_number || 'N/A'} />
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h4 className="text-sm uppercase text-gray-400 font-bold mb-3 tracking-wider">Description</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {shipment.package_description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Shipment Gallery */}
                {shipment.shipment_images && shipment.shipment_images.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <ImageIcon className="text-secondary" /> Shipment Gallery
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {shipment.shipment_images.map((img: any) => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer">
                          <img 
                            src={img.url} 
                            alt={img.caption || 'Shipment'} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {img.caption && (
                            <div className="absolute inset-0 bg-black/40 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-medium">{img.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'map' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* @ts-ignore */}
                <MapContainer 
                  center={[shipment.current_lat || 0, shipment.current_lng || 0]} 
                  zoom={4} 
                  style={{ height: '100%', width: '100%' }}
                >
                  {/* @ts-ignore */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Origin */}
                  {shipment.sender_address && (
                    <Marker position={[shipment.current_lat || 0, shipment.current_lng || 0]}>
                      <Popup>
                        <div className="font-bold">Current Location</div>
                        <div>{shipment.current_location}</div>
                      </Popup>
                    </Marker>
                  )}
                  {/* Destination */}
                  {shipment.destination_lat && shipment.destination_lng && (
                    <Marker position={[shipment.destination_lat, shipment.destination_lng]}>
                      <Popup>
                        <div className="font-bold">Destination</div>
                        <div>{shipment.destination}</div>
                      </Popup>
                    </Marker>
                  )}
                  {/* Route Line */}
                  {shipment.destination_lat && shipment.destination_lng && (
                    /* @ts-ignore */
                    <Polyline 
                      positions={[
                        [shipment.current_lat || 0, shipment.current_lng || 0],
                        [shipment.destination_lat, shipment.destination_lng]
                      ]} 
                      color="#003366" 
                      dashArray="10, 10"
                    />
                  )}
                </MapContainer>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-white rounded-2xl shadow-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold mb-10 flex items-center gap-2">
                  <History className="text-secondary" /> Shipment Journey
                </h3>
                <div className="relative pl-8 border-l-2 border-gray-100 space-y-12 pb-4">
                  {sortedHistory.length > 0 ? sortedHistory.map((event: any, idx: number) => (
                    <div key={event.id} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md ${idx === 0 ? 'bg-secondary animate-pulse scale-125' : 'bg-gray-300'}`}></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className={`font-bold text-lg ${idx === 0 ? 'text-primary' : 'text-gray-700'}`}>
                            {event.status}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <MapPin size={14} /> {event.location}
                          </div>
                          {event.description && (
                            <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-3 rounded-lg italic">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-gray-800">{format(new Date(event.timestamp), 'MMM dd, yyyy')}</div>
                          <div className="text-gray-400 text-sm">{format(new Date(event.timestamp), 'HH:mm')}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-gray-400">
                      No status history available for this shipment.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="text-secondary" /> Shipment Fees
                  </h3>
                  
                  {shipment.shipment_fees && shipment.shipment_fees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-sm uppercase text-gray-400 tracking-wider">
                            <th className="pb-4 font-bold">Fee Description</th>
                            <th className="pb-4 font-bold">Due Date</th>
                            <th className="pb-4 font-bold text-right">Amount</th>
                            <th className="pb-4 font-bold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {shipment.shipment_fees.map((fee: any) => (
                            <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4">
                                <div className="font-bold text-gray-800">{fee.title}</div>
                                <div className="text-xs text-gray-500">{fee.description}</div>
                              </td>
                              <td className="py-4 text-sm text-gray-600">
                                {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                              </td>
                              <td className="py-4 text-right font-bold text-primary">
                                ${Number(fee.amount).toLocaleString()}
                              </td>
                              <td className="py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                  fee.status === 'paid' 
                                  ? 'bg-green-100 text-green-700' 
                                  : fee.status === 'overdue' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {fee.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-primary/5">
                            <td colSpan={2} className="p-4 font-bold text-primary">Total Outstanding Amount</td>
                            <td className="p-4 text-right font-bold text-xl text-primary">${totalUnpaid.toLocaleString()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">No fees recorded for this shipment.</p>
                    </div>
                  )}
                </div>

                {totalUnpaid > 0 && (
                  <div className="space-y-8">
                    {/* Wallet Section */}
                    <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-secondary">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Coins className="text-secondary" /> Payment Methods (Crypto)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wallets?.map((wallet: any) => (
                          <div key={wallet.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                              <Coins className="text-primary" />
                            </div>
                            <div className="font-bold text-primary mb-1">{wallet.name} ({wallet.symbol})</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{wallet.network}</div>
                            
                            <div className="w-full">
                              <div className="text-xs text-gray-400 font-bold uppercase mb-2">Wallet Address</div>
                              <div className="p-3 bg-white border border-gray-200 rounded-xl text-[10px] font-mono break-all select-all cursor-pointer hover:bg-gray-50 transition-colors">
                                {wallet.wallet_address}
                              </div>
                            </div>

                            {wallet.qr_code_url && (
                              <img src={wallet.qr_code_url} alt="QR Code" className="w-32 h-32 mt-4 rounded-lg shadow-sm border border-gray-200 p-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary text-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-8">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <AlertCircle className="text-secondary" /> Payment Required
                        </h3>
                        <p className="text-white/80 mb-8 max-w-2xl">
                          To continue processing your shipment, please settle the outstanding fees. Once you've made the transfer, submit your transaction hash for verification.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-secondary text-primary px-8 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg"
                          >
                            Submit Payment Proof
                          </button>
                          <Link to="/contact" className="bg-white/10 border border-white/20 px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
                            Request Alternative Payment
                          </Link>
                        </div>
                      </div>
                      <div className="bg-white/10 p-4 text-center text-sm font-medium border-t border-white/10">
                        Payment verification usually takes 1-2 business hours.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Quick Summary Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-secondary">
              <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-4">Shipment Progress</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-primary">{shipment.status}</span>
                <span className="text-sm font-bold text-secondary">75%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                <div className="bg-secondary h-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Globe size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Current Location</div>
                    <div className="font-bold text-gray-800">{shipment.current_location || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Final Destination</div>
                    <div className="font-bold text-gray-800">{shipment.destination || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Need Assistance?</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                If you have questions about your shipment or need to provide additional documents, please contact our support team.
              </p>
              <Link to="/contact" className="block w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                Contact Support
              </Link>
            </div>
            
            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Shield size={24} className="text-green-600 shrink-0" />
              <div className="text-xs text-green-800 leading-tight">
                <span className="font-bold block mb-1">Secure Tracking</span>
                This shipment is protected by Global Express end-to-end security protocols.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal 
          shipmentId={shipment.id}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex-grow flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-bold text-sm md:text-base ${
      active 
      ? 'bg-primary text-white shadow-lg' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-primary/10">
    <h3 className="text-sm uppercase text-gray-400 font-bold mb-6 tracking-widest flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="text-gray-800">{children}</div>
  </div>
);

const DetailItem = ({ label, value }: { label: string, value?: string }) => (
  <div>
    <div className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">{label}</div>
    <div className="font-bold text-primary">{value || 'N/A'}</div>
  </div>
);

export default TrackingPage;
