export type ShipmentStatus = 'Pending' | 'Package Collected' | 'Processing' | 'In Transit' | 'Arrived At Hub' | 'Customs Inspection' | 'Clearance Pending' | 'Clearance Approved' | 'Out For Delivery' | 'Delivered';

export interface Shipment {
  id: string;
  tracking_number: string;
  reference_number?: string;
  status: ShipmentStatus;
  shipping_method?: string;
  dispatch_date?: string;
  estimated_delivery?: string;
  current_location?: string;
  destination?: string;
  sender_name?: string;
  sender_address?: string;
  sender_country?: string;
  recipient_name?: string;
  recipient_address?: string;
  recipient_country?: string;
  recipient_phone?: string;
  package_name?: string;
  package_description?: string;
  quantity: number;
  weight?: string;
  shipment_category?: string;
  shipment_type?: string;
  current_lat?: number;
  current_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  created_at: string;
  updated_at: string;
}

export interface ShipmentImage {
  id: string;
  shipment_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface ShipmentStatusHistory {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

export interface ShipmentFee {
  id: string;
  shipment_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  wallet_address: string;
  network?: string;
  qr_code_url?: string;
  is_enabled: boolean;
  created_at: string;
}

export interface PaymentSubmission {
  id: string;
  shipment_id: string;
  transaction_hash?: string;
  screenshot_url?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  tracking_number?: string;
  full_name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'open' | 'pending' | 'resolved';
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  photo_url?: string;
  created_at: string;
}
