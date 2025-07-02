
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Send,
  Users,
  Hash,
  Bell,
  Settings,
  Phone,
  Video,
  Paperclip,
  Smile,
  Star,
  Clock
} from 'lucide-react';

const CollabSpaceEnhanced = () => {
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');

  const channels = [
    { id: 'general', name: 'General', unread: 3, type: 'public' },
    { id: 'development', name: 'Development', unread: 7, type: 'public' },
    { id: 'design', name: 'Design', unread: 0, type: 'public' },
    { id: 'marketing', name: 'Marketing', unread: 2, type: 'private' }
  ];

  const messages = [
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      message: 'Hey everyone! Just finished the new dashboard design. What do you think?',
      time: '10:30 AM',
      reactions: [{ emoji: '👍', count: 5 }, { emoji: '🎨', count: 2 }]
    },
    {
      id: 2,
      author: 'Mike Davis',
      avatar: '/placeholder.svg',
      message: 'Looks amazing! The color scheme really makes it pop. Can we get this deployed to staging?',
      time: '10:32 AM',
      reactions: [{ emoji: '🚀', count: 3 }]
    },
    {
      id: 3,
      author: 'Lisa Chen',
      avatar: '/placeholder.svg',
      message: 'I love the new gradient buttons! They fit perfectly with our brand guidelines.',
      time: '10:35 AM',
      reactions: [{ emoji: '💯', count: 4 }]
    }
  ];

  const onlineUsers = [
    { name: 'Sarah Johnson', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Mike Davis', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Lisa Chen', status: 'away', avatar: '/placeholder.svg' },
    { name: 'John Smith', status: 'busy', avatar: '/placeholder.svg' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Channels */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-100/80 to-green-100/80 rounded-t-2xl">
            <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
              <Hash className="h-5 w-5 text-emerald-600" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChannel === channel.id 
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300' 
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {channel.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ColorfulButton variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </ColorfulButton>
            </div>
          </CardContent>
        </Card>

        {/* Online Users */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-100/80 to-green-100/80 rounded-t-2xl">
            <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Online ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 cursor-pointer">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm h-full flex flex-col">
          {/* Chat Header */}
          <CardHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-100/80 to-green-100/80 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                <Hash className="h-5 w-5 text-emerald-600" />
                {channels.find(c => c.id === activeChannel)?.name || 'General'}
                <Badge className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  {onlineUsers.length} online
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <ColorfulButton variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </ColorfulButton>
                <ColorfulButton variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </ColorfulButton>
                <ColorfulButton variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </ColorfulButton>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4 group hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-slate-50/50 p-3 rounded-xl transition-all duration-200">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      {message.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{message.author}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {message.time}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{message.message}</p>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.reactions.map((reaction, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-gradient-to-r from-gray-50 to-slate-50 hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-200"
                          >
                            {reaction.emoji} {reaction.count}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name || 'general'}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="border-2 border-emerald-200 focus:border-emerald-400 rounded-xl pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <ColorfulButton variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </ColorfulButton>
                  <ColorfulButton variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </ColorfulButton>
                </div>
              </div>
              <ColorfulButton 
                variant="secondary" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </ColorfulButton>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CollabSpaceEnhanced;
