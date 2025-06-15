
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Flag, MessageSquare, Paperclip } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: string;
  due_date?: string;
  assigned_to?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface BoardViewProps {
  columns: Column[];
  onTaskMove: (taskId: string, newStatus: string, newIndex: number) => void;
  onTaskClick: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const statusColors = {
  todo: 'bg-gray-100',
  'in-progress': 'bg-blue-100',
  review: 'bg-purple-100',
  done: 'bg-green-100',
};

const BoardView = ({ columns, onTaskMove, onTaskClick }: BoardViewProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
      onTaskMove(draggableId, destination.droppableId, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-6 h-full overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {column.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-muted/50' : ''
                  }`}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`cursor-pointer hover:shadow-md transition-all ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                          }`}
                          onClick={() => onTaskClick(task)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                              <div
                                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  priorityColors[task.priority as keyof typeof priorityColors]
                                }`}
                              />
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {task.description && (
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.due_date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              
                              {(task.assignee || (task.assigned_to && task.assigned_to.length > 0)) && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={`/avatar-${task.assignee || task.assigned_to?.[0]}.png`} />
                                  <AvatarFallback className="text-xs">
                                    {(task.assignee || task.assigned_to?.[0] || '').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default BoardView;
