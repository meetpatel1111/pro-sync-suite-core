-- Enable uuid_generate_v4() if not already enabled
create extension if not exists "uuid-ossp";

-- Create the resource_allocations table
create table if not exists public.resource_allocations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  team text not null,
  allocation int not null check (allocation >= 0 and allocation <= 100),
  created_at timestamptz default now()
);

-- Optionally, add an index for faster queries by user
create index if not exists idx_resource_allocations_user_id on public.resource_allocations(user_id);
