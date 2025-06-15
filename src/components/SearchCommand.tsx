
import React, { useState, useEffect } from 'react';
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
  Search,
  CheckSquare,
  DollarSign,
  Settings,
  Bell,
  User,
  Home,
  Plus,
  FolderOpen,
  Target
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// More specific type that avoids deep instantiation issues
type IconComponent = (props: { className?: string }) => JSX.Element;

interface AppItem {
  name: string;
  path: string;
  icon: IconComponent;
  description: string;
}

interface ActionItem {
  name: string;
  action: () => void;
  icon: IconComponent;
  description: string;
}

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);

  // Fetch data when search opens
  useEffect(() => {
    if (open && session?.user?.id) {
      fetchSearchData();
    }
  }, [open, session?.user?.id]);

  const fetchSearchData = async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, description, status, priority, project')
        .eq('user_id', session.user.id)
        .limit(10);
      
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, description')
        .eq('user_id', session.user.id)
        .limit(10);

      // Fetch files
      const { data: filesData } = await supabase
        .from('files')
        .select('id, name, size, type')
        .eq('user_id', session.user.id)
        .limit(10);

      // Fetch time entries
      const { data: timeEntriesData } = await supabase
        .from('time_entries')
        .select('id, description, date, time_spent')
        .eq('user_id', session.user.id)
        .limit(10);

      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setFiles(filesData || []);
      setTimeEntries(timeEntriesData || []);
    } catch (error) {
      console.error('Error fetching search data:', error);
    }
  };

  const apps: AppItem[] = [
    { name: 'Dashboard', path: '/', icon: Home, description: 'Main dashboard overview' },
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
    { name: 'Settings', path: '/settings', icon: Settings, description: 'App settings' },
    { name: 'Profile', path: '/profile', icon: User, description: 'User profile' },
    { name: 'Notifications', path: '/notifications', icon: Bell, description: 'View notifications' },
  ];

  const quickActions: ActionItem[] = [
    { name: 'Create New Task', action: () => navigate('/taskmaster'), icon: Plus, description: 'Add a new task' },
    { name: 'Start Time Tracking', action: () => navigate('/timetrackpro'), icon: Clock, description: 'Begin tracking time' },
    { name: 'Upload File', action: () => navigate('/filevault'), icon: FolderOpen, description: 'Upload a new file' },
    { name: 'View Reports', action: () => navigate('/insightiq'), icon: BarChart2, description: 'Check analytics' },
    { name: 'Create Project', action: () => navigate('/taskmaster'), icon: Target, description: 'Start a new project' },
    { name: 'Track Expense', action: () => navigate('/budgetbuddy'), icon: DollarSign, description: 'Add budget entry' },
  ];

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = quickActions.filter(action =>
    action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTimeEntries = timeEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearchQuery('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search apps, tasks, files, projects, or actions..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {filteredApps.length > 0 && (
          <CommandGroup heading="Apps & Pages">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <CommandItem
                  key={app.path}
                  onSelect={() => handleSelect(() => navigate(app.path))}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{app.name}</span>
                    <span className="text-sm text-muted-foreground">{app.description}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {filteredActions.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {filteredActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <CommandItem
                  key={action.name}
                  onSelect={() => handleSelect(action.action)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{action.name}</span>
                    <span className="text-sm text-muted-foreground">{action.description}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {filteredTasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {filteredTasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => handleSelect(() => navigate('/taskmaster'))}
                className="flex items-center gap-2 px-4 py-2"
              >
                <CheckSquare className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {task.status} • {task.priority} priority
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredProjects.length > 0 && (
          <CommandGroup heading="Projects">
            {filteredProjects.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => handleSelect(() => navigate('/taskmaster'))}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Target className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{project.name}</span>
                  {project.description && (
                    <span className="text-sm text-muted-foreground">{project.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredFiles.length > 0 && (
          <CommandGroup heading="Files">
            {filteredFiles.map((file) => (
              <CommandItem
                key={file.id}
                onSelect={() => handleSelect(() => navigate('/filevault'))}
                className="flex items-center gap-2 px-4 py-2"
              >
                <File className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {file.type} • {formatFileSize(file.size)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredTimeEntries.length > 0 && (
          <CommandGroup heading="Time Entries">
            {filteredTimeEntries.map((entry) => (
              <CommandItem
                key={entry.id}
                onSelect={() => handleSelect(() => navigate('/timetrackpro'))}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Clock className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{entry.description}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTimeSpent(entry.time_spent)} • {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
