
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Target,
  Brain,
  Settings,
  User,
  Bell,
  Calendar,
  Menu,
  X,
  Zap,
  Globe,
  BookOpen,
  Wrench,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const mainApps = [
    { name: 'Dashboard', icon: Home, path: '/', color: 'text-blue-600' },
    { name: 'TaskMaster', icon: CheckSquare, path: '/taskmaster', color: 'text-purple-600' },
    { name: 'TimeTrackPro', icon: Clock, path: '/timetrackpro', color: 'text-emerald-600' },
    { name: 'BudgetBuddy', icon: DollarSign, path: '/budgetbuddy', color: 'text-green-600' },
    { name: 'PlanBoard', icon: Calendar, path: '/planboard', color: 'text-orange-600' },
    { name: 'FileVault', icon: FileText, path: '/filevault', color: 'text-indigo-600' },
    { name: 'CollabSpace', icon: MessageSquare, path: '/collabspace', color: 'text-pink-600' },
    { name: 'ResourceHub', icon: Database, path: '/resourcehub', color: 'text-cyan-600' },
    { name: 'ClientConnect', icon: Users, path: '/clientconnect', color: 'text-violet-600' },
  ];

  const analyticsApps = [
    { name: 'InsightIQ', icon: BarChart3, path: '/insightiq', color: 'text-blue-600' },
    { name: 'RiskRadar', icon: AlertTriangle, path: '/riskradar', color: 'text-red-600' },
    { name: 'AI Features', icon: Brain, path: '/ai-features', color: 'text-purple-600' },
  ];

  const systemApps = [
    { name: 'Integrations', icon: Zap, path: '/integrations', color: 'text-yellow-600' },
    { name: 'KnowledgeNest', icon: BookOpen, path: '/knowledgenest', color: 'text-teal-600' },
    { name: 'ServiceCore', icon: Wrench, path: '/servicecore', color: 'text-gray-600' },
  ];

  const utilityItems = [
    { name: 'Notifications', icon: Bell, path: '/notification-center', color: 'text-orange-500' },
    { name: 'Team Directory', icon: Users, path: '/team-directory', color: 'text-indigo-500' },
    { name: 'Profile', icon: User, path: '/profile', color: 'text-gray-500' },
    { name: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-500' },
  ];

  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <NavLink
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
      {!isCollapsed && (
        <span className="font-medium text-sm">{item.name}</span>
      )}
    </NavLink>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    !isCollapsed && (
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
        {title}
      </h3>
    )
  );

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            ProSync Suite
          </h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Apps */}
        <div className="space-y-2">
          <SectionHeader title="Main Apps" />
          {mainApps.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>

        {/* Analytics & Insights */}
        <div className="space-y-2">
          <SectionHeader title="Analytics" />
          {analyticsApps.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>

        {/* System Apps */}
        <div className="space-y-2">
          <SectionHeader title="System" />
          {systemApps.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>

        {/* Utilities */}
        <div className="space-y-2">
          <SectionHeader title="Utilities" />
          {utilityItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Badge variant="secondary" className="text-xs">
              v2.0
            </Badge>
            <span>ProSync Suite</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
