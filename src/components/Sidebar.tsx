
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
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    analytics: true,
    system: true,
    utilities: true
  });
  const navigate = useNavigate();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    { name: 'InsightIQ', icon: BarChart3, path: '/insightiq', color: 'text-blue-600', badge: 'PRO' },
    { name: 'RiskRadar', icon: AlertTriangle, path: '/riskradar', color: 'text-red-600', badge: null },
    { name: 'AI Features', icon: Brain, path: '/ai-features', color: 'text-purple-600', badge: 'AI' },
  ];

  const systemApps = [
    { name: 'Integrations', icon: Zap, path: '/integrations', color: 'text-yellow-600', badge: 'BETA' },
    { name: 'KnowledgeNest', icon: BookOpen, path: '/knowledgenest', color: 'text-teal-600', badge: null },
    { name: 'ServiceCore', icon: Wrench, path: '/servicecore', color: 'text-gray-600', badge: null },
  ];

  const utilityItems = [
    { name: 'Notifications', icon: Bell, path: '/notification-center', color: 'text-orange-500', badge: '3' },
    { name: 'Team Directory', icon: Users, path: '/team-directory', color: 'text-indigo-500', badge: null },
    { name: 'Profile', icon: User, path: '/profile', color: 'text-gray-500', badge: null },
    { name: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-500', badge: null },
  ];

  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <NavLink
      to={item.path}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
        "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
        "hover:shadow-md hover:scale-105 transform",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        isActive
          ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-105'
          : 'text-gray-700 dark:text-gray-300'
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "p-1.5 rounded-lg transition-all duration-300",
          isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10'
        )}>
          <item.icon className={cn(
            "h-4 w-4 transition-all duration-300",
            isActive ? 'text-white' : item.color,
            "group-hover:scale-110"
          )} />
        </div>
        {!isCollapsed && (
          <span className={cn(
            "font-medium text-sm transition-all duration-300",
            isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
          )}>
            {item.name}
          </span>
        )}
      </div>
      {!isCollapsed && item.badge && (
        <Badge 
          variant={isActive ? "secondary" : "outline"}
          className={cn(
            "text-xs px-2 py-0.5 transition-all duration-300 relative z-10",
            isActive ? 'bg-white/20 text-white border-white/30' : 'border-primary/30 text-primary',
            item.badge === 'AI' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none',
            item.badge === 'HOT' && 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-none',
            item.badge === 'NEW' && 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none',
            item.badge === 'PRO' && 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none',
            item.badge === 'BETA' && 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none'
          )}
        >
          {item.badge}
        </Badge>
      )}
    </NavLink>
  );

  const SectionHeader = ({ title, section, count }: { title: string; section: keyof typeof expandedSections; count?: number }) => (
    !isCollapsed && (
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-primary transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {count && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {count}
            </Badge>
          )}
        </div>
        <div className="transition-transform duration-300 group-hover:scale-110">
          {expandedSections[section] ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>
      </button>
    )
  );

  const AnimatedSection = ({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) => (
    <div className={cn(
      "overflow-hidden transition-all duration-500 ease-in-out",
      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    )}>
      <div className="space-y-1 pt-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-500 ease-in-out shadow-xl",
      "backdrop-blur-lg bg-white/95 dark:bg-gray-900/95",
      isCollapsed ? 'w-20' : 'w-72'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary/5 to-transparent">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                ProSync Suite
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Business Suite
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 hover:bg-primary/10 transition-all duration-300 hover:scale-110",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Main Apps */}
        <div className="space-y-2">
          <SectionHeader title="Main Apps" section="main" count={mainApps.length} />
          <AnimatedSection isExpanded={expandedSections.main}>
            {mainApps.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </AnimatedSection>
        </div>

        {/* Analytics & Insights */}
        <div className="space-y-2">
          <SectionHeader title="Analytics" section="analytics" count={analyticsApps.length} />
          <AnimatedSection isExpanded={expandedSections.analytics}>
            {analyticsApps.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </AnimatedSection>
        </div>

        {/* System Apps */}
        <div className="space-y-2">
          <SectionHeader title="System" section="system" count={systemApps.length} />
          <AnimatedSection isExpanded={expandedSections.system}>
            {systemApps.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </AnimatedSection>
        </div>

        {/* Utilities */}
        <div className="space-y-2">
          <SectionHeader title="Utilities" section="utilities" count={utilityItems.length} />
          <AnimatedSection isExpanded={expandedSections.utilities}>
            {utilityItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </AnimatedSection>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-primary/10 text-primary">
                v2.1
              </Badge>
              <span>ProSync Suite</span>
            </div>
            <div className="flex gap-1 ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
