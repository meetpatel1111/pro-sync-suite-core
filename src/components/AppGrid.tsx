
import React from 'react';
import AppCard from './AppCard';

const apps = [
  {
    name: 'TaskMaster',
    description: 'Advanced task and project management',
    icon: '✓',
    color: 'bg-blue-500',
    href: '/taskmaster'
  },
  {
    name: 'TimeTrackPro',
    description: 'Professional time tracking and reporting',
    icon: '⏰',
    color: 'bg-green-500',
    href: '/timetrackpro'
  },
  {
    name: 'CollabSpace',
    description: 'Team collaboration and communication',
    icon: '💬',
    color: 'bg-purple-500',
    href: '/collabspace'
  },
  {
    name: 'PlanBoard',
    description: 'Visual project planning and timelines',
    icon: '📋',
    color: 'bg-orange-500',
    href: '/planboard'
  },
  {
    name: 'FileVault',
    description: 'Secure file storage and sharing',
    icon: '📁',
    color: 'bg-cyan-500',
    href: '/filevault'
  },
  {
    name: 'BudgetBuddy',
    description: 'Financial tracking and budget management',
    icon: '💰',
    color: 'bg-yellow-500',
    href: '/budgetbuddy'
  },
  {
    name: 'ResourceHub',
    description: 'Team resource and capacity management',
    icon: '👥',
    color: 'bg-indigo-500',
    href: '/resourcehub'
  },
  {
    name: 'ClientConnect',
    description: 'Client relationship management',
    icon: '🤝',
    color: 'bg-pink-500',
    href: '/clientconnect'
  },
  {
    name: 'RiskRadar',
    description: 'Project risk assessment and monitoring',
    icon: '⚠️',
    color: 'bg-red-500',
    href: '/riskradar'
  },
  {
    name: 'InsightIQ',
    description: 'Analytics and business intelligence',
    icon: '📊',
    color: 'bg-teal-500',
    href: '/insightiq'
  }
];

const AppGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apps.map((app) => (
        <AppCard key={app.name} {...app} />
      ))}
    </div>
  );
};

export default AppGrid;
