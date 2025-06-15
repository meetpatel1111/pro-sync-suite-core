
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/utils/dbtypes";
import { useAuth } from "@/hooks/useAuth";
import { 
  Paperclip, 
  Send, 
  Smile, 
  ThumbsUp, 
  MessageSquare, 
  Pin, 
  MoreVertical,
  Hash
} from "lucide-react";
import { collabService } from '@/services/collabService';
import TaskMentionCard from './TaskMentionCard';
import MessageThread from './MessageThread';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedChatInterfaceProps {
  conversationId?: string;
  conversationType: 'channel' | 'dm' | 'group';
  onOpenThread?: (message: Message) => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  conversationId, 
  conversationType,
  onOpenThread
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Message | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        let result;
        
        switch (conversationType) {
          case 'channel':
            result = await collabService.getChannelMessages(conversationId);
            break;
          case 'dm':
            result = await collabService.getDirectMessageMessages(conversationId);
            break;
          case 'group':
            result = await collabService.getGroupMessageMessages(conversationId);
            break;
          default:
            throw new Error('Invalid conversation type');
        }
        
        if (result.error) throw result.error;
        setMessages(result.data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: conversationType === 'channel' 
          ? `channel_id=eq.${conversationId}`
          : conversationType === 'dm'
          ? `direct_message_id=eq.${conversationId}`
          : `group_message_id=eq.${conversationId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as Message]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, conversationType, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;
    
    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        user_id: user.id,
        type: 'text' as const,
        ...(conversationType === 'channel' && { channel_id: conversationId }),
        ...(conversationType === 'dm' && { direct_message_id: conversationId }),
        ...(conversationType === 'group' && { group_message_id: conversationId }),
      };
      
      const { data, error } = await collabService.sendMessage(messageData);
      
      if (error) throw error;
      
      // Check for task mentions in the message
      const taskMentions = newMessage.match(/#TASK-(\d+)/g);
      if (taskMentions && data) {
        for (const mention of taskMentions) {
          const taskId = mention.replace('#TASK-', '');
          await collabService.addTaskMention(data.id, taskId);
        }
      }
      
      // Index message for search
      await collabService.indexMessageForSearch(data?.id || '', newMessage);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await collabService.addReaction(messageId, user.id, emoji);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    if (!user || conversationType !== 'channel') return;
    
    try {
      await collabService.pinMessage(messageId, conversationId!, user.id);
      toast({
        title: "Success",
        description: "Message pinned",
      });
    } catch (error) {
      console.error("Error pinning message:", error);
      toast({
        title: "Error",
        description: "Failed to pin message",
        variant: "destructive",
      });
    }
  };

  const handleOpenThread = (message: Message) => {
    setSelectedThread(message);
    onOpenThread?.(message);
  };

  const renderTaskMentions = (content: string) => {
    const parts = content.split(/(#TASK-\d+)/g);
    return parts.map((part, index) => {
      if (part.match(/#TASK-\d+/)) {
        const taskId = part.replace('#TASK-', '');
        return (
          <TaskMentionCard 
            key={index} 
            taskId={taskId} 
            onViewTask={(id) => console.log('Open task:', id)}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const MessageItem = ({ message }: { message: Message }) => {
    const isCurrentUser = user?.id === message.user_id;
    const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
    
    return (
      <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>
              {message.username ? message.username[0].toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <div className="message-content">
              {renderTaskMentions(message.content || '')}
            </div>
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex gap-1 mt-2">
                {Object.entries(message.reactions).map(([reaction, users]) => (
                  <div 
                    key={reaction} 
                    className="bg-background text-foreground rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer"
                    onClick={() => handleReaction(message.id, reaction)}
                  >
                    {reaction} <span>{Array.isArray(users) ? users.length : 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {message.username || 'User'} • {messageTime}
            </span>
            {message.thread_count && message.thread_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => handleOpenThread(message)}
              >
                {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
          <div className="flex mt-1 gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => handleReaction(message.id, '👍')}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => handleOpenThread(message)}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
            {conversationType === 'channel' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handlePinMessage(message.id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {isCurrentUser && (
          <Avatar className="h-8 w-8 ml-2">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-muted-foreground text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message... (Use #TASK-123 to mention tasks)"
          className="flex-1"
          disabled={sending || !user}
        />
        <Button variant="ghost" size="icon" type="button">
          <Smile className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={sending || !newMessage.trim() || !user}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {selectedThread && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50">
          <MessageThread 
            parentMessage={selectedThread} 
            onClose={() => setSelectedThread(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedChatInterface;
