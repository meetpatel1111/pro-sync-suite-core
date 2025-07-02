
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Hash, 
  Phone, 
  Video,
  Settings,
  Search,
  Plus,
  Bell,
  Smile,
  Paperclip,
  Heart,
  Zap
} from 'lucide-react';

const CollabSpace = () => {
  const channels = [
    { name: 'general', members: 12, unread: 0 },
    { name: 'development', members: 8, unread: 3 },
    { name: 'design', members: 6, unread: 1 },
    { name: 'marketing', members: 5, unread: 0 }
  ];

  const messages = [
    {
      id: 1,
      user: 'Alice Johnson',
      avatar: '/avatars/alice.jpg',
      message: 'Great work on the new feature! The user feedback has been overwhelmingly positive.',
      timestamp: '10:30 AM',
      reactions: ['👍', '🎉']
    },
    {
      id: 2,
      user: 'Bob Smith',
      avatar: '/avatars/bob.jpg',
      message: 'Just pushed the latest changes to the dev branch. Ready for review!',
      timestamp: '10:25 AM',
      reactions: ['✅']
    },
    {
      id: 3,
      user: 'Carol Davis',
      avatar: '/avatars/carol.jpg',
      message: 'The new design mockups are ready. Let me know what you think!',
      timestamp: '10:20 AM',
      reactions: ['🎨', '💯']
    }
  ];

  const onlineUsers = [
    { name: 'Alice Johnson', status: 'online', avatar: 'AJ' },
    { name: 'Bob Smith', status: 'away', avatar: 'BS' },
    { name: 'Carol Davis', status: 'online', avatar: 'CD' },
    { name: 'Dave Wilson', status: 'busy', avatar: 'DW' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-gradient-to-b from-emerald-100/80 via-teal-100/80 to-cyan-100/80 backdrop-blur-sm border-r border-emerald-200/50 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  CollabSpace
                </h1>
                <ColorfulButton variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </ColorfulButton>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search messages..." className="pl-10 bg-white/80 border-emerald-200" />
              </div>

              {/* Channels */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Channels</h3>
                  <ColorfulButton variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </ColorfulButton>
                </div>
                <div className="space-y-2">
                  {channels.map((channel, index) => (
                    <div key={channel.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{channel.members}</span>
                        {channel.unread > 0 && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {channel.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online Users */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Online ({onlineUsers.filter(u => u.status === 'online').length})
                </h3>
                <div className="space-y-3">
                  {onlineUsers.map((user, index) => (
                    <div key={user.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-100/80 via-teal-100/80 to-cyan-100/80 backdrop-blur-sm border-b border-emerald-200/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">general</h2>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    12 members
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <ColorfulButton variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </ColorfulButton>
                  <ColorfulButton variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </ColorfulButton>
                  <ColorfulButton variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </ColorfulButton>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <div key={message.id} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Avatar className="h-10 w-10 ring-2 ring-emerald-200">
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      {message.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{message.user}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-emerald-100">
                      <p className="text-gray-700">{message.message}</p>
                      {message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-3">
                          {message.reactions.map((reaction, i) => (
                            <span key={i} className="text-sm bg-emerald-50 rounded-full px-2 py-1 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors">
                              {reaction}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-gradient-to-r from-emerald-100/80 via-teal-100/80 to-cyan-100/80 backdrop-blur-sm border-t border-emerald-200/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Type a message..." 
                    className="pr-20 bg-white/80 border-emerald-200 focus:border-emerald-400 rounded-xl h-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <ColorfulButton variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </ColorfulButton>
                    <ColorfulButton variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </ColorfulButton>
                  </div>
                </div>
                <ColorfulButton variant="primary">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </ColorfulButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
