-- Migration script to create required tables for Resource Hub

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  availability text,
  utilization integer,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create table if not exists resource_skills (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references resources(id) on delete cascade,
  skill text not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);
