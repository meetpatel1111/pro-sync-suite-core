
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, Search, Filter, Download, 
  Calendar, User, Activity, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'task' | 'project' | 'board' | 'sprint';
  entityId: string;
  entityName: string;
  changes: Record<string, { from: any; to: any }>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TaskAuditLogProps {
  projectId?: string;
  taskId?: string;
  boardId?: string;
}

const TaskAuditLog: React.FC<TaskAuditLogProps> = ({
  projectId,
  taskId,
  boardId
}) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [projectId, taskId, boardId]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filterAction, filterSeverity, filterDateRange]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: 'user1',
          userEmail: 'john@example.com',
          action: 'Task Created',
          entityType: 'task',
          entityId: 'task1',
          entityName: 'Implement user authentication',
          changes: {
            status: { from: null, to: 'todo' },
            priority: { from: null, to: 'high' }
          },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          severity: 'medium'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user2',
          userEmail: 'jane@example.com',
          action: 'Task Updated',
          entityType: 'task',
          entityId: 'task1',
          entityName: 'Implement user authentication',
          changes: {
            status: { from: 'todo', to: 'in_progress' },
            assignee: { from: null, to: 'john@example.com' }
          },
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          severity: 'low'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: 'user3',
          userEmail: 'admin@example.com',
          action: 'Permission Granted',
          entityType: 'project',
          entityId: 'project1',
          entityName: 'Web Application Project',
          changes: {
            permissions: { 
              from: ['user1'], 
              to: ['user1', 'user2'] 
            }
          },
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0...',
          severity: 'high'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          userId: 'user4',
          userEmail: 'security@example.com',
          action: 'Security Alert',
          entityType: 'task',
          entityId: 'task2',
          entityName: 'Database migration',
          changes: {
            security_level: { from: 'normal', to: 'elevated' }
          },
          ipAddress: '10.0.0.1',
          userAgent: 'SecurityBot/1.0',
          severity: 'critical'
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Severity filter
    if (filterSeverity) {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    // Date range filter
    if (filterDateRange) {
      const now = Date.now();
      const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      const range = ranges[filterDateRange as keyof typeof ranges];
      if (range) {
        filtered = filtered.filter(log => 
          new Date(log.timestamp).getTime() > now - range
        );
      }
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Entity Name', 'Severity', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userEmail,
        log.action,
        log.entityType,
        log.entityName,
        log.severity,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Audit logs exported successfully',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
      case 'high': 
        return <AlertCircle className="h-4 w-4" />;
      default: 
        return <Activity className="h-4 w-4" />;
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <Button onClick={exportLogs} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All time</SelectItem>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(log.severity)}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1 capitalize">{log.severity}</span>
                    </Badge>
                    <div>
                      <h3 className="font-semibold">{log.action}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {log.userEmail} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {log.entityType}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="font-medium">{log.entityName}</p>
                  <p className="text-sm text-muted-foreground">ID: {log.entityId}</p>
                </div>

                {Object.keys(log.changes).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Changes:</h4>
                    {Object.entries(log.changes).map(([field, change]) => (
                      <div key={field} className="text-sm bg-muted p-2 rounded">
                        <strong>{field}:</strong> {JSON.stringify(change.from)} → {JSON.stringify(change.to)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  IP: {log.ipAddress} • User Agent: {log.userAgent.substring(0, 50)}...
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskAuditLog;
