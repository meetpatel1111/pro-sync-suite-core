-- CollabSpace MVP: Channels and Messages

-- 1. Channels Table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'public', -- public, private, dm
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  content text,
  type text NOT NULL DEFAULT 'text', -- text, file, reaction, etc.
  file_url text, -- for file messages
  parent_id uuid REFERENCES messages(id), -- for threads/replies
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Index for fast channel message lookup
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);

-- 4. (Optional) Reactions Table (for MVP, can store as JSON in messages)
ALTER TABLE messages ADD COLUMN reactions jsonb DEFAULT '{}'::jsonb;

-- 5. (Optional) DMs Table (for 1:1 chats, can use channels with type='dm')
CREATE TABLE IF NOT EXISTS dms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id),
  user2_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- 6. (Optional) Files Table (for file management, for now use file_url in messages)
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  uploaded_by uuid REFERENCES users(id),
  channel_id uuid REFERENCES channels(id),
  created_at timestamptz DEFAULT now()
);
