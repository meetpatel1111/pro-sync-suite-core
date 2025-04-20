// demoNotify.ts
// Run this script to send a demo notification to the currently logged-in user
import { notifyUser } from '../services/notificationService';
import { supabase } from '../integrations/supabase/client';

export async function demoNotify() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    console.log('Not logged in!');
    return;
  }
  const userId = userData.user.id;
  const result = await notifyUser({
    userId,
    subject: 'Demo Notification',
    message: 'This is a test notification from ProSync Suite!',
    type: 'generic',
  });
  console.log('Demo notification result:', result);
}

// If running directly
if (require.main === module) {
  demoNotify();
}
