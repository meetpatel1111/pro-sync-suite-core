import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Kanban, Calendar, Clock, Bug, Layers, BarChart3 } from 'lucide-react';
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
      setBoards((data || []) as Board[]);
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
      } as Omit<Board, 'id' | 'created_at' | 'updated_at'>);

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
        return <Kanban className="h-5 w-5 text-white" />;
      case 'scrum':
        return <Calendar className="h-5 w-5 text-white" />;
      case 'timeline':
        return <Clock className="h-5 w-5 text-white" />;
      case 'issue_tracker':
        return <Bug className="h-5 w-5 text-white" />;
      default:
        return <Layers className="h-5 w-5 text-white" />;
    }
  };

  const getBoardGradient = (type: string) => {
    switch (type) {
      case 'kanban':
        return 'from-blue-500 to-indigo-600';
      case 'scrum':
        return 'from-purple-500 to-pink-600';
      case 'timeline':
        return 'from-emerald-500 to-teal-600';
      case 'issue_tracker':
        return 'from-red-500 to-orange-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse modern-card">
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between p-6 modern-card rounded-2xl">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gradient">{project.name} - Boards</h3>
          <p className="text-muted-foreground text-lg">Select a board to manage tasks and workflows</p>
        </div>
        <Button 
          onClick={handleCreateBoard} 
          className="btn-primary px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Board
        </Button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Card 
            key={board.id} 
            className={`cursor-pointer hover-lift modern-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group ${
              selectedBoard?.id === board.id ? 'ring-2 ring-primary shadow-primary/20' : ''
            }`}
            onClick={() => onBoardSelect(board)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${getBoardGradient(board.type)} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {getBoardIcon(board.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {board.name}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700 mt-1"
                    >
                      {board.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {board.description || `${board.type.replace('_', ' ')} board for comprehensive task management and workflow optimization`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {boards.length === 0 && (
        <div className="text-center py-16 modern-card rounded-2xl">
          <div className="mx-auto max-w-md space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gradient">No boards yet</h3>
            <p className="text-muted-foreground text-lg">
              Create your first board to start organizing tasks and workflows
            </p>
            <Button 
              onClick={handleCreateBoard}
              className="btn-primary px-6 py-3 text-base font-medium rounded-xl"
            >
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
