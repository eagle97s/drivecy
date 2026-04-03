-- DriveCY Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Listings table
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Vehicle info
  make text not null,
  model text not null,
  year integer not null,
  price integer not null,
  mileage integer not null,
  fuel_type text not null,
  transmission text not null,
  body_type text not null,
  color text,
  engine_size text,
  horsepower integer,
  doors integer default 4,
  
  -- Listing info
  title text not null,
  description text,
  city text not null,
  features text[] default '{}',
  images text[] default '{}',
  
  -- Seller info
  seller_name text not null,
  seller_phone text not null,
  seller_email text,
  user_id uuid references auth.users(id),
  
  -- Status
  status text default 'active' check (status in ('active', 'pending', 'sold', 'deleted'))
);

-- Indexes for common queries
create index idx_listings_make on public.listings(make);
create index idx_listings_city on public.listings(city);
create index idx_listings_price on public.listings(price);
create index idx_listings_year on public.listings(year);
create index idx_listings_status on public.listings(status);
create index idx_listings_created on public.listings(created_at desc);

-- Row Level Security
alter table public.listings enable row level security;

-- Everyone can read active listings
create policy "Anyone can view active listings"
  on public.listings for select
  using (status = 'active');

-- Authenticated users can insert
create policy "Authenticated users can create listings"
  on public.listings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own listings
create policy "Users can update own listings"
  on public.listings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Also allow anonymous inserts for now (no auth yet)
create policy "Anyone can create listings for now"
  on public.listings for insert
  to anon
  with check (true);

-- Storage bucket for car images
insert into storage.buckets (id, name, public) 
values ('car-images', 'car-images', true);

-- Anyone can upload to car-images
create policy "Anyone can upload car images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'car-images');

-- Anyone can view car images
create policy "Anyone can view car images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'car-images');
