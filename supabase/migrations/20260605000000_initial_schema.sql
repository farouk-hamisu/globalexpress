-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shipments table
create table shipments (
  id uuid primary key default uuid_generate_v4(),
  tracking_number text unique not null,
  reference_number text,
  status text not null default 'Pending',
  shipping_method text,
  dispatch_date timestamptz,
  estimated_delivery timestamptz,
  current_location text,
  destination text,
  sender_name text,
  sender_address text,
  sender_country text,
  recipient_name text,
  recipient_address text,
  recipient_country text,
  recipient_phone text,
  package_name text,
  package_description text,
  quantity integer default 1,
  weight text,
  shipment_category text,
  shipment_type text,
  current_lat numeric,
  current_lng numeric,
  destination_lat numeric,
  destination_lng numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shipment Images table
create table shipment_images (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references shipments(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

-- Shipment Status History table
create table shipment_status_history (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references shipments(id) on delete cascade,
  status text not null,
  location text,
  description text,
  timestamp timestamptz default now()
);

-- Shipment Fees table
create table shipment_fees (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references shipments(id) on delete cascade,
  title text not null,
  description text,
  amount numeric not null,
  due_date timestamptz,
  status text not null default 'pending', -- pending, paid, overdue
  created_at timestamptz default now()
);

-- Payment Methods table
create table payment_methods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  symbol text not null,
  wallet_address text not null,
  network text,
  qr_code_url text,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- Payment Submissions table
create table payment_submissions (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references shipments(id) on delete cascade,
  transaction_hash text,
  screenshot_url text,
  notes text,
  status text not null default 'pending', -- pending, approved, rejected
  created_at timestamptz default now()
);

-- Support Tickets table
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  tracking_number text,
  full_name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'open', -- open, pending, resolved
  created_at timestamptz default now()
);

-- Testimonials table
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  content text not null,
  rating integer default 5,
  photo_url text,
  created_at timestamptz default now()
);

-- Contacts table
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- Site Settings table
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- RLS Policies
-- For simplicity in this demo, we allow public read of shipments by tracking number
-- and authenticated (admin) access to everything.

alter table shipments enable row level security;
alter table shipment_images enable row level security;
alter table shipment_status_history enable row level security;
alter table shipment_fees enable row level security;
alter table payment_methods enable row level security;
alter table payment_submissions enable row level security;
alter table support_tickets enable row level security;
alter table testimonials enable row level security;
alter table contacts enable row level security;
alter table site_settings enable row level security;

-- Public read access for tracking
create policy "Allow public read of shipments by tracking_number" on shipments
  for select using (true);

create policy "Allow public read of shipment_images" on shipment_images
  for select using (true);

create policy "Allow public read of shipment_status_history" on shipment_status_history
  for select using (true);

create policy "Allow public read of shipment_fees" on shipment_fees
  for select using (true);

create policy "Allow public read of payment_methods" on payment_methods
  for select using (true);

create policy "Allow public read of testimonials" on testimonials
  for select using (true);

-- Admin access (for authenticated users)
-- In a real app, you'd check for an 'admin' role or specific email
create policy "Allow admins full access to shipments" on shipments
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to shipment_images" on shipment_images
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to shipment_status_history" on shipment_status_history
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to shipment_fees" on shipment_fees
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to payment_methods" on payment_methods
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to payment_submissions" on payment_submissions
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to support_tickets" on support_tickets
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to testimonials" on testimonials
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to contacts" on contacts
  using (auth.role() = 'authenticated');

create policy "Allow admins full access to site_settings" on site_settings
  using (auth.role() = 'authenticated');

-- Public can insert support tickets and contacts
create policy "Allow public to insert support_tickets" on support_tickets
  for insert with check (true);

create policy "Allow public to insert contacts" on contacts
  for insert with check (true);

create policy "Allow public to insert payment_submissions" on payment_submissions
  for insert with check (true);
