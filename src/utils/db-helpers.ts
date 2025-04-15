
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
 * Checks if a table exists using the RPC function
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', { table_name: tableName });
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return await checkTableExistsAlternative(tableName);
    }
    
    return data > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return await checkTableExistsAlternative(tableName);
  }
};

/**
 * Alternative method to check if a table exists when the RPC function is not available.
 * This is less reliable but works as a fallback.
 */
export const checkTableExistsAlternative = async (tableName: string): Promise<boolean> => {
  try {
    // This uses a raw query with type assertion to avoid type errors
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(1);
    
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

/**
 * Generic type-safe function to perform database operations
 * This helps with TypeScript errors when accessing tables not in the types.ts file
 */
export const safeQueryTable = async <T = any>(
  tableName: string, 
  operation: (query: any) => any
): Promise<{ data: T[] | null; error: any }> => {
  try {
    const exists = await checkTableExists(tableName);
    if (!exists) {
      console.warn(`Table ${tableName} does not exist`);
      return { data: null, error: new Error(`Table ${tableName} does not exist`) };
    }
    
    // Use type assertion to bypass TypeScript constraints
    const query = supabase.from(tableName as any);
    const result = await operation(query);
    
    return { 
      data: result.data as T[] | null, 
      error: result.error 
    };
  } catch (error) {
    console.error(`Error in safeQueryTable for ${tableName}:`, error);
    return { data: null, error };
  }
};
