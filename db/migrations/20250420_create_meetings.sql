-- Migration: Create meetings table for CollabSpace and PlanBoard integration

CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    time TIMESTAMPTZ NOT NULL,
    duration INTERVAL,
    notes TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups by project
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
-- Index for quick lookups by host
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
