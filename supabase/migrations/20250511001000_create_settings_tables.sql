-- Create ENUM types for settings
CREATE TYPE notification_delivery_method AS ENUM ('email', 'push', 'in-app');
CREATE TYPE setting_scope AS ENUM ('user', 'org');

-- General Settings Table
CREATE TABLE general_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID,  -- Will be linked to organizations table when created
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    scope setting_scope NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, org_id, setting_key)
);

-- Appearance Settings Table
CREATE TABLE appearance_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID,
    theme TEXT DEFAULT 'light',
    primary_color TEXT DEFAULT '#2563eb',
    font_size TEXT DEFAULT 'medium',
    sidebar_state TEXT DEFAULT 'expanded',
    layout JSONB DEFAULT '{}',
    ui_density TEXT DEFAULT 'standard',
    animations_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, org_id)
);

-- Notification Settings Table
CREATE TABLE notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    app TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    delivery_method notification_delivery_method DEFAULT 'in-app',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, app, setting_key, delivery_method)
);

-- Security Settings Table
CREATE TABLE security_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, org_id, setting_key)
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_info TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Data Management Settings Table
CREATE TABLE data_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID,
    data_type TEXT NOT NULL,
    retention_days INTEGER,
    auto_export BOOLEAN DEFAULT false,
    linked_services JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, org_id, data_type)
);

-- Add Row Level Security (RLS) Policies
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appearance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own settings"
    ON general_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own settings"
    ON general_settings FOR ALL
    USING (auth.uid() = user_id);

-- Repeat similar policies for other tables
CREATE POLICY "Users can view their own appearance settings"
    ON appearance_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own appearance settings"
    ON appearance_settings FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own notification settings"
    ON notification_settings FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own security settings"
    ON security_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own security settings"
    ON security_settings FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
    ON user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own sessions"
    ON user_sessions FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data settings"
    ON data_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own data settings"
    ON data_settings FOR ALL
    USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_general_settings_updated_at
    BEFORE UPDATE ON general_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appearance_settings_updated_at
    BEFORE UPDATE ON appearance_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at
    BEFORE UPDATE ON security_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_settings_updated_at
    BEFORE UPDATE ON data_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
