
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Timer, MessageCircle, Zap, TrendingUp, 
         Kanban, Wallet, Users2, ShieldCheck, UserCheck, FolderOpen, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden border-b w-full bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-prosync-400 to-prosync-700"></div>
          <h2 className="text-xl font-bold">ProSync</h2>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-prosync-400 to-prosync-700"></div>
                <h2 className="text-xl font-bold">ProSync</h2>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="px-4 py-6">
              <nav className="space-y-2">
                <Link to="/" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/taskmaster" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Kanban className="mr-2 h-4 w-4" />
                    TaskMaster
                  </Button>
                </Link>
                <Link to="/timetrackpro" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Timer className="mr-2 h-4 w-4" />
                    TimeTrackPro
                  </Button>
                </Link>
                <Link to="/collabspace" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    CollabSpace
                  </Button>
                </Link>
                <Link to="/planboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Zap className="mr-2 h-4 w-4" />
                    PlanBoard
                  </Button>
                </Link>
                <Link to="/insightiq" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    InsightIQ
                  </Button>
                </Link>
                <Link to="/filevault" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    FileVault
                  </Button>
                </Link>
                <Link to="/budgetbuddy" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Wallet className="mr-2 h-4 w-4" />
                    BudgetBuddy
                  </Button>
                </Link>
                <Link to="/clientconnect" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users2 className="mr-2 h-4 w-4" />
                    ClientConnect
                  </Button>
                </Link>
                <Link to="/riskradar" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    RiskRadar
                  </Button>
                </Link>
                <Link to="/resourcehub" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    ResourceHub
                  </Button>
                </Link>
                <Link to="/integrations" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Integrations
                  </Button>
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
