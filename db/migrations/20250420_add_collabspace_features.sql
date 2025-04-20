-- Migration: Add CollabSpace Feature Tables (polls, poll_votes, in_app_notifications, meeting_notes)

-- 1. Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Example: ["Yes","No","Maybe"]
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Poll Votes Table
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    option_index INT NOT NULL, -- Index of the chosen option
    voted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (poll_id, user_id)
);

-- 3. In-App Notifications Table
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'mention', 'reply', 'alert', etc.
    related_id UUID, -- Can reference message, meeting, etc.
    message TEXT,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Meeting Notes Table
CREATE TABLE IF NOT EXISTS meeting_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
