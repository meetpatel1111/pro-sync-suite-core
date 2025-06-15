
import React, { useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  BarChart2, 
  Users, 
  Shield, 
  PieChart,
  File,
  Search
} from 'lucide-react';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const apps = [
    { name: 'TaskMaster', path: '/taskmaster', icon: Calendar, description: 'Manage tasks and projects' },
    { name: 'TimeTrackPro', path: '/timetrackpro', icon: Clock, description: 'Track time and productivity' },
    { name: 'CollabSpace', path: '/collabspace', icon: MessageSquare, description: 'Team collaboration' },
    { name: 'PlanBoard', path: '/planboard', icon: FileText, description: 'Project planning' },
    { name: 'InsightIQ', path: '/insightiq', icon: BarChart2, description: 'Analytics and insights' },
    { name: 'FileVault', path: '/filevault', icon: File, description: 'File management' },
    { name: 'BudgetBuddy', path: '/budgetbuddy', icon: PieChart, description: 'Budget tracking' },
    { name: 'ClientConnect', path: '/clientconnect', icon: Users, description: 'Client management' },
    { name: 'RiskRadar', path: '/riskradar', icon: Shield, description: 'Risk management' },
    { name: 'ResourceHub', path: '/resourcehub', icon: Users, description: 'Resource allocation' },
  ];

  const quickActions = [
    { name: 'Create New Task', action: () => navigate('/taskmaster'), icon: Calendar },
    { name: 'Start Time Tracking', action: () => navigate('/timetrackpro'), icon: Clock },
    { name: 'Upload File', action: () => navigate('/filevault'), icon: File },
    { name: 'View Reports', action: () => navigate('/insightiq'), icon: BarChart2 },
  ];

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = quickActions.filter(action =>
    action.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search apps, tasks, files, or actions..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {filteredApps.length > 0 && (
          <CommandGroup heading="Apps">
            {filteredApps.map((app) => (
              <CommandItem
                key={app.path}
                onSelect={() => handleSelect(() => navigate(app.path))}
                className="flex items-center gap-2 px-4 py-2"
              >
                <app.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{app.name}</span>
                  <span className="text-sm text-muted-foreground">{app.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredActions.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {filteredActions.map((action) => (
              <CommandItem
                key={action.name}
                onSelect={() => handleSelect(action.action)}
                className="flex items-center gap-2 px-4 py-2"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
