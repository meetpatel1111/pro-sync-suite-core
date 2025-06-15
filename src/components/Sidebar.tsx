
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Settings, 
  Users2, 
  Timer, 
  Layers3, 
  FolderOpen, 
  PieChart, 
  MessageSquare, 
  Shield, 
  Bell,
  User,
  Zap,
  Network,
  CreditCard,
  UserCog,
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div className={cn("pb-12 w-64 border-r bg-background hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <nav className="space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Home className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                Dashboard
              </Button>
            </Link>
            <Link to="/taskmaster">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Layers3 className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                TaskMaster
              </Button>
            </Link>
            <Link to="/timetrackpro">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Timer className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                TimeTrackPro
              </Button>
            </Link>
            <Link to="/collabspace">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <MessageSquare className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                CollabSpace
              </Button>
            </Link>
            <Link to="/planboard">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Zap className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                PlanBoard
              </Button>
            </Link>
            <Link to="/insightiq">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <TrendingUp className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                InsightIQ
              </Button>
            </Link>
          </nav>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            More Apps
          </h3>
          <nav className="space-y-2">
            <Link to="/filevault">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Box className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                FileVault
              </Button>
            </Link>
            <Link to="/budgetbuddy">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <CreditCard className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                BudgetBuddy
              </Button>
            </Link>
            <Link to="/clientconnect">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Users2 className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                ClientConnect
              </Button>
            </Link>
            <Link to="/riskradar">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Shield className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                RiskRadar
              </Button>
            </Link>
            <Link to="/resourcehub">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <UserCog className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                ResourceHub
              </Button>
            </Link>
            <Link to="/integrations">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Network className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                Integrations
              </Button>
            </Link>
          </nav>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            Personal
          </h3>
          <nav className="space-y-2">
            <Link to="/profile">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <User className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                Profile
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Settings className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                Settings
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="ghost" className="w-full justify-start group">
                <div className="relative mr-2">
                  <Bell className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                Notifications
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
