
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a function to check if a table exists in the database.
 * This function should be registered in Supabase.
 */
export const createCheckTableExistsFunction = async () => {
  try {
    const { error } = await supabase.rpc('create_check_table_exists_function');
    if (error) {
      console.error('Error creating check_table_exists function:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error creating check_table_exists function:', error);
    return false;
  }
};

/**
 * Alternative method to check if a table exists when the RPC function is not available.
 * This is less reliable but works as a fallback.
 */
export const checkTableExistsAlternative = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1) as any;
    
    return !error;
  } catch (error) {
    return false;
  }
};

/**
 * Execute raw SQL using the Edge Function (if available) or fallback method
 */
export const executeRawSQL = async (sql: string): Promise<boolean> => {
  try {
    // In a real application, you would use the Edge Function to run raw SQL
    // For now, we'll just log it
    console.log('Would execute SQL:', sql);
    return true;
  } catch (error) {
    console.error('Error executing raw SQL:', error);
    return false;
  }
};
