
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Settings, 
  Users2, 
  Timer, 
  Kanban, 
  FolderOpen, 
  PieChart, 
  MessageCircle, 
  ShieldCheck, 
  Bell,
  User,
  Zap,
  Link as LinkIcon,
  Wallet,
  UserCheck
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
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/taskmaster">
              <Button variant="ghost" className="w-full justify-start">
                <Kanban className="mr-2 h-4 w-4" />
                TaskMaster
              </Button>
            </Link>
            <Link to="/timetrackpro">
              <Button variant="ghost" className="w-full justify-start">
                <Timer className="mr-2 h-4 w-4" />
                TimeTrackPro
              </Button>
            </Link>
            <Link to="/collabspace">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                CollabSpace
              </Button>
            </Link>
            <Link to="/planboard">
              <Button variant="ghost" className="w-full justify-start">
                <Zap className="mr-2 h-4 w-4" />
                PlanBoard
              </Button>
            </Link>
            <Link to="/insightiq">
              <Button variant="ghost" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
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
              <Button variant="ghost" className="w-full justify-start">
                <FolderOpen className="mr-2 h-4 w-4" />
                FileVault
              </Button>
            </Link>
            <Link to="/budgetbuddy">
              <Button variant="ghost" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                BudgetBuddy
              </Button>
            </Link>
            <Link to="/clientconnect">
              <Button variant="ghost" className="w-full justify-start">
                <Users2 className="mr-2 h-4 w-4" />
                ClientConnect
              </Button>
            </Link>
            <Link to="/riskradar">
              <Button variant="ghost" className="w-full justify-start">
                <ShieldCheck className="mr-2 h-4 w-4" />
                RiskRadar
              </Button>
            </Link>
            <Link to="/resourcehub">
              <Button variant="ghost" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                ResourceHub
              </Button>
            </Link>
            <Link to="/integrations">
              <Button variant="ghost" className="w-full justify-start">
                <LinkIcon className="mr-2 h-4 w-4" />
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
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
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
