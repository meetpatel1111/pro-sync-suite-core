
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Filter, 
  Search,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'task' | 'message' | 'system' | 'reminder' | 'mention';
  read: boolean;
  timestamp: string;
  actionRequired: boolean;
  relatedTo?: string;
  priority: 'low' | 'medium' | 'high';
  sender?: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Task Assignment',
      message: 'You have been assigned to "Update API Documentation" by Sarah Johnson',
      type: 'info',
      category: 'task',
      read: false,
      timestamp: '2024-01-15T10:30:00Z',
      actionRequired: true,
      relatedTo: 'task-123',
      priority: 'high',
      sender: 'Sarah Johnson'
    },
    {
      id: '2',
      title: 'Meeting Reminder',
      message: 'Daily standup meeting starting in 15 minutes',
      type: 'warning',
      category: 'reminder',
      read: false,
      timestamp: '2024-01-15T09:45:00Z',
      actionRequired: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'New Message',
      message: 'Michael Chen mentioned you in #general channel',
      type: 'info',
      category: 'mention',
      read: true,
      timestamp: '2024-01-15T09:15:00Z',
      actionRequired: false,
      priority: 'medium',
      sender: 'Michael Chen'
    },
    {
      id: '4',
      title: 'System Update',
      message: 'ProSync Suite will be updated tonight at 11 PM EST',
      type: 'info',
      category: 'system',
      read: true,
      timestamp: '2024-01-15T08:00:00Z',
      actionRequired: false,
      priority: 'low'
    },
    {
      id: '5',
      title: 'File Shared',
      message: 'Emily Rodriguez shared "Design System v2.0" with you',
      type: 'success',
      category: 'task',
      read: false,
      timestamp: '2024-01-15T07:30:00Z',
      actionRequired: false,
      priority: 'medium',
      sender: 'Emily Rodriguez'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const categories = ['all', 'task', 'message', 'system', 'reminder', 'mention'];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory;
    const matchesReadStatus = !showUnreadOnly || !notification.read;
    return matchesCategory && matchesReadStatus;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return <FileText className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'mention': return <Users className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
                <Filter className="h-4 w-4 mr-2" />
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <Bell className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{highPriorityCount}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.actionRequired && !n.read).length}
                </div>
                <div className="text-sm text-gray-600">Action Required</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} onClick={() => setSelectedCategory(category)}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory}>
              <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all hover:shadow-md ${
                        !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            {getCategoryIcon(notification.category)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Badge className={getPriorityColor(notification.priority)} size="sm">
                                  {notification.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                {notification.sender && (
                                  <span>from {notification.sender}</span>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
