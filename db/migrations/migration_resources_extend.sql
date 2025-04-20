-- Migration script to extend the resources table for schedule, utilization, and project allocation features

alter table resources
  add column if not exists schedule jsonb, -- stores weekly/daily schedule, e.g. availability per day
  add column if not exists allocation numeric, -- percent allocation to projects (0-100)
  add column if not exists current_project_id uuid references projects(id), -- current assigned project
  add column if not exists allocation_history jsonb, -- array of {project_id, percent, from, to}
  add column if not exists utilization_history jsonb; -- array of {date, utilization_percent}

-- Optionally, create a projects table if it doesn't exist
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);
