
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Search, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bug
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProblemManagementProps {
  searchQuery?: string;
}

const ProblemManagement: React.FC<ProblemManagementProps> = ({ searchQuery = '' }) => {
  const { toast } = useToast();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual service call
      const mockProblems = [
        {
          id: '1',
          title: 'Recurring Email Delivery Issues',
          description: 'Multiple incidents related to email delivery failures',
          status: 'investigating',
          priority: 'high',
          category: 'email',
          created_at: new Date().toISOString(),
          problem_number: '2001',
          related_incidents: 5
        },
        {
          id: '2',
          title: 'Database Performance Degradation',
          description: 'Slow response times across multiple applications',
          status: 'known_error',
          priority: 'medium',
          category: 'database',
          created_at: new Date().toISOString(),
          problem_number: '2002',
          related_incidents: 3
        }
      ];
      setProblems(mockProblems);
    } catch (error) {
      console.error('Error loading problems:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problem records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'investigating': return <Search className="h-4 w-4 text-blue-500" />;
      case 'known_error': return <Bug className="h-4 w-4 text-orange-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-muted-foreground">Loading problem records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Problem Management</h2>
          <p className="text-muted-foreground">Identify and resolve root causes</p>
        </div>
        <Button className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Problem
        </Button>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((problem) => (
          <Card key={problem.id} className="hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(problem.status)}
                  <Badge variant="outline">PRB-{problem.problem_number}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(problem.priority)}`} />
                  <span className="text-xs text-muted-foreground capitalize">{problem.priority}</span>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2">{problem.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {problem.description}
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={problem.status === 'resolved' ? 'default' : 'secondary'}>
                    {problem.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Related Incidents:</span>
                  <span className="font-medium">{problem.related_incidents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" className="hover-scale">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  <Search className="h-3 w-3 mr-1" />
                  Investigate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <Bug className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No problems found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first problem record to get started'}
          </p>
          <Button className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Create Problem Record
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProblemManagement;
