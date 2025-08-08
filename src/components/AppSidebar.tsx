
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Users,
  MessageSquare,
  Database,
  BarChart3,
  Shield,
  Brain,
  Settings,
  User,
  Bell,
  Calendar,
  Globe,
  BookOpen,
  Wrench,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainApps = [
  { name: 'Dashboard', icon: Home, path: '/', color: 'text-blue-600', badge: null },
  { name: 'TaskMaster', icon: CheckSquare, path: '/taskmaster', color: 'text-purple-600', badge: 'NEW' },
  { name: 'TimeTrackPro', icon: Clock, path: '/timetrackpro', color: 'text-emerald-600', badge: null },
  { name: 'BudgetBuddy', icon: DollarSign, path: '/budgetbuddy', color: 'text-green-600', badge: null },
  { name: 'PlanBoard', icon: Calendar, path: '/planboard', color: 'text-orange-600', badge: null },
  { name: 'FileVault', icon: FileText, path: '/filevault', color: 'text-indigo-600', badge: null },
  { name: 'CollabSpace', icon: MessageSquare, path: '/collabspace', color: 'text-pink-600', badge: 'HOT' },
  { name: 'ResourceHub', icon: Database, path: '/resourcehub', color: 'text-cyan-600', badge: null },
  { name: 'ClientConnect', icon: Users, path: '/clientconnect', color: 'text-violet-600', badge: null },
];

const analyticsApps = [
  { name: 'RiskRadar', icon: AlertTriangle, path: '/riskradar', color: 'text-red-600', badge: null },
  { name: 'AI Features', icon: Brain, path: '/ai-features', color: 'text-purple-600', badge: 'AI' },
];

const systemApps = [
  { name: 'Integrations', icon: Zap, path: '/integrations', color: 'text-yellow-600', badge: 'BETA' },
  { name: 'KnowledgeNest', icon: BookOpen, path: '/knowledgenest', color: 'text-teal-600', badge: null },
  { name: 'ServiceCore', icon: Wrench, path: '/servicecore', color: 'text-gray-600', badge: null },
];

const utilityItems = [
  { name: 'Notifications', icon: Bell, path: '/notification-center', color: 'text-orange-500', badge: null },
  { name: 'Team Directory', icon: Users, path: '/team-directory', color: 'text-indigo-500', badge: null },
  { name: 'Profile', icon: User, path: '/profile', color: 'text-gray-500', badge: null },
  { name: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-500', badge: null },
];

const SectionGroup = ({ title, items, isOpen, onToggle }: {
  title: string;
  items: typeof mainApps;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const location = useLocation();
  const { state } = useSidebar();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <span>{title}</span>
          {state === "expanded" && (
            <div className="transition-transform duration-200">
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </div>
          )}
        </Button>
      </SidebarGroupLabel>
      {isOpen && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <NavLink to={item.path} className="flex items-center gap-2">
                      <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : item.color)} />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "ml-auto text-xs",
                            item.badge === 'AI' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none',
                            item.badge === 'HOT' && 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-none',
                            item.badge === 'NEW' && 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none',
                            item.badge === 'BETA' && 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none'
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    analytics: true,
    system: true,
    utilities: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Determine which sections should stay open based on current route
  const shouldKeepOpen = (items: typeof mainApps) => {
    return items.some(item => item.path === location.pathname);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">ProSync Suite</h1>
            <p className="text-xs text-muted-foreground">Business Suite</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2">
        <SectionGroup
          title={`Main Apps (${mainApps.length})`}
          items={mainApps}
          isOpen={expandedSections.main || shouldKeepOpen(mainApps)}
          onToggle={() => toggleSection('main')}
        />

        <SectionGroup
          title={`Analytics (${analyticsApps.length})`}
          items={analyticsApps}
          isOpen={expandedSections.analytics || shouldKeepOpen(analyticsApps)}
          onToggle={() => toggleSection('analytics')}
        />

        <SectionGroup
          title={`System (${systemApps.length})`}
          items={systemApps}
          isOpen={expandedSections.system || shouldKeepOpen(systemApps)}
          onToggle={() => toggleSection('system')}
        />

        <SectionGroup
          title={`Utilities (${utilityItems.length})`}
          items={utilityItems}
          isOpen={expandedSections.utilities || shouldKeepOpen(utilityItems)}
          onToggle={() => toggleSection('utilities')}
        />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
              v2.1
            </Badge>
            <span>ProSync Suite</span>
          </div>
          <div className="flex gap-1 ml-auto items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600">Online</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
