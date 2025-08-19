
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  task_id: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface TaskCommentProps {
  taskId: string;
}

const TaskComment: React.FC<TaskCommentProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      // First, get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        setComments([]);
        return;
      }

      // Then get user profiles for each comment
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Combine comments with profiles
        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          user_profiles: profilesData?.find(profile => profile.id === comment.user_id) || {
            full_name: 'Unknown User',
            avatar_url: null
          }
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error in fetchComments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: parentId
        });

      if (error) {
        console.error('Error creating comment:', error);
        return;
      }

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error in handleSubmitComment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const userProfile = comment.user_profiles || { full_name: 'Unknown User', avatar_url: null };
    
    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={userProfile.avatar_url || ''} />
          <AvatarFallback>
            {userProfile.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{userProfile.full_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="text-sm bg-muted p-3 rounded-lg">
            {comment.content}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="h-6 px-2 text-xs"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
          
          {replyTo === comment.id && (
            <div className="mt-2">
              <Textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={!newComment.trim()}
                >
                  Reply
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-medium">Comments</h3>
        </div>
        <div className="animate-pulse">Loading comments...</div>
      </div>
    );
  }

  const parentComments = comments.filter(c => !c.parent_id);
  const replyComments = comments.filter(c => c.parent_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-medium">Comments ({comments.length})</h3>
      </div>

      {/* Add new comment */}
      {!replyTo && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={() => handleSubmitComment()}
            disabled={!newComment.trim()}
            size="sm"
          >
            Add Comment
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {parentComments.map(comment => (
          <div key={comment.id} className="space-y-3">
            {renderComment(comment)}
            {/* Render replies */}
            {replyComments
              .filter(reply => reply.parent_id === comment.id)
              .map(reply => renderComment(reply, true))}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to add one!
        </div>
      )}
    </div>
  );
};

export default TaskComment;
