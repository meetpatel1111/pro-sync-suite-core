-- Migration script to extend ResourceHub for allocations, unavailability, and utilization history

CREATE TABLE IF NOT EXISTS allocations (
    id uuid primary key default gen_random_uuid(),
    resource_id uuid references resources(id) on delete cascade,
    project_id uuid references projects(id),
    percent numeric, -- percent allocation (0-100)
    from_date date,
    to_date date,
    notes text,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS unavailability (
    id uuid primary key default gen_random_uuid(),
    resource_id uuid references resources(id) on delete cascade,
    from_date date,
    to_date date,
    reason text,
    approved boolean default false,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS utilization_history (
    id uuid primary key default gen_random_uuid(),
    resource_id uuid references resources(id) on delete cascade,
    date date,
    utilization_percent numeric
);
