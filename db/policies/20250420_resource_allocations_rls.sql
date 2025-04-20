-- Enable Row Level Security (RLS)
alter table public.resource_allocations enable row level security;

-- Policy: Allow users to CRUD their own resource allocations
create policy "Users can CRUD their own resource allocations"
  on public.resource_allocations
  for all
  using (auth.uid() = user_id);
