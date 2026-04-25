
-- Create a table for bookings
create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  arena_id text not null, -- 'arena-1' or 'arena-2'
  game_mode text not null,
  game_slug text not null,
  player_count integer not null,
  customer_name text not null,
  customer_email text not null,
  status text default 'pending_payment', -- 'pending_payment', 'confirmed', 'cancelled'
  payment_id text -- Stripe Payment Intent ID
);

-- Enable Row Level Security (RLS)
alter table bookings enable row level security;

-- Create a policy that allows anyone to read bookings (to check availability)
create policy "Enable read access for all users"
on bookings for select
using (true);

-- Create a policy that allows anyone to insert bookings (public booking form)
-- In a real app, you might want to restrict this to authenticated users or validate via server function
create policy "Enable insert access for all users"
on bookings for insert
with check (true);
