
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Check, X, Reply, User } from 'lucide-react';
import { knowledgenestService } from '@/services/knowledgenestService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { PageComment } from '@/types/knowledgenest';

interface CollaborationPanelProps {
  pageId: string;
  isVisible: boolean;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  pageId,
  isVisible
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [comments, setComments] = useState<PageComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && pageId) {
      loadComments();
    }
  }, [isVisible, pageId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await knowledgenestService.getPageComments(pageId);
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { data, error } = await knowledgenestService.createComment({
        page_id: pageId,
        author_id: user.id,
        comment: newComment,
        parent_id: replyingTo,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });

      setNewComment('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const { error } = await knowledgenestService.resolveComment(commentId);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment resolved',
      });

      loadComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve comment',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getNestedComments = (parentId: string | null = null): PageComment[] => {
    return comments.filter(comment => comment.parent_id === parentId);
  };

  const renderComment = (comment: PageComment, level: number = 0) => (
    <div key={comment.id} className={`${level > 0 ? 'ml-6 border-l pl-4' : ''} mb-4`}>
      <Card className={comment.is_resolved ? 'opacity-60' : ''}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium">
                {comment.author_id.slice(0, 8)}...
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {comment.is_resolved && (
                <Badge variant="secondary" className="text-xs">
                  Resolved
                </Badge>
              )}
              {!comment.is_resolved && comment.author_id === user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleResolveComment(comment.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm">{comment.comment}</p>
          {comment.line_reference && (
            <Badge variant="outline" className="mt-2 text-xs">
              Line: {comment.line_reference}
            </Badge>
          )}
        </CardContent>
      </Card>
      
      {/* Render nested replies */}
      {getNestedComments(comment.id).map(reply => renderComment(reply, level + 1))}
      
      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="mt-2 ml-6">
          <div className="flex space-x-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1"
              rows={2}
            />
            <div className="flex flex-col space-y-1">
              <Button size="sm" onClick={handleAddComment}>
                <Send className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-xs">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getNestedComments().map(comment => renderComment(comment))}
            </div>
          )}
        </ScrollArea>
        
        {/* Add comment form */}
        {!replyingTo && (
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
