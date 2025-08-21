
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Kanban, Shield, Workflow, History, Settings, 
  BarChart3, Users, Target, Zap 
} from 'lucide-react';
import TaskMasterMain from './TaskMasterMain';
import TaskSecurityManager from './TaskSecurityManager';
import TaskWorkflowManager from './TaskWorkflowManager';
import TaskAuditLog from './TaskAuditLog';
import { Badge } from '@/components/ui/badge';

interface EnhancedTaskMasterProps {
  projectId?: string;
}

const EnhancedTaskMaster: React.FC<EnhancedTaskMasterProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('boards');

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
              <Kanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                TaskMaster Pro
              </h1>
              <p className="text-lg text-blue-100/90 font-medium">Enterprise Task & Project Management</p>
            </div>
          </div>
          
          <p className="text-blue-50/95 max-w-3xl mb-4 leading-relaxed">
            Advanced task management with enterprise security, workflow automation, 
            comprehensive audit trails, and Jira-like functionality for professional teams.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Security
            </Badge>
            <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
              <Workflow className="h-4 w-4 mr-2" />
              Custom Workflows
            </Badge>
            <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
              <History className="h-4 w-4 mr-2" />
              Audit Trails
            </Badge>
            <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Analytics
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 glass-morphism">
          <TabsTrigger value="boards" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Boards
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="boards" className="mt-6">
          <TaskMasterMain />
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <TaskSecurityManager 
              projectId={projectId || 'default'} 
            />
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <TaskWorkflowManager 
              boardId="default-board"
              onWorkflowUpdate={() => {
                console.log('Workflow updated');
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <TaskAuditLog 
              projectId={projectId}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Configuration</h3>
                  <p>
                    Configure advanced settings, integrations, and enterprise features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTaskMaster;
