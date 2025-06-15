
import React from 'react';
import type { Project, Board } from '@/types/taskmaster';

interface TaskCalendarProps {
  project: Project;
  board: Board;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ project, board }) => {
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
      <p className="text-muted-foreground">Calendar view for {board.name} will be available soon</p>
    </div>
  );
};

export default TaskCalendar;
