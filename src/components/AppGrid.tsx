
import React from 'react';
import AppCard from './AppCard';
import { 
  CheckSquare, 
  Clock, 
  MessageCircle, 
  Clipboard, 
  Folder, 
  DollarSign, 
  Users, 
  Handshake, 
  AlertTriangle, 
  BarChart 
} from 'lucide-react';

const apps = [
  {
    title: 'TaskMaster',
    description: 'Advanced task and project management',
    icon: CheckSquare,
    bgColor: 'bg-blue-500',
    route: '/taskmaster',
    featureCount: 15
  },
  {
    title: 'TimeTrackPro',
    description: 'Professional time tracking and reporting',
    icon: Clock,
    bgColor: 'bg-green-500',
    route: '/timetrackpro',
    featureCount: 12
  },
  {
    title: 'CollabSpace',
    description: 'Team collaboration and communication',
    icon: MessageCircle,
    bgColor: 'bg-purple-500',
    route: '/collabspace',
    featureCount: 10
  },
  {
    title: 'PlanBoard',
    description: 'Visual project planning and timelines',
    icon: Clipboard,
    bgColor: 'bg-orange-500',
    route: '/planboard',
    featureCount: 8
  },
  {
    title: 'FileVault',
    description: 'Secure file storage and sharing',
    icon: Folder,
    bgColor: 'bg-cyan-500',
    route: '/filevault',
    featureCount: 6
  },
  {
    title: 'BudgetBuddy',
    description: 'Financial tracking and budget management',
    icon: DollarSign,
    bgColor: 'bg-yellow-500',
    route: '/budgetbuddy',
    featureCount: 7
  },
  {
    title: 'ResourceHub',
    description: 'Team resource and capacity management',
    icon: Users,
    bgColor: 'bg-indigo-500',
    route: '/resourcehub',
    featureCount: 9
  },
  {
    title: 'ClientConnect',
    description: 'Client relationship management',
    icon: Handshake,
    bgColor: 'bg-pink-500',
    route: '/clientconnect',
    featureCount: 11
  },
  {
    title: 'RiskRadar',
    description: 'Project risk assessment and monitoring',
    icon: AlertTriangle,
    bgColor: 'bg-red-500',
    route: '/riskradar',
    featureCount: 5
  },
  {
    title: 'InsightIQ',
    description: 'Analytics and business intelligence',
    icon: BarChart,
    bgColor: 'bg-teal-500',
    route: '/insightiq',
    featureCount: 13
  }
];

const AppGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apps.map((app) => (
        <AppCard key={app.title} {...app} />
      ))}
    </div>
  );
};

export default AppGrid;
