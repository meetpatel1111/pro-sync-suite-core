-- Migration: Add custom password support to users table for ProSync Suite
-- Adds columns for bcrypt-hashed password and password change tracking

-- Drop and recreate users table with all columns from auth.users and custom columns
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  instance_id uuid,
  id uuid PRIMARY KEY,
  aud text,
  role text,
  email text,
  encrypted_password text,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token text,
  confirmation_sent_at timestamp with time zone,
  recovery_token text,
  recovery_sent_at timestamp with time zone,
  email_change_token_new text,
  email_change text,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text,
  phone_confirmed_at timestamp with time zone,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  email_change_token_current text,
  email_change_confirm_status smallint,
  banned_until timestamp with time zone,
  reauthentication_token text,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean,
  deleted_at timestamp with time zone,
  is_anonymous boolean,
  -- Custom columns
  username text,
  full_name text,
  avatar_url text,
  custom_password_hash text,
  password_last_changed timestamp with time zone
);

-- Trigger: Insert from auth.users to users
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_users()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token,
    confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at,
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
    phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status,
    banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous,
    username, full_name, avatar_url, custom_password_hash, password_last_changed
  )
  VALUES (
    NEW.instance_id, NEW.id, NEW.aud, NEW.role, NEW.email, NEW.encrypted_password, NEW.email_confirmed_at, NEW.invited_at, NEW.confirmation_token,
    NEW.confirmation_sent_at, NEW.recovery_token, NEW.recovery_sent_at, NEW.email_change_token_new, NEW.email_change, NEW.email_change_sent_at,
    NEW.last_sign_in_at, NEW.raw_app_meta_data, NEW.raw_user_meta_data, NEW.is_super_admin, NEW.created_at, NEW.updated_at, NEW.phone, NEW.phone_confirmed_at,
    NEW.phone_change, NEW.phone_change_token, NEW.phone_change_sent_at, NEW.confirmed_at, NEW.email_change_token_current, NEW.email_change_confirm_status,
    NEW.banned_until, NEW.reauthentication_token, NEW.reauthentication_sent_at, NEW.is_sso_user, NEW.deleted_at, NEW.is_anonymous,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL, -- custom_password_hash
    NULL  -- password_last_changed
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_auth_user_to_users ON auth.users;
CREATE TRIGGER trg_sync_auth_user_to_users
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_users();

-- Trigger: Update from auth.users to users (preserves custom columns)
CREATE OR REPLACE FUNCTION public.update_auth_user_to_users()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users SET
    instance_id = NEW.instance_id,
    aud = NEW.aud,
    role = NEW.role,
    email = NEW.email,
    encrypted_password = NEW.encrypted_password,
    email_confirmed_at = NEW.email_confirmed_at,
    invited_at = NEW.invited_at,
    confirmation_token = NEW.confirmation_token,
    confirmation_sent_at = NEW.confirmation_sent_at,
    recovery_token = NEW.recovery_token,
    recovery_sent_at = NEW.recovery_sent_at,
    email_change_token_new = NEW.email_change_token_new,
    email_change = NEW.email_change,
    email_change_sent_at = NEW.email_change_sent_at,
    last_sign_in_at = NEW.last_sign_in_at,
    raw_app_meta_data = NEW.raw_app_meta_data,
    raw_user_meta_data = NEW.raw_user_meta_data,
    is_super_admin = NEW.is_super_admin,
    created_at = NEW.created_at,
    updated_at = NEW.updated_at,
    phone = NEW.phone,
    phone_confirmed_at = NEW.phone_confirmed_at,
    phone_change = NEW.phone_change,
    phone_change_token = NEW.phone_change_token,
    phone_change_sent_at = NEW.phone_change_sent_at,
    confirmed_at = NEW.confirmed_at,
    email_change_token_current = NEW.email_change_token_current,
    email_change_confirm_status = NEW.email_change_confirm_status,
    banned_until = NEW.banned_until,
    reauthentication_token = NEW.reauthentication_token,
    reauthentication_sent_at = NEW.reauthentication_sent_at,
    is_sso_user = NEW.is_sso_user,
    deleted_at = NEW.deleted_at,
    is_anonymous = NEW.is_anonymous,
    username = NEW.raw_user_meta_data->>'username',
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    avatar_url = NEW.raw_user_meta_data->>'avatar_url'
    -- custom_password_hash and password_last_changed are preserved
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_auth_user_to_users ON auth.users;
CREATE TRIGGER trg_update_auth_user_to_users
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.update_auth_user_to_users();

-- Trigger: Delete from auth.users to users
CREATE OR REPLACE FUNCTION public.delete_auth_user_from_users()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_delete_auth_user_from_users ON auth.users;
CREATE TRIGGER trg_delete_auth_user_from_users
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.delete_auth_user_from_users();

-- Backfill users table from auth.users with autofill for custom columns
INSERT INTO public.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token,
  confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
  phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status,
  banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous,
  username, full_name, avatar_url, custom_password_hash, password_last_changed
)
SELECT
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token,
  confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
  phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status,
  banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous,
  raw_user_meta_data->>'username',
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  raw_user_meta_data->>'avatar_url',
  NULL, -- custom_password_hash
  NULL  -- password_last_changed
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- Rollback
-- ALTER TABLE users DROP COLUMN custom_password_hash;
-- ALTER TABLE users DROP COLUMN password_last_changed;
