
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  related_to?: string;
  related_id?: string;
}

export const notificationService = {
  // Create a new notification
  async createNotification(data: CreateNotificationData) {
    const { error } = await supabase
      .from('notifications')
      .insert([data]);
    
    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }
    return true;
  },

  // TaskMaster notifications
  async createTaskNotification(userId: string, taskTitle: string, taskId: string, type: 'assigned' | 'updated' | 'completed' | 'due_soon') {
    const notifications = {
      assigned: {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${taskTitle}"`,
        type: 'info' as const
      },
      updated: {
        title: 'Task Updated',
        message: `Task "${taskTitle}" has been updated`,
        type: 'info' as const
      },
      completed: {
        title: 'Task Completed',
        message: `Task "${taskTitle}" has been completed`,
        type: 'success' as const
      },
      due_soon: {
        title: 'Task Due Soon',
        message: `Task "${taskTitle}" is due soon`,
        type: 'warning' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'task',
      related_id: taskId
    });
  },

  // TimeTrackPro notifications
  async createTimeTrackingNotification(userId: string, message: string, type: 'reminder' | 'timesheet_due' | 'session_long') {
    const titles = {
      reminder: 'Time Tracking Reminder',
      timesheet_due: 'Timesheet Due',
      session_long: 'Long Work Session'
    };

    return this.createNotification({
      user_id: userId,
      title: titles[type],
      message,
      type: type === 'session_long' ? 'warning' : 'info',
      related_to: 'timetrack'
    });
  },

  // CollabSpace notifications
  async createChatNotification(userId: string, type: 'mention' | 'new_message' | 'file_shared', details: { channel?: string; sender?: string; fileName?: string }) {
    const notifications = {
      mention: {
        title: 'You were mentioned',
        message: `${details.sender} mentioned you in ${details.channel}`,
        type: 'info' as const
      },
      new_message: {
        title: 'New Message',
        message: `New message from ${details.sender} in ${details.channel}`,
        type: 'info' as const
      },
      file_shared: {
        title: 'File Shared',
        message: `${details.sender} shared "${details.fileName}" in ${details.channel}`,
        type: 'info' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'message'
    });
  },

  // BudgetBuddy notifications
  async createBudgetNotification(userId: string, projectName: string, type: 'overspent' | 'threshold' | 'approved', percentage?: number) {
    const notifications = {
      overspent: {
        title: 'Budget Exceeded',
        message: `Project "${projectName}" has exceeded its budget${percentage ? ` by ${percentage}%` : ''}`,
        type: 'error' as const
      },
      threshold: {
        title: 'Budget Alert',
        message: `Project "${projectName}" has reached ${percentage}% of its budget`,
        type: 'warning' as const
      },
      approved: {
        title: 'Expense Approved',
        message: `Your expense for project "${projectName}" has been approved`,
        type: 'success' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'budget'
    });
  },

  // FileVault notifications
  async createFileNotification(userId: string, fileName: string, type: 'shared' | 'uploaded' | 'expired') {
    const notifications = {
      shared: {
        title: 'File Shared',
        message: `"${fileName}" has been shared with you`,
        type: 'info' as const
      },
      uploaded: {
        title: 'File Uploaded',
        message: `"${fileName}" has been uploaded successfully`,
        type: 'success' as const
      },
      expired: {
        title: 'File Access Expired',
        message: `Your access to "${fileName}" has expired`,
        type: 'warning' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'file'
    });
  },

  // ClientConnect notifications
  async createClientNotification(userId: string, clientName: string, type: 'new_client' | 'meeting_scheduled' | 'follow_up') {
    const notifications = {
      new_client: {
        title: 'New Client Added',
        message: `New client "${clientName}" has been added`,
        type: 'info' as const
      },
      meeting_scheduled: {
        title: 'Meeting Scheduled',
        message: `Meeting scheduled with ${clientName}`,
        type: 'info' as const
      },
      follow_up: {
        title: 'Follow-up Reminder',
        message: `Follow-up reminder for client ${clientName}`,
        type: 'warning' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'client'
    });
  },

  // RiskRadar notifications
  async createRiskNotification(userId: string, riskTitle: string, type: 'high_risk' | 'risk_mitigated' | 'new_risk') {
    const notifications = {
      high_risk: {
        title: 'High Risk Alert',
        message: `High risk identified: "${riskTitle}"`,
        type: 'error' as const
      },
      risk_mitigated: {
        title: 'Risk Mitigated',
        message: `Risk "${riskTitle}" has been successfully mitigated`,
        type: 'success' as const
      },
      new_risk: {
        title: 'New Risk Identified',
        message: `New risk identified: "${riskTitle}"`,
        type: 'warning' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'risk'
    });
  },

  // PlanBoard notifications
  async createPlanBoardNotification(userId: string, projectName: string, type: 'milestone_reached' | 'deadline_approaching' | 'project_updated') {
    const notifications = {
      milestone_reached: {
        title: 'Milestone Reached',
        message: `Milestone reached in project "${projectName}"`,
        type: 'success' as const
      },
      deadline_approaching: {
        title: 'Deadline Approaching',
        message: `Deadline approaching for project "${projectName}"`,
        type: 'warning' as const
      },
      project_updated: {
        title: 'Project Updated',
        message: `Project "${projectName}" has been updated`,
        type: 'info' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'project'
    });
  },

  // ResourceHub notifications
  async createResourceNotification(userId: string, resourceName: string, type: 'overallocated' | 'available' | 'skill_updated') {
    const notifications = {
      overallocated: {
        title: 'Resource Overallocated',
        message: `Resource "${resourceName}" is overallocated`,
        type: 'warning' as const
      },
      available: {
        title: 'Resource Available',
        message: `Resource "${resourceName}" is now available`,
        type: 'info' as const
      },
      skill_updated: {
        title: 'Skills Updated',
        message: `Skills for "${resourceName}" have been updated`,
        type: 'info' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'resource'
    });
  },

  // InsightIQ notifications
  async createInsightNotification(userId: string, type: 'report_ready' | 'anomaly_detected' | 'trend_alert', details: string) {
    const notifications = {
      report_ready: {
        title: 'Report Ready',
        message: `Your analytics report is ready: ${details}`,
        type: 'success' as const
      },
      anomaly_detected: {
        title: 'Anomaly Detected',
        message: `Anomaly detected in your data: ${details}`,
        type: 'warning' as const
      },
      trend_alert: {
        title: 'Trend Alert',
        message: `Important trend identified: ${details}`,
        type: 'info' as const
      }
    };

    const notification = notifications[type];
    return this.createNotification({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_to: 'insight'
    });
  }
};
