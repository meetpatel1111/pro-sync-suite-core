
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Settings, 
  Clock, 
  User, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { servicecoreService } from '@/services/servicecoreService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChangeManagementProps {
  searchQuery?: string;
}

const ChangeManagement: React.FC<ChangeManagementProps> = ({ searchQuery = '' }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual service call
      const mockChanges = [
        {
          id: '1',
          title: 'System Upgrade v2.1',
          description: 'Upgrading core system components',
          status: 'scheduled',
          priority: 'high',
          change_type: 'major',
          scheduled_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          change_number: '1001'
        },
        {
          id: '2',
          title: 'Database Migration',
          description: 'Migrating to new database server',
          status: 'approved',
          priority: 'critical',
          change_type: 'standard',
          scheduled_date: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          change_number: '1002'
        }
      ];
      setChanges(mockChanges);
    } catch (error) {
      console.error('Error loading changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load change requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChanges = changes.filter(change => {
    const matchesSearch = change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         change.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || change.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'submitted': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'implemented': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-muted-foreground">Loading change requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Change Management</h2>
          <p className="text-muted-foreground">Manage and track system changes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Change
          </Button>
        </div>
      </div>

      {/* Changes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChanges.map((change) => (
          <Card key={change.id} className="hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(change.status)}
                  <Badge variant="outline">CHG-{change.change_number}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(change.priority)}`} />
                  <span className="text-xs text-muted-foreground capitalize">{change.priority}</span>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2">{change.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {change.description}
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={change.status === 'approved' ? 'default' : 'secondary'}>
                    {change.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{change.change_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span>{new Date(change.scheduled_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" className="hover-scale">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChanges.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No change requests found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first change request to get started'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Create Change Request
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChangeManagement;
