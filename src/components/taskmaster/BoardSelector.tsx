
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Kanban, Calendar, Clock, Bug } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import type { Board, Project } from '@/types/taskmaster';

interface BoardSelectorProps {
  project: Project;
  onBoardSelect: (board: Board) => void;
  selectedBoard?: Board;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({ project, onBoardSelect, selectedBoard }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project) {
      fetchBoards();
    }
  }, [project]);

  const fetchBoards = async () => {
    try {
      const { data, error } = await taskmasterService.getBoards(project.id);
      if (error) {
        console.error('Error fetching boards:', error);
        toast({
          title: 'Error',
          description: 'Failed to load boards',
          variant: 'destructive',
        });
        return;
      }
      setBoards(data || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!user) return;

    const boardName = prompt('Enter board name:');
    const boardType = prompt('Enter board type (kanban, scrum, timeline, issue_tracker):') as Board['type'];
    
    if (!boardName || !boardType) return;

    try {
      const { data, error } = await taskmasterService.createBoard({
        project_id: project.id,
        name: boardName,
        type: boardType,
        config: {
          columns: [
            { id: 'todo', name: 'To Do' },
            { id: 'in_progress', name: 'In Progress' },
            { id: 'done', name: 'Done' }
          ]
        },
        created_by: user.id
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create board',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setBoards(prev => [data, ...prev]);
        toast({
          title: 'Success',
          description: 'Board created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        title: 'Error',
        description: 'Failed to create board',
        variant: 'destructive',
      });
    }
  };

  const getBoardIcon = (type: string) => {
    switch (type) {
      case 'kanban':
        return <Kanban className="h-4 w-4" />;
      case 'scrum':
        return <Calendar className="h-4 w-4" />;
      case 'timeline':
        return <Clock className="h-4 w-4" />;
      case 'issue_tracker':
        return <Bug className="h-4 w-4" />;
      default:
        return <Kanban className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{project.name} - Boards</h3>
          <p className="text-muted-foreground">Select a board to manage tasks</p>
        </div>
        <Button onClick={handleCreateBoard} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Board
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Card 
            key={board.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedBoard?.id === board.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onBoardSelect(board)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {getBoardIcon(board.type)}
                <CardTitle className="text-lg">{board.name}</CardTitle>
              </div>
              <Badge variant="outline" className="w-fit">
                {board.type.replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {board.description || `${board.type} board for task management`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first board to start organizing tasks
            </p>
            <Button onClick={handleCreateBoard}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Board
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSelector;
