
# Database Schema Documentation

This document describes the complete database schema for ProSync Suite.

## Overview

ProSync Suite uses PostgreSQL via Supabase with Row Level Security (RLS) enabled for all tables. The schema is designed for multi-tenant operation with user-based data isolation.

## Core Tables

### Authentication & Users

#### `auth.users` (Supabase managed)
- Core authentication table managed by Supabase
- Contains email, encrypted_password, metadata

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  job_title TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_settings`
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  email_notifications JSONB,
  app_notifications JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### TaskMaster Tables

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[],
  due_date DATE,
  start_date DATE,
  estimate_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  task_number INTEGER DEFAULT 1,
  board_id UUID REFERENCES boards(id),
  sprint_id UUID REFERENCES sprints(id),
  story_points INTEGER,
  epic_id UUID REFERENCES tasks(id),
  parent_task_id UUID REFERENCES tasks(id),
  position INTEGER DEFAULT 0,
  type TEXT DEFAULT 'task',
  labels TEXT[],
  watchers UUID[],
  blocked_by UUID[],
  blocks UUID[],
  linked_task_ids UUID[],
  task_key TEXT,
  visibility TEXT DEFAULT 'team',
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `boards`
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'kanban',
  description TEXT,
  project_id UUID REFERENCES projects(id),
  config JSONB DEFAULT '{"columns": [{"id": "todo", "name": "To Do"}, {"id": "in_progress", "name": "In Progress"}, {"id": "done", "name": "Done"}]}',
  wip_limits JSONB DEFAULT '{}',
  swimlane_config JSONB DEFAULT '{"type": "none", "enabled": false}',
  filters JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{"admins": [], "viewers": [], "contributors": []}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `task_comments`
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES task_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### TimeTrackPro Tables

#### `time_entries`
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT NOT NULL,
  time_spent INTEGER NOT NULL, -- in minutes
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  manual BOOLEAN NOT NULL DEFAULT false,
  billable BOOLEAN DEFAULT true,
  hourly_rate NUMERIC,
  project TEXT NOT NULL,
  tags TEXT[],
  notes TEXT
);
```

#### `work_sessions`
```sql
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### BudgetBuddy Tables

#### `expenses`
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  category_id TEXT,
  description TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  receipt_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `budgets`
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  total NUMERIC,
  spent NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### CollabSpace Tables

#### `channels`
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  about TEXT,
  type TEXT NOT NULL DEFAULT 'public',
  project_id UUID REFERENCES projects(id),
  created_by UUID REFERENCES auth.users(id),
  auto_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  parent_id UUID REFERENCES messages(id),
  mentions JSONB,
  reactions JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  read_by JSONB,
  scheduled_for TIMESTAMPTZ,
  direct_message_id UUID REFERENCES direct_messages(id),
  group_message_id UUID REFERENCES group_messages(id),
  reply_to_id UUID REFERENCES messages(id),
  thread_count INTEGER DEFAULT 0,
  is_system_message BOOLEAN DEFAULT false,
  username TEXT,
  name TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### FileVault Tables

#### `folders`
```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### ResourceHub Tables

#### `resources`
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  availability TEXT,
  utilization INTEGER,
  allocation NUMERIC,
  current_project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  schedule JSONB,
  allocation_history JSONB,
  utilization_history JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `allocations`
```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id),
  project_id UUID REFERENCES projects(id),
  percent NUMERIC,
  from_date DATE,
  to_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### ClientConnect Tables

#### `clients`
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### System Tables

#### `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  related_to TEXT,
  related_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `integration_actions`
```sql
CREATE TABLE integration_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  source_app TEXT NOT NULL,
  target_app TEXT NOT NULL,
  action_type TEXT NOT NULL,
  trigger_condition TEXT,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT
);
```

## Indexes

Key indexes for performance:

```sql
-- Task queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Time entries
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);

-- Messages
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
</sql>

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data or data they have permission to view.

Example RLS policy:
```sql
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (
    created_by = auth.uid() OR 
    assignee_id = auth.uid() OR 
    auth.uid() = ANY(assigned_to)
  );
```

## Database Functions

Key database functions for automation and data integrity:

- `handle_new_user()` - Creates user profile on signup
- `log_task_changes()` - Logs task status changes
- `create_task_notification()` - Creates notifications for task assignments
- `update_updated_at_column()` - Updates timestamps

## Migrations

Database migrations are managed through Supabase and can be found in the `supabase/migrations/` directory.
