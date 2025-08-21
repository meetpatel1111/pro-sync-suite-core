
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserCheck, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

interface Permission {
  id: string;
  userId: string;
  userEmail: string;
  role: 'admin' | 'member' | 'viewer';
  grantedAt: string;
}

interface SecurityLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details: string;
}

interface TaskSecurityManagerProps {
  projectId: string;
  boardId?: string;
  taskId?: string;
}

const TaskSecurityManager: React.FC<TaskSecurityManagerProps> = ({
  projectId,
  boardId,
  taskId
}) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member' | 'viewer'>('member');

  useEffect(() => {
    loadPermissions();
    loadSecurityLogs();
  }, [projectId, boardId, taskId]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockPermissions: Permission[] = [
        {
          id: '1',
          userId: user?.id || '',
          userEmail: user?.email || 'admin@example.com',
          role: 'admin',
          grantedAt: new Date().toISOString()
        }
      ];
      setPermissions(mockPermissions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityLogs = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          action: 'Permission Granted',
          userId: user?.id || '',
          userEmail: user?.email || 'admin@example.com',
          timestamp: new Date().toISOString(),
          details: 'Admin role granted to user'
        }
      ];
      setSecurityLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load security logs:', error);
    }
  };

  const addPermission = async () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newPermission: Permission = {
        id: Date.now().toString(),
        userId: 'new-user-id',
        userEmail: newUserEmail,
        role: newUserRole,
        grantedAt: new Date().toISOString()
      };

      setPermissions(prev => [...prev, newPermission]);
      setNewUserEmail('');
      setNewUserRole('member');

      toast({
        title: 'Success',
        description: 'Permission granted successfully',
      });

      // Log the action
      const logEntry: SecurityLog = {
        id: Date.now().toString(),
        action: 'Permission Granted',
        userId: user?.id || '',
        userEmail: user?.email || '',
        timestamp: new Date().toISOString(),
        details: `${newUserRole} role granted to ${newUserEmail}`
      };
      setSecurityLogs(prev => [logEntry, ...prev]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grant permission',
        variant: 'destructive',
      });
    }
  };

  const removePermission = async (permissionId: string) => {
    try {
      const permission = permissions.find(p => p.id === permissionId);
      setPermissions(prev => prev.filter(p => p.id !== permissionId));

      toast({
        title: 'Success',
        description: 'Permission revoked successfully',
      });

      // Log the action
      if (permission) {
        const logEntry: SecurityLog = {
          id: Date.now().toString(),
          action: 'Permission Revoked',
          userId: user?.id || '',
          userEmail: user?.email || '',
          timestamp: new Date().toISOString(),
          details: `${permission.role} role revoked from ${permission.userEmail}`
        };
        setSecurityLogs(prev => [logEntry, ...prev]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke permission',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'member': return <Edit className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="permissions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="logs">Security Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            {/* Add Permission Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grant Permission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="userEmail">User Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Read only</SelectItem>
                      <SelectItem value="member">Member - Read & Edit</SelectItem>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addPermission} className="w-full">
                  Grant Permission
                </Button>
              </CardContent>
            </Card>

            {/* Permissions List */}
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(permission.role)}>
                      {getRoleIcon(permission.role)}
                      <span className="ml-1 capitalize">{permission.role}</span>
                    </Badge>
                    <div>
                      <p className="font-medium">{permission.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Granted {new Date(permission.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {permission.userId !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePermission(permission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4 mt-1 text-orange-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground">by {log.userEmail}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskSecurityManager;
