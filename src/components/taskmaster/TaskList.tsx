
import React from 'react';
import type { Project, Board } from '@/types/taskmaster';

interface TaskListProps {
  project: Project;
  board: Board;
}

const TaskList: React.FC<TaskListProps> = ({ project, board }) => {
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">List View</h3>
      <p className="text-muted-foreground">List view for {board.name} will be available soon</p>
    </div>
  );
};

export default TaskList;
