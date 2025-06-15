
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, X, MessageSquare } from 'lucide-react';
import { Message } from '@/utils/dbtypes';
import { collabService } from '@/services/collabService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  parentMessage: Message | null;
  onClose: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({ parentMessage, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!parentMessage) return;

    const fetchReplies = async () => {
      setLoading(true);
      try {
        const { data, error } = await collabService.getThreadReplies(parentMessage.id);
        if (error) throw error;
        setReplies(data || []);
      } catch (error) {
        console.error('Error fetching thread replies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load thread replies',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();

    // Subscribe to new replies
    const channel = window.supabase
      ?.channel(`thread_${parentMessage.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `reply_to_id=eq.${parentMessage.id}`
      }, (payload) => {
        setReplies(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      channel?.unsubscribe();
    };
  }, [parentMessage, toast]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user || !parentMessage) return;

    setSending(true);
    try {
      const { data, error } = await collabService.sendMessage({
        content: newReply,
        user_id: user.id,
        channel_id: parentMessage.channel_id,
        direct_message_id: parentMessage.direct_message_id,
        group_message_id: parentMessage.group_message_id,
        reply_to_id: parentMessage.id,
        type: 'text'
      });

      if (error) throw error;
      
      setNewReply('');
      toast({
        title: 'Success',
        description: 'Reply sent',
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (!parentMessage) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Thread
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Parent Message */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {parentMessage.username ? parentMessage.username[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {parentMessage.username || 'User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(parentMessage.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{parentMessage.content}</p>
              {parentMessage.thread_count && parentMessage.thread_count > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {parentMessage.thread_count} {parentMessage.thread_count === 1 ? 'reply' : 'replies'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thread Replies */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No replies yet</p>
              <p className="text-sm">Be the first to reply!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {reply.username ? reply.username[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {reply.username || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Reply Input */}
        <form onSubmit={handleSendReply} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Reply to thread..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newReply.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageThread;
