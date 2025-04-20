// notificationService.ts
// Utility to send email and push notifications, respecting user settings
// Uses Nodemailer for email and (simulated) push notification for demo

// @ts-ignore
let nodemailer: any = null;
try { nodemailer = require('nodemailer'); } catch (e) { /* dev fallback */ }
import { dbService } from './dbService';

export type NotificationType = 'task_assigned' | 'generic';

export interface NotificationPayload {
  userId: string;
  subject: string;
  message: string;
  type?: NotificationType;
}

// --- Email Notification ---
export async function sendEmailNotification({ userId, subject, message }: NotificationPayload) {
  // 1. Fetch user settings
  const settingsResp = await dbService.getUserSettings(userId);
  const settings = settingsResp?.data || settingsResp;
  if (!settings?.notificationEmail) return { sent: false, reason: 'Email notifications disabled' };

  // 2. Fetch user email
  const userResp = await (dbService as any).getUserById(userId);
  const user = userResp?.data || userResp;
  if (!user?.email) return { sent: false, reason: 'No email found' };

  // 3. Configure nodemailer (demo: use ethereal email for dev)
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'your_ethereal_user', // Replace with your Ethereal credentials
      pass: 'your_ethereal_pass',
    },
  });

  const mailOptions = {
    from: 'no-reply@prosyncsuite.com',
    to: user.email,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: (err as Error).message };
  }
}

// --- Push Notification (Simulated) ---
export async function sendPushNotification({ userId, subject, message }: NotificationPayload) {
  // 1. Fetch user settings
  const settingsResp = await dbService.getUserSettings(userId);
  const settings = settingsResp?.data || settingsResp;
  if (!settings?.notificationPush) return { sent: false, reason: 'Push notifications disabled' };

  // 2. In real app: send via FCM or browser push
  // Here: just log to console for demo
  console.log(`[PUSH] To user ${userId}: ${subject} - ${message}`);
  return { sent: true };
}

// --- Send both, respecting preferences ---
export async function notifyUser(payload: NotificationPayload) {
  const emailResult = await sendEmailNotification(payload);
  const pushResult = await sendPushNotification(payload);
  return { emailResult, pushResult };
}
