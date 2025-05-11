-- Create storage bucket for FileVault
select storage.create_bucket('file_vault', {'public': false});

-- Create table for file metadata
create table if not exists file_vault (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  file_type text not null,
  size_bytes bigint not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_public boolean default false not null,
  is_archived boolean default false not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  folder_path text default '/' not null,
  shared_with uuid[] default array[]::uuid[] not null
);

-- Enable RLS
alter table file_vault enable row level security;

-- Create policies
create policy "Users can view their own files and files shared with them"
  on file_vault for select
  using (
    auth.uid() = created_by or
    auth.uid() = any(shared_with)
  );

create policy "Users can insert their own files"
  on file_vault for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own files"
  on file_vault for update
  using (auth.uid() = created_by);

create policy "Users can delete their own files"
  on file_vault for delete
  using (auth.uid() = created_by);

-- Create functions
create or replace function public.get_file_vault_items(
  search_query text default null,
  is_archived_param boolean default false,
  folder_path_param text default '/'
)
returns setof file_vault
language sql
security definer
set search_path = public
stable
as $$
  select *
  from file_vault
  where (
    created_by = auth.uid() or
    auth.uid() = any(shared_with)
  )
  and is_archived = is_archived_param
  and folder_path = folder_path_param
  and (
    search_query is null or
    name ilike '%' || search_query || '%' or
    description ilike '%' || search_query || '%'
  )
  order by created_at desc;
$$;
