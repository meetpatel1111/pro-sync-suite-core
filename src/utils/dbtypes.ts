
// This file defines the types for our database tables
// Types for use in application code when working with database records

export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assignee?: string;
  project?: string;
  created_at: string;
  user_id?: string;
}

export interface TimeEntry {
  id: string;
  description: string;
  project: string;
  project_id?: string;
  task_id?: string;
  time_spent: number;
  date: string;
  user_id: string;
  manual?: boolean;
  billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
  notes?: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
}

export interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  time_entry_id: string;
  created_at: string;
}

export interface BillingRate {
  id: string;
  user_id: string;
  project_id?: string;
  client_id?: string;
  rate_amount: number;
  rate_type: string;
  currency: string;
  effective_from: string;
  effective_to?: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductivityMetric {
  id: string;
  user_id: string;
  date: string;
  total_hours: number;
  billable_percentage?: number;
  efficiency_score?: number;
  focus_time_minutes?: number;
  break_time_minutes?: number;
  distractions_count?: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  user_id: string;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  emergency_contact?: boolean;
  notes?: string;
  created_at: string;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface Widget {
  id: string;
  dashboard_id: string;
  title: string;
  widget_type: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  user_id: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  availability: string;
  utilization: number;
  skills: string[];
  schedule?: any[];
  user_id: string;
  created_at: string;
}

export interface ResourceSkill {
  id: string;
  resource_id: string;
  skill: string;
  user_id: string;
  created_at: string;
}

export interface ResourceSchedule {
  id: string;
  resource_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
  user_id: string;
  created_at: string;
}

export interface Risk {
  id: string;
  title: string;
  description?: string;
  severity: string;
  likelihood: string;
  status: string;
  project_id?: string;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id?: string;
  project_id?: string;
  user_id: string;
  status?: string;
  receipt_url?: string;
  currency?: string;
  created_at: string;
}

export interface ExpenseApproval {
  id: string;
  expense_id: string;
  approver_id: string;
  status: string;
  comment?: string;
  approved_at: string;
}

export interface Budget {
  id: string;
  project_id?: string;
  total: number;
  spent: number;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  category: string;
  allocated_amount: number;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  budget_id?: string;
  title: string;
  amount_due: number;
  due_date: string;
  status: string;
  pdf_url?: string;
  created_by: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  unit_cost: number;
  quantity: number;
  tax_percent: number;
  total: number;
}

export interface BudgetMessage {
  id: string;
  budget_id: string;
  sender_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
}

export interface BudgetReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Integration {
  source_app: string;
  target_app: string;
  action_type: string;
  trigger_condition?: string;
  config: any;
  enabled: boolean;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  email_notifications?: Record<string, boolean>;
  app_notifications?: Record<string, boolean>;
  auto_save?: boolean;
  interface_density?: string;
  font_size?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_to?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface File {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  is_public: boolean;
  is_archived: boolean;
  project_id?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

// New types for CollabSpace
export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  about?: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface DirectMessage {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  type: 'text' | 'image' | 'file' | 'system';
  parent_id?: string;
  read_by?: Record<string, any>;
  mentions?: Record<string, any>;
  reactions?: Record<string, any>;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  is_pinned: boolean;
  username?: string;
  name?: string;
  channel_name?: string;
  scheduled_for?: string;
  file_url?: string;
}

export interface Poll {
  id: string;
  message_id: string;
  question: string;
  options: any[];
  created_by: string;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  voted_at: string;
}

// New BudgetChatInterface component for real-time chat on budgets
<lov-write file_path="src/components/BudgetChatInterface.tsx">
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
