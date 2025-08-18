
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface TaskCommentProps {
  comment: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
  };
}

const TaskComment: React.FC<TaskCommentProps> = ({ comment }) => {
  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {comment.user_id.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">User</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};

export default TaskComment;
