
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  BarChart2,
  PieChart,
  Users,
  Shield,
  FileCog,
  FolderLock,
  Home,
  Settings,
  Zap,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Main dashboard overview'
    },
    {
      title: 'Team Directory',
      href: '/team-directory',
      icon: Users,
      description: 'Team member directory'
    },
    {
      title: 'Notification Center',
      href: '/notification-center',
      icon: Bell,
      description: 'All notifications'
    },
    {
      title: 'AI Features',
      href: '/ai-features',
      icon: Sparkles,
      description: 'AI-powered tools'
    }
  ];

  const appNavItems = [
    {
      title: 'TaskMaster',
      href: '/taskmaster',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Task & workflow management'
    },
    {
      title: 'TimeTrackPro',
      href: '/timetrackpro',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Time tracking & productivity'
    },
    {
      title: 'CollabSpace',
      href: '/collabspace',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Team communication'
    },
    {
      title: 'PlanBoard',
      href: '/planboard',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Project planning'
    },
    {
      title: 'FileVault',
      href: '/filevault',
      icon: FolderLock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'File management'
    },
    {
      title: 'BudgetBuddy',
      href: '/budgetbuddy',
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Budget tracking'
    },
    {
      title: 'InsightIQ',
      href: '/insightiq',
      icon: BarChart2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Analytics & reports'
    },
    {
      title: 'ClientConnect',
      href: '/clientconnect',
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      description: 'Client management'
    },
    {
      title: 'RiskRadar',
      href: '/riskradar',
      icon: Shield,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      description: 'Risk tracking'
    },
    {
      title: 'ResourceHub',
      href: '/resourcehub',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Resource allocation'
    }
  ];

  const bottomNavItems = [
    {
      title: 'Integrations',
      href: '/integrations',
      icon: Zap,
      description: 'App integrations'
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'User settings'
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: UserCircle,
      description: 'User profile'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="font-bold text-lg">ProSync</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main
              </h3>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                  {!isCollapsed && isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <Separator />

          {/* Applications */}
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Applications
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {appNavItems.length}
                </Badge>
              </div>
            )}
            <nav className="space-y-1">
              {appNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive(item.href)
                      ? `${item.bgColor} ${item.color} border`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    isActive(item.href) ? item.color : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.title}</div>
                      {!isActive(item.href) && (
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      )}
                    </div>
                  )}
                  {!isCollapsed && isActive(item.href) && (
                    <div className={cn("ml-auto w-2 h-2 rounded-full", item.color.replace('text-', 'bg-'))} />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <Separator />

          {/* Bottom Navigation */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                System
              </h3>
            )}
            <nav className="space-y-1">
              {bottomNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                  {!isCollapsed && item.href === '/integrations' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      New
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            ProSync Suite v2.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
