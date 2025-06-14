-- TaskMaster Module Migration
-- Creates all tables required for the Task & Workflow Management module

-- 1. tasks
drop table if exists task_activity_log cascade;
drop table if exists task_dependencies cascade;
drop table if exists task_tag_assignments cascade;
drop table if exists task_tags cascade;
drop table if exists task_files cascade;
drop table if exists task_comments cascade;
drop table if exists task_checklists cascade;
drop table if exists tasks cascade;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  description text,
  status text not null, -- 'todo', 'in_progress', 'done', etc.
  priority text not null, -- 'low', 'medium', 'high', 'critical'
  start_date date,
  due_date date,
  created_by uuid references auth.users(id),
  assigned_to uuid[], -- array of user IDs
  reviewer_id uuid references auth.users(id),
  parent_task_id uuid references tasks(id),
  recurrence_rule text,
  visibility text default 'team', -- 'team', 'private', 'public'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. task_checklists
create table if not exists task_checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. task_comments
create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id),
  content text not null,
  parent_id uuid references task_comments(id),
  created_at timestamp with time zone default now()
);

-- 4. task_files
create table if not exists task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  file_url text not null,
  uploaded_by uuid references auth.users(id),
  file_type text,
  created_at timestamp with time zone default now()
);

-- 5. task_tags
create table if not exists task_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text
);

-- 6. task_tag_assignments
create table if not exists task_tag_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  tag_id uuid references task_tags(id) on delete cascade
);

-- 7. task_dependencies
create table if not exists task_dependencies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  depends_on_task_id uuid references tasks(id) on delete cascade
);

-- 8. task_activity_log
create table if not exists task_activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null, -- e.g., 'status_change', 'comment_added'
  description text,
  timestamp timestamp with time zone default now()
); 