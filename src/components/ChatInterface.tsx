
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
import { Paperclip, Send, Smile, ThumbsUp, MessageSquare } from "lucide-react";

interface ChatInterfaceProps {
  channelId?: string;
  directMessageId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  channelId, 
  directMessageId 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when component mounts or channel changes
  useEffect(() => {
    if (!channelId && !directMessageId) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        let query;
        
        if (channelId) {
          query = supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true });
        } else if (directMessageId) {
          // Handle DM fetching logic
          // This would require a more complex query joining messages with DMs
        }
        
        if (query) {
          const { data, error } = await query;
          if (error) {
            console.error("Error fetching messages:", error);
            toast({
              title: "Error",
              description: "Failed to load messages",
              variant: "destructive",
            });
          } else {
            setMessages(data as Message[]);
          }
        }
      } catch (error) {
        console.error("Exception fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: channelId ? `channel_id=eq.${channelId}` : undefined
      }, (payload) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as Message]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => 
            prev.filter(msg => msg.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, directMessageId, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    if (!channelId && !directMessageId) {
      toast({
        title: "Error",
        description: "No channel or conversation selected",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        user_id: user.id,
        channel_id: channelId,
        type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_pinned: false,
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
        
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      } else {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Exception sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    if (!user) return;
    
    try {
      // First get the current message to update reactions
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching message reactions:", fetchError);
        return;
      }
      
      // Update the reactions
      const reactions = data?.reactions || {};
      if (reactions[reaction] && reactions[reaction].includes(user.id)) {
        // Remove reaction
        reactions[reaction] = reactions[reaction].filter((id: string) => id !== user.id);
        if (reactions[reaction].length === 0) {
          delete reactions[reaction];
        }
      } else {
        // Add reaction
        if (!reactions[reaction]) {
          reactions[reaction] = [];
        }
        reactions[reaction].push(user.id);
      }
      
      // Update the message
      const { error: updateError } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId);
      
      if (updateError) {
        console.error("Error updating message reactions:", updateError);
      }
    } catch (error) {
      console.error("Exception handling reaction:", error);
    }
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
            <p>{message.content}</p>
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex gap-1 mt-2">
                {Object.entries(message.reactions).map(([reaction, users]) => (
                  <div 
                    key={reaction} 
                    className="bg-background text-foreground rounded-full px-2 py-1 text-xs flex items-center gap-1"
                  >
                    {reaction} <span>{Array.isArray(users) ? users.length : 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {message.username || 'User'} • {messageTime}
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
              onClick={() => {}}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
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
          placeholder="Type a message..."
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
    </div>
  );
};

export default ChatInterface;
