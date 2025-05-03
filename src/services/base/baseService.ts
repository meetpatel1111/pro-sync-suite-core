
import { supabase } from '@/integrations/supabase/client';

// Helper function to handle errors
export const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// Base service class with common utilities
export const baseService = {
  supabase,
  handleError
};

export default baseService;
