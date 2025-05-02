import React, { useRef, useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Message } from '@/utils/dbtypes'; // Correct import from dbtypes
import collabService from '../services/collabService';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, Send, Paperclip, Clock, MoreVertical, 
  Pin, Trash, Edit, Reply, Smile, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, file: File | null, scheduledFor: Date | null, parentId: string | null) => Promise<void>;
  channelMembers: any[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  currentUserId, 
  onSendMessage,
  channelMembers
}) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await collabService.addReaction(messageId, currentUserId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error adding reaction',
        description: 'Could not add reaction. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveReaction = async (messageId: string) => { // Fix: Remove emoji parameter - not used in implementation
    try {
      await collabService.removeReaction(messageId, currentUserId);
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: 'Error removing reaction',
        description: 'Could not remove reaction. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await collabService.pinMessage(messageId);
    } catch (error) {
      console.error('Error pinning message:', error);
      toast({
        title: 'Error pinning message',
        description: 'Could not pin message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    try {
      await collabService.unpinMessage(messageId);
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast({
        title: 'Error unpinning message',
        description: 'Could not unpin message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await collabService.markAsRead(messageId, currentUserId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await collabService.deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error deleting message',
        description: 'Could not delete message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await collabService.editMessage(messageId, content);
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error editing message',
        description: 'Could not edit message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleMenu = (messageId: string) => {
    setSelectedMessage(messageId);
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await onSendMessage(newMessage, null, null, replyingTo ? replyingTo.id : null);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            {replyingTo && replyingTo.id === message.id && (
              <div className="p-2 mb-2 bg-gray-100 rounded-md">
                Replying to: {replyingTo.content}
                <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {/* Placeholder for user avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <strong className="text-sm">{message.username || 'User'}</strong>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                  {message.edited_at && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleAddReaction(message.id, '👍')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                  {currentUserId === message.user_id && (
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleMenu(message.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {isMenuOpen && selectedMessage === message.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                              role="menuitem"
                              onClick={() => {
                                handleEditMessage(message.id, 'New content'); // Replace 'New content' with actual edit functionality
                                closeMenu();
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2 inline-block" />
                              Edit
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                              role="menuitem"
                              onClick={() => {
                                handleDeleteMessage(message.id);
                                closeMenu();
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2 inline-block" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Textarea
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
