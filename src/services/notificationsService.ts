
import { supabase } from '@/integrations/supabase/client';

// Notifications functions
const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching notifications:', error);
    return { data: null, error };
  }
};

const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while marking notification as read:', error);
    return { data: null, error };
  }
};

// Export all functions
export const notificationsService = {
  getNotifications,
  markNotificationAsRead
};

export default notificationsService;
