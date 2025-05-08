
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { BudgetMessage } from "@/utils/dbtypes";
import { useAuth } from "@/hooks/useAuth";
import { Paperclip, Send, Smile, ThumbsUp, MessageSquare } from "lucide-react";

interface BudgetChatInterfaceProps {
  budgetId: string;
}

const BudgetChatInterface: React.FC<BudgetChatInterfaceProps> = ({ 
  budgetId
}) => {
  const [messages, setMessages] = useState<BudgetMessage[]>([]);
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

  // Fetch messages when component mounts or budget changes
  useEffect(() => {
    if (!budgetId) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('budget_messages')
          .select('*')
          .eq('budget_id', budgetId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error",
            description: "Failed to load budget discussion",
            variant: "destructive",
          });
        } else {
          setMessages(data as BudgetMessage[]);
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
      .channel('public:budget_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budget_messages',
        filter: `budget_id=eq.${budgetId}`
      }, (payload) => {
        console.log('Budget message change received!', payload);
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as BudgetMessage]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as BudgetMessage : msg
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
  }, [budgetId, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    if (!budgetId) {
      toast({
        title: "Error",
        description: "No budget selected",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        sender_id: user.id,
        budget_id: budgetId,
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('budget_messages')
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

  const MessageItem = ({ message }: { message: BudgetMessage }) => {
    const isCurrentUser = user?.id === message.sender_id;
    const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
    
    return (
      <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>
              {message.sender_id ? message.sender_id.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <p>{message.content}</p>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {messageTime}
          </div>
          <div className="flex mt-1 gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
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
            <p className="text-muted-foreground">Loading discussion...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-muted-foreground text-sm">Start the budget discussion!</p>
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
          placeholder="Type a message about this budget..."
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

export default BudgetChatInterface;
