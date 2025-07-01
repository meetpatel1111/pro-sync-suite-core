
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare,
  X,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'status_change' | 'escalation' | 'comment' | 'sla_breach';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const RealTimeNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('service-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          if (soundEnabled) {
            playNotificationSound(newNotification.priority);
          }

          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.priority === 'critical' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    // Load existing notifications
    loadNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const loadNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'ticket_assigned',
          title: 'New Ticket Assigned',
          message: 'High priority incident #12345 has been assigned to you',
          priority: 'high',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/servicecore/tickets/12345'
        },
        {
          id: '2',
          type: 'sla_breach',
          title: 'SLA Breach Warning',
          message: 'Ticket #12344 will breach SLA in 15 minutes',
          priority: 'critical',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/servicecore/tickets/12344'
        },
        {
          id: '3',
          type: 'status_change',
          title: 'Ticket Status Updated',
          message: 'Ticket #12343 has been resolved',
          priority: 'medium',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/servicecore/tickets/12343'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const playNotificationSound = (priority: string) => {
    const audio = new Audio();
    audio.volume = 0.3;
    
    switch (priority) {
      case 'critical':
        audio.src = '/sounds/critical-alert.mp3';
        break;
      case 'high':
        audio.src = '/sounds/high-alert.mp3';
        break;
      default:
        audio.src = '/sounds/notification.mp3';
    }
    
    audio.play().catch(() => {
      // Ignore audio play errors
    });
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-4 w-4 ${
      priority === 'critical' ? 'text-red-500 animate-pulse' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-yellow-500' :
      'text-blue-500'
    }`;

    switch (type) {
      case 'ticket_assigned': return <Users className={iconClass} />;
      case 'sla_breach': return <AlertTriangle className={iconClass} />;
      case 'status_change': return <CheckCircle className={iconClass} />;
      case 'comment': return <MessageSquare className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread': return !n.read;
      case 'high': return ['high', 'critical'].includes(n.priority);
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative hover-scale ${unreadCount > 0 ? 'animate-pulse' : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-2xl animate-scale-in border-2">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="hover-scale"
                >
                  {soundEnabled ? 
                    <Volume2 className="h-4 w-4" /> : 
                    <VolumeX className="h-4 w-4" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="hover-scale"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setFilter('all')}
                className="hover-scale"
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setFilter('unread')}
                className="hover-scale"
              >
                Unread
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setFilter('high')}
                className="hover-scale"
              >
                High Priority
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground animate-fade-in">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer animate-fade-in ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-semibold ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <Badge 
                                className={`text-xs ${getPriorityColor(notification.priority)} border`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </span>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="hover-scale"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="hover-scale text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="hover-scale"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="hover-scale text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeNotifications;
