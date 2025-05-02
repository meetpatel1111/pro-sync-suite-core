
import { createClient } from '@supabase/supabase-js';
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Instead of using process.env which is Node.js specific, we'll use the already 
// configured Supabase client from the integrations folder
export const supabase = integrationSupabase;

