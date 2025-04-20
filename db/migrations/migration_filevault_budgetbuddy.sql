-- FILEVAULT TABLES

create table if not exists folders (
    folder_id uuid primary key default gen_random_uuid(),
    folder_name text not null,
    created_by uuid references users(id),
    created_at timestamp with time zone default now()
);

alter table files add column if not exists folder_id uuid references folders(folder_id);
alter table files add column if not exists preview_url text;
alter table files add column if not exists is_archived boolean default false;
alter table files add column if not exists watermark text;
alter table files add column if not exists viewer_type text;
alter table files add column if not exists is_compressed boolean default false;
alter table files add column if not exists source_url text;

create table if not exists file_shares (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    shared_with_id uuid,
    shared_with_type text, -- 'user' or 'team'
    created_at timestamp with time zone default now()
);

create table if not exists file_permissions (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    user_id uuid,
    access_level text,
    created_at timestamp with time zone default now()
);

create table if not exists file_versions (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    version_no int,
    uploaded_at timestamp with time zone,
    is_active boolean default false
);

create table if not exists file_trash (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    deleted_at timestamp with time zone,
    restored_at timestamp with time zone
);

create table if not exists file_tags (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    tag text
);

create table if not exists file_access_logs (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    accessed_by uuid,
    accessed_at timestamp with time zone default now()
);

create table if not exists file_favorites (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    user_id uuid
);

create table if not exists file_logs (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    action text,
    actor_id uuid,
    created_at timestamp with time zone default now()
);

create table if not exists file_downloads (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    user_id uuid,
    timestamp timestamp with time zone default now()
);

create table if not exists file_backups (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    backup_time timestamp with time zone
);

create table if not exists file_links (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    expiry_date timestamp with time zone,
    password_protected boolean default false
);

create table if not exists annotations (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    user_id uuid,
    content text
);

create table if not exists file_approvals (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    approver_id uuid,
    status text
);

create table if not exists external_links (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    access_token text
);

create table if not exists storage_stats (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    total_storage bigint
);

create table if not exists file_locks (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    locked_by uuid
);

create table if not exists task_files (
    id uuid primary key default gen_random_uuid(),
    task_id uuid references tasks(id),
    file_id uuid references files(id)
);

create table if not exists gantt_files (
    id uuid primary key default gen_random_uuid(),
    item_id uuid,
    file_id uuid references files(id)
);

create table if not exists ocr_texts (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    extracted_text text
);

create table if not exists file_conversions (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    target_format text
);

create table if not exists file_categories (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    category text
);

create table if not exists file_templates (
    template_id uuid primary key default gen_random_uuid(),
    template_name text
);

create table if not exists mobile_uploads (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    device_id text
);

create table if not exists api_keys (
    id uuid primary key default gen_random_uuid(),
    access_scope text
);

create table if not exists file_audit (
    id uuid primary key default gen_random_uuid(),
    action text,
    user_id uuid,
    created_at timestamp with time zone default now()
);

create table if not exists file_sync (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    sync_status text
);

create table if not exists file_notes (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    content text
);

create table if not exists file_sessions (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    session_id uuid
);

create table if not exists chat_files (
    id uuid primary key default gen_random_uuid(),
    message_id uuid,
    file_id uuid references files(id)
);

create table if not exists dashboard_files (
    id uuid primary key default gen_random_uuid(),
    widget_id uuid,
    file_id uuid references files(id)
);

create table if not exists retention_policies (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    delete_after interval
);

create table if not exists alerts (
    id uuid primary key default gen_random_uuid(),
    alert_type text,
    file_id uuid references files(id)
);

create table if not exists admin_settings (
    id uuid primary key default gen_random_uuid(),
    setting_name text,
    value text
);

create table if not exists file_restrictions (
    id uuid primary key default gen_random_uuid(),
    allowed_type text
);

create table if not exists legal_holds (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id)
);

create table if not exists file_insights (
    id uuid primary key default gen_random_uuid(),
    file_id uuid references files(id),
    metric text
);

-- BUDGETBUDDY TABLES

create table if not exists transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    type text, -- income/expense
    amount numeric,
    category_id uuid references categories(id),
    created_at timestamp with time zone default now()
);

create table if not exists budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    month int,
    year int,
    total_budget numeric
);

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    category_name text
);

create table if not exists reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    report_type text,
    generated_at timestamp with time zone default now()
);

create table if not exists project_budgets (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id),
    budget_id uuid references budgets(id)
);

create table if not exists expense_approvals (
    id uuid primary key default gen_random_uuid(),
    expense_id uuid references transactions(id),
    status text
);

create table if not exists receipts (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid references transactions(id),
    file_url text
);

create table if not exists spending_limits (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references categories(id),
    limit numeric
);

create table if not exists currencies (
    currency_code text primary key,
    exchange_rate numeric
);

create table if not exists reimbursements (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid references transactions(id),
    reimbursed boolean
);

create table if not exists dashboard_widgets (
    id uuid primary key default gen_random_uuid(),
    widget_type text,
    user_id uuid references users(id)
);

create table if not exists exports (
    id uuid primary key default gen_random_uuid(),
    export_type text,
    file_url text
);

create table if not exists timesheet_billing (
    id uuid primary key default gen_random_uuid(),
    entry_id uuid,
    billable_amount numeric
);

create table if not exists department_expenses (
    id uuid primary key default gen_random_uuid(),
    dept_id uuid,
    category_id uuid references categories(id)
);

create table if not exists recurring_transactions (
    id uuid primary key default gen_random_uuid(),
    interval text,
    start_date date
);

create table if not exists vendors (
    id uuid primary key default gen_random_uuid(),
    name text,
    contact text
);

create table if not exists client_invoices (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid,
    client_id uuid
);

create table if not exists invoices (
    id uuid primary key default gen_random_uuid(),
    amount numeric,
    due_date date
);

create table if not exists taxes (
    id uuid primary key default gen_random_uuid(),
    rate numeric,
    category_id uuid references categories(id)
);

create table if not exists financial_audit (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid references transactions(id),
    action text
);
