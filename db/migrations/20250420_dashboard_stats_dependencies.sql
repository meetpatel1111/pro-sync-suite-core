-- Migration for dashboard stats dependencies (tasks, time_entries, users)

-- Table: tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project uuid,
  title text not null,
  status text not null check (status in ('open', 'in_progress', 'done', 'issue')),
  created_at timestamptz default now()
);
create index if not exists idx_tasks_user_id on public.tasks(user_id);

-- Table: time_entries
create table if not exists public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  task_id uuid references public.tasks(id),
  time_spent int not null, -- minutes
  created_at timestamptz default now()
);
create index if not exists idx_time_entries_user_id on public.time_entries(user_id);

-- Table: users (if not already present)
create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  created_at timestamptz default now()
);
