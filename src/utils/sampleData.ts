
import { supabase } from '@/integrations/supabase/client';

export const setupSampleData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  try {
    // Check if user already has sample data
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
      
    if (existingProjects && existingProjects.length > 0) {
      // User already has data, no need to set up sample data
      return true;
    }
    
    console.log('No sample data setup - users will start with empty state');
    return true;
  } catch (error) {
    console.error('Error checking sample data:', error);
    return false;
  }
};
