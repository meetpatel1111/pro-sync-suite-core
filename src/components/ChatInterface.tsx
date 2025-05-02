import React from 'react';
import collabService from "../services/collabService";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Paperclip, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image, MoreHorizontal, Heart, Reply, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

// Sample chat messages for demonstration
interface ChatInterfaceProps {
  messages: any[];
  currentUserId?: string;
  onSendMessage?: (content: string, file?: File | null, scheduledFor?: Date | null, parentId?: string) => Promise<void>;
  channelMembers?: any[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages: initialMessages, currentUserId, onSendMessage, channelMembers }) => {

  const [messages, setMessages] = useState(initialMessages);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [pinning, setPinning] = useState<string | null>(null);
  const [reacting, setReacting] = useState<string | null>(null);
  const [showThreadFor, setShowThreadFor] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [composerContent, setComposerContent] = useState('');

  // Handle add/remove reaction
  const handleReaction = async (msg: any, emoji: string) => {
    if (!currentUserId) return;
    setReacting(msg.id);
    const userHasReacted = msg.reactions?.[emoji]?.includes(currentUserId);
    try {
      if (userHasReacted) {
        await collabService.removeReaction(msg.id, currentUserId, emoji);
        const updated = { ...msg, reactions: { ...msg.reactions, [emoji]: msg.reactions[emoji].filter((id: string) => id !== currentUserId) } };
        if (updated.reactions[emoji].length === 0) delete updated.reactions[emoji];
        setMessages(messages.map((m: any) => m.id === msg.id ? updated : m));
      } else {
        await collabService.addReaction(msg.id, currentUserId, emoji);
        const updated = { ...msg, reactions: { ...msg.reactions, [emoji]: [...(msg.reactions[emoji] || []), currentUserId] } };
        setMessages(messages.map((m: any) => m.id === msg.id ? updated : m));
      }
    } finally {
      setReacting(null);
    }
  };

  // Pin/unpin message
  const handlePin = async (msg: any, pin: boolean) => {
    setPinning(msg.id);
    try {
      if (pin) {
        await collabService.pinMessage(msg.id);
        setMessages(messages.map((m: any) => m.id === msg.id ? { ...m, is_pinned: true } : m));
      } else {
        await collabService.unpinMessage(msg.id);
        setMessages(messages.map((m: any) => m.id === msg.id ? { ...m, is_pinned: false } : m));
      }
    } finally {
      setPinning(null);
    }
  };

  // Mark as read (optional, for unread highlight)
  const markAsRead = async (msg: any) => {
    if (!currentUserId || msg.read_by?.includes(currentUserId)) return;
    await collabService.markAsRead(msg.id, currentUserId);
    setMessages(messages.map((m: any) => m.id === msg.id ? { ...m, read_by: [...(msg.read_by || []), currentUserId] } : m));
  };

  // Threaded replies
  const openThread = (msg: any) => {
    setShowThreadFor(msg.id);
    setReplyContent('');
    setReplyFile(null);
    setScheduledFor(null);
    setThreadMessages(messages.filter((m: any) => m.parent_id === msg.id));
  };
  const closeThread = () => {
    setShowThreadFor(null);
    setThreadMessages([]);
  };

  const handleReplySend = async () => {
    if (!replyContent.trim() || !onSendMessage || !showThreadFor) return;
    await onSendMessage(replyContent, replyFile, scheduledFor, showThreadFor);
    setReplyContent('');
    setReplyFile(null);
    setScheduledFor(null);
    // Optionally update threadMessages here after send
  };

  // Mentions highlighting
  function highlightMentions(text: string) {
    if (!text) return null;
    const parts = text.split(/([@#][\w-]+)/g);
    return parts.map((part, i) => {
      if (/^@[\w-]+$/.test(part)) {
        return <span key={i} className="text-blue-600 font-medium">{part}</span>;
      }
      if (/^#[\w-]+$/.test(part)) {
        return <span key={i} className="text-purple-600 font-medium">{part}</span>;
      }
      return part;
    });
  }

  const onEditMessage = (msg: any) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };
  const onDeleteMessage = async (msg: any) => {
    if (window.confirm('Delete this message?')) {
      try {
        await collabService.deleteMessage(msg.id);
        setMessages(messages.filter((m: any) => m.id !== msg.id));
        toast({ title: 'Deleted', description: 'Message deleted', variant: 'default' });
      } catch (err) {
        toast({ title: 'Error', description: err.message || 'Failed to delete message', variant: 'destructive' });
      }
    }
  };
  const onSaveEdit = async (msg: any) => {
    try {
      await collabService.editMessage(msg.id, editContent);
      setMessages(messages.map((m: any) => m.id === msg.id ? { ...m, content: editContent } : m));
      setEditingMessageId(null);
      toast({ title: 'Success', description: 'Message updated!', variant: 'default' });
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to update message', variant: 'destructive' });
    }
  };
  const onCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  return (
    <>
      {/* Thread view modal */}
      {showThreadFor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-xl" onClick={closeThread}>×</button>
            <h2 className="text-lg font-semibold mb-2">Thread</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {messages.filter((m: any) => m.id === showThreadFor).map((msg) => (
                <div key={msg.id} className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                  <div className="font-medium">{msg.name || msg.username || msg.user_id}</div>
                  <div className="text-sm">{highlightMentions(msg.content)}</div>
                </div>
              ))}
              {threadMessages.map((msg) => (
                <div key={msg.id} className="p-2 border rounded">
                  <div className="font-medium">{msg.name || msg.username || msg.user_id}</div>
                  <div className="text-sm">{highlightMentions(msg.content)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Reply..."
                className="flex-1"
              />
              <input type="file" onChange={e => setReplyFile(e.target.files?.[0] || null)} />
              <DatePicker
                selected={scheduledFor}
                onChange={(date: Date | null) => setScheduledFor(date)}
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Schedule"
                customInput={<Button variant="ghost" size="icon"><CalendarIcon className="h-4 w-4" /></Button>}
              />
              <Button onClick={handleReplySend} size="sm">Send</Button>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          <div className="flex justify-center my-4">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Badge>
          </div>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${currentUserId && message.read_by && !message.read_by.includes(currentUserId) ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
              onMouseEnter={() => markAsRead(message)}
            >
              <div className="flex">
                <Avatar className="h-8 w-8 mr-3">
                  {message.sender && message.sender.avatar ? (
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name || 'User'} />
                  ) : null}
                  <AvatarFallback>
                    {message.sender && message.sender.initials
                      ? message.sender.initials
                      : ((message.name || message.username || message.user_id || 'U')
                          .split(' ')
                          .map((part: string) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase())}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="font-medium text-xs mr-2">
                      {message.sender && message.sender.name
                        ? message.sender.name
                        : message.name || message.username || (message.user_id ? message.user_id.slice(0, 6) : 'User')}
                    </span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <div className="mt-1">
                    {editingMessageId === message.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                        />
                        <Button size="sm" onClick={() => onSaveEdit(message)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm">{highlightMentions(message.content)}</p>
                    )}
                    {/* Show file attachment if present */}
                    {message.file_url && (
                      <div className="mt-2">
                        <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {message.file_url.split('/').pop() || 'File'}
                        </a>
                      </div>
                    )}
                    {/* Emoji reactions (show all used emojis, clickable for add/remove) */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex space-x-1 mt-2">
                        {Object.entries(message.reactions).map(([emoji, userIds]: [string, string[]]) => (
                          <Badge
                            key={emoji}
                            variant={userIds.includes(currentUserId) ? 'default' : 'outline'}
                            className={`text-xs py-0 h-6 cursor-pointer ${reacting === message.id ? 'opacity-50' : ''}`}
                            onClick={() => handleReaction(message, emoji)}
                          >
                            <span className="mr-1">{emoji}</span>
                            <span>{userIds.length}</span>
                          </Badge>
                        ))}
                        {/* Add new reaction button (for demo, hardcode a few emojis) */}
                        {["👍", "❤️", "😂", "🎉", "😮"].map(emoji => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-xs"
                            onClick={() => handleReaction(message, emoji)}
                            disabled={reacting === message.id}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 opacity-0 hover:opacity-100 transition-opacity flex space-x-1">
                      {/* Pin/unpin button */}
                      <Button
                        variant={message.is_pinned ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        title={message.is_pinned ? 'Unpin' : 'Pin'}
                        onClick={() => handlePin(message, !message.is_pinned)}
                        disabled={pinning === message.id}
                      >
                        <span role="img" aria-label="pin">📌</span>
                      </Button>
                      {/* Reply button for thread */}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openThread(message)}>
                        <Reply className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEditMessage(message)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteMessage(message)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Composer for sending new messages */}
      <div className="flex items-center gap-2 mt-2">
        <Input
          value={composerContent}
          onChange={e => setComposerContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <label className="flex items-center cursor-pointer">
  <input
    type="file"
    style={{ display: 'none' }}
    onChange={e => setFile(e.target.files?.[0] || null)}
  />
  <Button variant="ghost" size="icon" asChild>
    <span>
      <Paperclip className="h-4 w-4" />
    </span>
  </Button>
  {file && (
    <span className="ml-2 text-xs text-muted-foreground truncate max-w-[120px]">{file.name}</span>
  )}
</label>
        <DatePicker
          selected={scheduledFor}
          onChange={(date: Date | null) => setScheduledFor(date)}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Schedule"
          customInput={<Button variant="ghost" size="icon"><CalendarIcon className="h-4 w-4" /></Button>}
        />
        <Button
          onClick={async () => {
            if (onSendMessage && composerContent.trim()) {
              await onSendMessage(composerContent, file, scheduledFor, null);
              setComposerContent('');
              setFile(null);
              setScheduledFor(null);
            }
          }}
          size="sm"
        >
          Send
        </Button>
      </div>
    </>
  );
};

export default ChatInterface;
