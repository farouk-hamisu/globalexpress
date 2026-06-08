-- Create storage buckets for shipment images and payment proofs
insert into storage.buckets (id, name, public) 
values ('shipment-images', 'shipment-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Set up storage policies for shipment-images
create policy "Public Access" on storage.objects for select using (bucket_id = 'shipment-images');
create policy "Admin Upload" on storage.objects for insert with check (bucket_id = 'shipment-images' AND auth.role() = 'authenticated');
create policy "Admin Update" on storage.objects for update with check (bucket_id = 'shipment-images' AND auth.role() = 'authenticated');
create policy "Admin Delete" on storage.objects for delete using (bucket_id = 'shipment-images' AND auth.role() = 'authenticated');

-- Set up storage policies for payment-proofs
create policy "Public Select Proofs" on storage.objects for select using (bucket_id = 'payment-proofs');
create policy "Public Insert Proofs" on storage.objects for insert with check (bucket_id = 'payment-proofs');
create policy "Admin Full Access Proofs" on storage.objects for all using (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
