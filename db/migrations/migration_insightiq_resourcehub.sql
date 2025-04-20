-- INSIGHTIQ TABLES

create table if not exists reports (
    report_id uuid primary key default gen_random_uuid(),
    name text,
    created_by uuid
);

create table if not exists charts (
    chart_id uuid primary key default gen_random_uuid(),
    type text,
    report_id uuid references reports(report_id)
);

create table if not exists dashboards (
    dashboard_id uuid primary key default gen_random_uuid(),
    name text,
    user_id uuid
);

create table if not exists dashboard_widgets (
    widget_id uuid primary key default gen_random_uuid(),
    dashboard_id uuid references dashboards(dashboard_id),
    type text
);

create table if not exists drilldowns (
    parent_report_id uuid references reports(report_id),
    child_report_id uuid references reports(report_id)
);

create table if not exists report_exports (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    format text,
    download_url text
);

create table if not exists scheduled_reports (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    schedule_time timestamp with time zone
);

create table if not exists kpi_metrics (
    metric_id uuid primary key default gen_random_uuid(),
    name text,
    value numeric,
    target numeric
);

create table if not exists time_reports (
    id uuid primary key default gen_random_uuid(),
    timesheet_id uuid,
    total_hours numeric
);

create table if not exists finance_reports (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid,
    summary text
);

create table if not exists comparisons (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid,
    actual_value numeric
);

create table if not exists dashboard_settings (
    id uuid primary key default gen_random_uuid(),
    dashboard_id uuid references dashboards(dashboard_id),
    refresh_interval int
);

create table if not exists report_filters (
    id uuid primary key default gen_random_uuid(),
    filter_type text,
    filter_value text
);

create table if not exists report_bookmarks (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    user_id uuid
);

create table if not exists report_permissions (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    user_id uuid
);

create table if not exists embeds (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    token text
);

create table if not exists kpi_alerts (
    id uuid primary key default gen_random_uuid(),
    metric_id uuid references kpi_metrics(metric_id),
    threshold_value numeric
);

create table if not exists snapshots (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    snapshot_date date
);

create table if not exists report_logs (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    action text,
    user_id uuid
);

create table if not exists report_formulas (
    id uuid primary key default gen_random_uuid(),
    formula_text text,
    report_id uuid references reports(report_id)
);

create table if not exists project_health (
    id uuid primary key default gen_random_uuid(),
    project_id uuid,
    status text
);

create table if not exists risk_reports (
    id uuid primary key default gen_random_uuid(),
    risk_id uuid,
    impact_score numeric
);

create table if not exists heatmaps (
    id uuid primary key default gen_random_uuid(),
    widget_id uuid references dashboard_widgets(widget_id),
    data_source text
);

create table if not exists chart_trends (
    id uuid primary key default gen_random_uuid(),
    chart_id uuid references charts(chart_id),
    trend_type text
);

create table if not exists engagement (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    activity_score numeric
);

create table if not exists productivity_reports (
    id uuid primary key default gen_random_uuid(),
    team_id uuid,
    score numeric
);

create table if not exists file_analytics (
    id uuid primary key default gen_random_uuid(),
    file_id uuid,
    views int,
    downloads int
);

create table if not exists task_analytics (
    id uuid primary key default gen_random_uuid(),
    task_id uuid,
    completion_time numeric
);

create table if not exists email_summaries (
    summary_id uuid primary key default gen_random_uuid(),
    user_id uuid,
    summary text
);

create table if not exists report_builders (
    id uuid primary key default gen_random_uuid(),
    config_json jsonb
);

create table if not exists filter_chains (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    chain_order int
);

create table if not exists data_sources (
    id uuid primary key default gen_random_uuid(),
    source_type text,
    linked_id uuid
);

create table if not exists data_warehouse (
    dataset_id uuid primary key default gen_random_uuid(),
    last_synced timestamp with time zone
);

create table if not exists role_reports (
    id uuid primary key default gen_random_uuid(),
    role_id uuid,
    report_id uuid references reports(report_id)
);

create table if not exists client_reports (
    id uuid primary key default gen_random_uuid(),
    client_id uuid,
    report_id uuid references reports(report_id)
);

create table if not exists usage_stats (
    id uuid primary key default gen_random_uuid(),
    app_name text,
    usage_time numeric
);

create table if not exists forecasts (
    id uuid primary key default gen_random_uuid(),
    metric_id uuid references kpi_metrics(metric_id),
    predicted_value numeric
);

create table if not exists sla_metrics (
    id uuid primary key default gen_random_uuid(),
    target numeric,
    achieved numeric
);

create table if not exists budget_charts (
    id uuid primary key default gen_random_uuid(),
    budget_id uuid,
    variance numeric
);

alter table if exists file_insights add column if not exists key_facts text;

create table if not exists dashboard_themes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    theme_settings jsonb
);

create table if not exists report_comments (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references reports(report_id),
    user_id uuid,
    message text
);

create table if not exists report_comparisons (
    id uuid primary key default gen_random_uuid(),
    report_ids uuid[]
);

create table if not exists saved_filters (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    filter_json jsonb
);

create table if not exists audit_reports (
    id uuid primary key default gen_random_uuid(),
    entity_type text,
    user_id uuid
);

create table if not exists gantt_analytics (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid,
    delay numeric
);

create table if not exists download_logs (
    id uuid primary key default gen_random_uuid(),
    file_id uuid,
    user_id uuid
);

create table if not exists sla_trends (
    id uuid primary key default gen_random_uuid(),
    date date,
    target_vs_actual text
);

create table if not exists admin_logs (
    id uuid primary key default gen_random_uuid(),
    action_type text,
    timestamp timestamp with time zone
);

-- RESOURCEHUB TABLES

alter table if exists users add column if not exists role text;
alter table if exists users add column if not exists department text;

create table if not exists roles (
    role_id uuid primary key default gen_random_uuid(),
    title text
);

create table if not exists project_resources (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    project_id uuid
);

create table if not exists resource_allocation (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    hours int
);

create table if not exists availability_calendar (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    date date,
    status text
);

create table if not exists user_skills (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    skill text
);

create table if not exists skill_filters (
    id uuid primary key default gen_random_uuid(),
    skill_name text
);

create table if not exists resource_utilization (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    workload_percent numeric
);

create table if not exists availability_reports (
    id uuid primary key default gen_random_uuid(),
    team_id uuid,
    availability numeric
);

create table if not exists task_assignments (
    id uuid primary key default gen_random_uuid(),
    task_id uuid,
    assigned_to uuid
);

create table if not exists client_teams (
    id uuid primary key default gen_random_uuid(),
    client_id uuid,
    team_id uuid
);

create table if not exists shifts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    shift_start timestamp with time zone,
    shift_end timestamp with time zone
);

alter table if exists timesheets add column if not exists project_id uuid;

create table if not exists project_allocation (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    allocated_hours int
);

create table if not exists utilization_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    percentage numeric
);

create table if not exists resource_suggestions (
    id uuid primary key default gen_random_uuid(),
    skill text,
    available_users uuid[]
);

create table if not exists demand_forecast (
    id uuid primary key default gen_random_uuid(),
    role text,
    projected_need int
);

create table if not exists team_changes (
    id uuid primary key default gen_random_uuid(),
    change_type text,
    date date
);

create table if not exists conflict_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    conflict_reason text
);

create table if not exists capacity_plans (
    id uuid primary key default gen_random_uuid(),
    team_id uuid,
    month int,
    max_capacity int
);

create table if not exists location_status (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    is_remote boolean
);

create table if not exists absences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    from_date date,
    to_date date
);

create table if not exists calendar_exports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    export_url text
);

create table if not exists multi_project_allocation (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    project_ids uuid[]
);

create table if not exists cross_teams (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    team_ids uuid[]
);

create table if not exists workload_sim (
    scenario_id uuid primary key default gen_random_uuid(),
    load_config jsonb
);

create table if not exists billability (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    billable_ratio numeric
);

create table if not exists overbooking_alerts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    alert_status text
);

create table if not exists availability_graphs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    graph_json jsonb
);

create table if not exists team_leads (
    id uuid primary key default gen_random_uuid(),
    team_id uuid,
    lead_id uuid
);

create table if not exists efficiency_stats (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    efficiency_score numeric
);

create table if not exists holidays (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    date date
);

create table if not exists staff_costs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    cost_rate numeric
);

create table if not exists department_plans (
    id uuid primary key default gen_random_uuid(),
    department_id uuid,
    total_allocated numeric
);

create table if not exists gantt_overlay (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    availability_score numeric
);

create table if not exists employment_type (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    type text
);

create table if not exists turnover_reports (
    id uuid primary key default gen_random_uuid(),
    period text,
    turnover_rate numeric
);

create table if not exists training_needs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    skill_gap text
);

create table if not exists backfill_requests (
    id uuid primary key default gen_random_uuid(),
    role_id uuid,
    urgency text
);

create table if not exists ai_allocations (
    suggestion_id uuid primary key default gen_random_uuid(),
    reason text
);

create table if not exists department_load (
    id uuid primary key default gen_random_uuid(),
    department_id uuid,
    avg_load numeric
);

create table if not exists client_assignments (
    id uuid primary key default gen_random_uuid(),
    client_id uuid,
    user_id uuid
);

create table if not exists workload_ui (
    id uuid primary key default gen_random_uuid(),
    layout_config jsonb
);

create table if not exists contract_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    contract_terms text
);

create table if not exists milestone_resources (
    id uuid primary key default gen_random_uuid(),
    milestone_id uuid,
    user_id uuid
);

create table if not exists resource_audit (
    id uuid primary key default gen_random_uuid(),
    action text,
    performed_by uuid
);

create table if not exists sla_staffing (
    id uuid primary key default gen_random_uuid(),
    sla_id uuid,
    resource_needs text
);

create table if not exists resource_insights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    stats_id uuid
);

create table if not exists resource_impact (
    id uuid primary key default gen_random_uuid(),
    project_id uuid,
    resource_score numeric
);

create table if not exists archived_users (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    archived_date date
);
