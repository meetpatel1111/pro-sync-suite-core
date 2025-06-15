import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { collabService } from '@/services/collabService';
import { DirectMessage, GroupMessage } from '@/utils/dbtypes';
import { useToast } from '@/hooks/use-toast';

interface DirectMessagesProps {
  onSelectConversation: (dmId: string, type: 'dm' | 'group') => void;
  selectedConversationId?: string;
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ 
  onSelectConversation, 
  selectedConversationId 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const [dmResult, groupResult] = await Promise.all([
          collabService.getDirectMessages(user.id),
          collabService.getGroupMessages(user.id)
        ]);

        if (dmResult.data && Array.isArray(dmResult.data)) {
          setDirectMessages(dmResult.data as DirectMessage[]);
        }
        if (groupResult.data && Array.isArray(groupResult.data)) {
          setGroupMessages(groupResult.data as GroupMessage[]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  const handleCreateDirectMessage = async () => {
    if (!user) return;
    
    const otherUserId = prompt('Enter user ID for direct message:');
    if (!otherUserId) return;

    try {
      const { data, error } = await collabService.createDirectMessage(user.id, otherUserId);
      if (error) throw error;
      
      if (data) {
        setDirectMessages(prev => [data as DirectMessage, ...prev]);
        onSelectConversation((data as DirectMessage).id, 'dm');
        toast({
          title: 'Success',
          description: 'Direct message created',
        });
      }
    } catch (error) {
      console.error('Error creating direct message:', error);
      toast({
        title: 'Error',
        description: 'Failed to create direct message',
        variant: 'destructive',
      });
    }
  };

  const getOtherUserId = (dm: DirectMessage) => {
    return dm.user1_id === user?.id ? dm.user2_id : dm.user1_id;
  };

  const filteredDMs = directMessages.filter(dm => 
    dm.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groupMessages.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateDirectMessage} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {/* Direct Messages */}
          {filteredDMs.map((dm) => (
            <div
              key={dm.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedConversationId === dm.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-secondary/50'
              }`}
              onClick={() => onSelectConversation(dm.id, 'dm')}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getOtherUserId(dm).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  User {getOtherUserId(dm).substring(0, 8)}...
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {dm.last_message || 'No messages yet'}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(dm.last_message_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Group Messages */}
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedConversationId === group.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-secondary/50'
              }`}
              onClick={() => onSelectConversation(group.id, 'group')}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {group.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{group.name}</div>
                <div className="text-sm text-muted-foreground">
                  Group conversation
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(group.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {filteredDMs.length === 0 && filteredGroups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No conversations found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleCreateDirectMessage}
              >
                Start a conversation
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DirectMessages;
