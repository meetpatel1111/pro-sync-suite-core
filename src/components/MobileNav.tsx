
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Timer, MessageSquare, Zap, TrendingUp, 
         Layers3, CreditCard, Users2, Shield, UserCog, Box, Network } from 'lucide-react';
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
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Home className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    Dashboard
                  </Button>
                </Link>
                <Link to="/taskmaster" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Layers3 className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    TaskMaster
                  </Button>
                </Link>
                <Link to="/timetrackpro" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Timer className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    TimeTrackPro
                  </Button>
                </Link>
                <Link to="/collabspace" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <MessageSquare className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    CollabSpace
                  </Button>
                </Link>
                <Link to="/planboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Zap className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    PlanBoard
                  </Button>
                </Link>
                <Link to="/insightiq" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <TrendingUp className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    InsightIQ
                  </Button>
                </Link>
                <Link to="/filevault" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Box className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    FileVault
                  </Button>
                </Link>
                <Link to="/budgetbuddy" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <CreditCard className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    BudgetBuddy
                  </Button>
                </Link>
                <Link to="/clientconnect" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Users2 className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    ClientConnect
                  </Button>
                </Link>
                <Link to="/riskradar" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <Shield className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    RiskRadar
                  </Button>
                </Link>
                <Link to="/resourcehub" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start group">
                    <div className="relative mr-2">
                      <UserCog className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <div className="absolute inset-0 h-4 w-4 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    ResourceHub
                  </Button>
                </Link>
                <Link to="/integrations" onClick={() => setOpen(false)}>
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
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
