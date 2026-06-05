-- Seed Testimonials
insert into testimonials (name, role, content, rating, photo_url)
values 
('Sarah Johnson', 'Import Manager, TechCorp', 'Global Express has transformed our supply chain. Their tracking system is the best in the business.', 5, 'https://i.pravatar.cc/150?u=sarah'),
('Michael Chen', 'Founder, Artisans Global', 'Reliable, fast, and professional. Theyve never let us down on our international deliveries.', 5, 'https://i.pravatar.cc/150?u=michael'),
('Elena Rodriguez', 'Logistics Director, Fashion Hub', 'The peace of mind knowing where our shipments are at all times is invaluable. Highly recommended.', 5, 'https://i.pravatar.cc/150?u=elena');

-- Seed Site Settings (Stats)
insert into site_settings (key, value)
values 
('stats', '{"total_shipments": 12500, "packages_delivered": 12450, "countries_served": 150, "customer_satisfaction": 99}');

-- Seed a sample shipment
with new_shipment as (
  insert into shipments (
    tracking_number, 
    reference_number, 
    status, 
    shipping_method, 
    dispatch_date, 
    estimated_delivery, 
    current_location, 
    destination,
    sender_name,
    sender_address,
    sender_country,
    recipient_name,
    recipient_address,
    recipient_country,
    recipient_phone,
    package_name,
    package_description,
    weight,
    current_lat,
    current_lng,
    destination_lat,
    destination_lng
  ) values (
    'GEL784521963US',
    'REF-5522-X',
    'In Transit',
    'Air Freight',
    now() - interval '2 days',
    now() + interval '3 days',
    'New York, USA',
    'London, UK',
    'Global Tech Inc.',
    '450 Industrial Pkwy',
    'USA',
    'Emma Wilson',
    '22 Baker Street',
    'United Kingdom',
    '+44 20 7946 0000',
    'High-End Server Rack',
    'Fragile electronic equipment for data center expansion.',
    '45.5 kg',
    40.7128,
    -74.0060,
    51.5074,
    -0.1278
  ) returning id
)
-- Seed status history for the shipment
insert into shipment_status_history (shipment_id, status, location, description)
select id, 'Shipment Created', 'New York, USA', 'Shipment information received' from new_shipment
union all
select id, 'Package Collected', 'New York, USA', 'Package has been picked up by the courier' from new_shipment
union all
select id, 'Processing', 'JFK Logistics Hub', 'Package is being processed at the hub' from new_shipment
union all
select id, 'In Transit', 'Atlantic Ocean', 'Package is currently in transit to destination hub' from new_shipment;

-- Seed fees for the shipment
insert into shipment_fees (shipment_id, title, description, amount, due_date, status)
select id, 'Customs Duty Fee', 'Import duties for electronic equipment', 450.00, now() + interval '5 days', 'pending' from new_shipment;

-- Seed payment methods
insert into payment_methods (name, symbol, wallet_address, network, is_enabled)
values 
('Bitcoin', 'BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Mainnet', true),
('Ethereum', 'ETH', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'ERC20', true),
('USDT', 'USDT', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'ERC20', true);
