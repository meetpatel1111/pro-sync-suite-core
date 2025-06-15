
import React from 'react';
import type { Project, Board } from '@/types/taskmaster';

interface TaskReportsProps {
  project: Project;
  board: Board;
}

const TaskReports: React.FC<TaskReportsProps> = ({ project, board }) => {
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">Reports</h3>
      <p className="text-muted-foreground">Reports for {board.name} will be available soon</p>
    </div>
  );
};

export default TaskReports;
