
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image, MoreHorizontal, Heart, Reply, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Sample chat messages for demonstration
const messages = [
  {
    id: 1,
    sender: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    content: "Good morning team! I've just pushed the latest design updates to our shared repository.",
    timestamp: '09:15 AM',
    reactions: [{ emoji: '👍', count: 3 }],
  },
  {
    id: 2,
    sender: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    content: "Thanks Alex! I'll take a look and provide feedback by noon.",
    timestamp: '09:22 AM',
    reactions: [],
  },
  {
    id: 3,
    isSystem: true,
    content: "Jordan Smith joined the channel",
    timestamp: '09:30 AM',
  },
  {
    id: 4,
    sender: { name: 'Jordan Smith', avatar: '/avatar-3.png', initials: 'JS' },
    content: "Morning everyone! Just wanted to share a few notes from yesterday's client meeting.",
    timestamp: '09:35 AM',
    reactions: [],
    attachments: [
      { type: 'file', name: 'Meeting Notes.docx', size: '245 KB' }
    ]
  },
  {
    id: 5,
    sender: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    content: "Here's a preview of the homepage redesign we discussed:",
    timestamp: '10:05 AM',
    reactions: [{ emoji: '❤️', count: 2 }, { emoji: '🔥', count: 1 }],
    attachments: [
      { type: 'image', name: 'Homepage Preview.png', size: '1.2 MB' }
    ]
  },
  {
    id: 6,
    sender: { name: 'Taylor Wong', avatar: '/avatar-4.png', initials: 'TW' },
    content: "I like the direction we're heading with this. One thing to consider - mobile responsiveness for those hero elements might need some tweaking.",
    timestamp: '10:12 AM',
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: 7,
    sender: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    content: "Good point Taylor. I've made a note to address that in our next sprint.",
    timestamp: '10:15 AM',
    reactions: [],
  },
  {
    id: 8,
    isSystem: true,
    content: "Cameron Zhang is now online",
    timestamp: '10:30 AM',
  },
  {
    id: 9,
    sender: { name: 'Cameron Zhang', avatar: '/avatar-5.png', initials: 'CZ' },
    content: "Morning team! Just catching up on the thread. The designs look great Alex!",
    timestamp: '10:32 AM',
    reactions: [{ emoji: '👋', count: 3 }],
  },
];

const ChatInterface = () => {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        <div className="flex justify-center my-4">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            April 11, 2025
          </Badge>
        </div>
        
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.isSystem ? (
              <div className="flex justify-center">
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {message.content} • {message.timestamp}
                </Badge>
              </div>
            ) : (
              <div className="flex">
                <Avatar className="h-8 w-8 mr-3 mt-0.5">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                  <AvatarFallback>{message.sender.initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="font-medium mr-2">{message.sender.name}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-sm">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        {message.attachments.map((attachment, i) => (
                          <Card key={i} className="p-3 mt-2 flex items-center space-x-3 w-fit">
                            {attachment.type === 'file' ? (
                              <FileText className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Image className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex space-x-1 mt-2">
                        {message.reactions.map((reaction, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-0 h-6">
                            <span className="mr-1">{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-1 opacity-0 hover:opacity-100 transition-opacity flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatInterface;
