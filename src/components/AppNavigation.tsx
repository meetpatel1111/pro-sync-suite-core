
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Clock, 
  DollarSign, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  Phone, 
  Zap, 
  BarChart3, 
  Shield,
  BookOpen,
  Headphones
} from 'lucide-react';

const apps = [
  { name: 'TaskMaster', path: '/taskmaster', icon: CheckSquare, color: 'bg-blue-500', description: 'Task & Project Management' },
  { name: 'TimeTrackPro', path: '/timetrackpro', icon: Clock, color: 'bg-green-500', description: 'Time Tracking & Productivity' },
  { name: 'BudgetBuddy', path: '/budgetbuddy', icon: DollarSign, color: 'bg-emerald-500', description: 'Financial Management' },
  { name: 'FileVault', path: '/filevault', icon: FolderOpen, color: 'bg-orange-500', description: 'Document & File Management' },
  { name: 'CollabSpace', path: '/collabspace', icon: MessageSquare, color: 'bg-purple-500', description: 'Team Communication' },
  { name: 'ResourceHub', path: '/resourcehub', icon: Users, color: 'bg-cyan-500', description: 'Resource Planning' },
  { name: 'ClientConnect', path: '/clientconnect', icon: Phone, color: 'bg-pink-500', description: 'CRM & Client Management' },
  { name: 'IntegrationHub', path: '/integrationhub', icon: Zap, color: 'bg-yellow-500', description: 'Workflow Automation' },
  { name: 'InsightIQ', path: '/insightiq', icon: BarChart3, color: 'bg-indigo-500', description: 'Analytics & Reporting' },
  { name: 'RiskRadar', path: '/riskradar', icon: Shield, color: 'bg-red-500', description: 'Risk Management' },
  { name: 'KnowledgeNest', path: '/knowledgenest', icon: BookOpen, color: 'bg-teal-500', description: 'Wiki & Knowledge Base', isNew: true },
  { name: 'ServiceCore', path: '/servicecore', icon: Headphones, color: 'bg-violet-500', description: 'ITSM & Support Desk', isNew: true },
];

const AppNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {apps.map((app) => {
        const IconComponent = app.icon;
        const isActive = location.pathname === app.path;
        
        return (
          <Link key={app.name} to={app.path} className="group">
            <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              isActive ? 'ring-2 ring-primary shadow-lg' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${app.color} p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {app.isNew && (
                    <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
                      NEW
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {app.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {app.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default AppNavigation;
