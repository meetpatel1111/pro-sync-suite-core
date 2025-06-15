
-- Add direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) NOT NULL,
  user2_id UUID REFERENCES auth.users(id) NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add group DMs table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add group members table
CREATE TABLE IF NOT EXISTS public.group_message_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add message files table for file attachments
CREATE TABLE IF NOT EXISTS public.message_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add pinned messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  pinned_by UUID REFERENCES auth.users(id) NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add task mentions table for TaskMaster integration
CREATE TABLE IF NOT EXISTS public.task_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add message search index table
CREATE TABLE IF NOT EXISTS public.message_search (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  search_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update messages table to support threading and DMs
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS direct_message_id UUID REFERENCES public.direct_messages(id),
ADD COLUMN IF NOT EXISTS group_message_id UUID REFERENCES public.group_messages(id),
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id),
ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN DEFAULT false;

-- Update channels table to support project auto-creation
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id),
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;

-- Add RLS policies for direct messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own direct messages" 
  ON public.direct_messages 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create direct messages" 
  ON public.direct_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own direct messages" 
  ON public.direct_messages 
  FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add RLS policies for group messages
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group messages they're part of" 
  ON public.group_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_message_members 
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create group messages" 
  ON public.group_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Add RLS policies for group members
ALTER TABLE public.group_message_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members they're part of" 
  ON public.group_message_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_message_members gm2 
      WHERE gm2.group_id = group_id AND gm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" 
  ON public.group_message_members 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for message files
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view message files in accessible channels" 
  ON public.message_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      LEFT JOIN public.channel_members cm ON m.channel_id = cm.channel_id
      WHERE m.id = message_id 
      AND (cm.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload message files" 
  ON public.message_files 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for pinned messages
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pinned messages in accessible channels" 
  ON public.pinned_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can pin messages" 
  ON public.pinned_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = pinned_by);

-- Add RLS policies for task mentions
ALTER TABLE public.task_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task mentions in accessible messages" 
  ON public.task_mentions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create task mentions" 
  ON public.task_mentions 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for message search
ALTER TABLE public.message_search ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can search messages they have access to" 
  ON public.message_search 
  FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_direct_message ON public.messages(direct_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_message ON public.messages(group_message_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON public.direct_messages(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_message_search_content ON public.message_search USING gin(to_tsvector('english', search_content));

-- Enable realtime for new tables
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_message_members REPLICA IDENTITY FULL;
ALTER TABLE public.message_files REPLICA IDENTITY FULL;
ALTER TABLE public.pinned_messages REPLICA IDENTITY FULL;
ALTER TABLE public.task_mentions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_message_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_mentions;
