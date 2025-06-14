
-- Update user_settings table to better support granular font size settings
-- and ensure all appearance settings are properly mapped

-- Add missing columns for better font size support
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS font_size_value INTEGER DEFAULT 16,
ADD COLUMN IF NOT EXISTS font_size_type TEXT DEFAULT 'number' CHECK (font_size_type IN ('preset', 'number'));

-- Update existing font_selection to be more descriptive
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS font_size_preset TEXT DEFAULT 'base';

-- Ensure primary_color and accent_color columns exist with proper defaults
ALTER TABLE public.user_settings 
ALTER COLUMN primary_color SET DEFAULT '#2563eb',
ALTER COLUMN accent_color SET DEFAULT '#3b82f6';

-- Update font_family column to ensure it has proper default
ALTER TABLE public.user_settings 
ALTER COLUMN font_family SET DEFAULT 'Inter';

-- Update interface_spacing to match the expected values
ALTER TABLE public.user_settings 
ALTER COLUMN interface_spacing SET DEFAULT 'standard';

-- Add index for better performance on user settings queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id_updated ON user_settings(user_id, updated_at);

-- Migrate existing font_selection data to new structure
UPDATE public.user_settings 
SET 
    font_size_value = CASE 
        WHEN font_selection = 'xs' THEN 12
        WHEN font_selection = 'sm' THEN 14
        WHEN font_selection = 'small' THEN 14
        WHEN font_selection = 'base' THEN 16
        WHEN font_selection = 'medium' THEN 16
        WHEN font_selection = 'lg' THEN 18
        WHEN font_selection = 'large' THEN 18
        WHEN font_selection = 'xl' THEN 20
        WHEN font_selection = '2xl' THEN 24
        ELSE 16
    END,
    font_size_preset = CASE 
        WHEN font_selection IN ('xs', 'sm', 'base', 'lg', 'xl', '2xl') THEN font_selection
        WHEN font_selection = 'small' THEN 'sm'
        WHEN font_selection = 'medium' THEN 'base'
        WHEN font_selection = 'large' THEN 'lg'
        ELSE 'base'
    END,
    font_size_type = CASE 
        WHEN font_selection IN ('xs', 'sm', 'small', 'base', 'medium', 'lg', 'large', 'xl', '2xl') THEN 'preset'
        ELSE 'number'
    END
WHERE font_selection IS NOT NULL;

-- Update any null values to defaults
UPDATE public.user_settings 
SET 
    font_size_value = COALESCE(font_size_value, 16),
    font_size_preset = COALESCE(font_size_preset, 'base'),
    font_size_type = COALESCE(font_size_type, 'number'),
    primary_color = COALESCE(primary_color, '#2563eb'),
    accent_color = COALESCE(accent_color, '#3b82f6'),
    font_family = COALESCE(font_family, 'Inter'),
    interface_spacing = COALESCE(interface_spacing, 'standard');
