
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Settings, 
  LogOut, 
  User, 
  Bell,
  Menu,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ProSync Suite
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Productivity Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <ColorfulButton 
                variant={location.pathname === '/' ? 'primary' : 'ghost'} 
                onClick={() => navigate('/')}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </ColorfulButton>
              
              <ColorfulButton 
                variant="ghost" 
                size="sm"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                  3
                </Badge>
              </ColorfulButton>

              <ColorfulButton 
                variant={location.pathname === '/settings' ? 'primary' : 'ghost'} 
                onClick={() => navigate('/settings')}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </ColorfulButton>

              {/* User Profile */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-gradient-to-r from-blue-400 to-purple-400 ring-offset-2">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <ColorfulButton 
                  variant="outline" 
                  onClick={handleSignOut}
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                </ColorfulButton>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <ColorfulButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </ColorfulButton>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="px-4 py-4 space-y-3">
                <ColorfulButton 
                  variant={location.pathname === '/' ? 'primary' : 'ghost'} 
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </ColorfulButton>
                
                <ColorfulButton 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white">
                    3
                  </Badge>
                </ColorfulButton>

                <ColorfulButton 
                  variant={location.pathname === '/settings' ? 'primary' : 'ghost'} 
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </ColorfulButton>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                    <Avatar className="h-10 w-10 ring-2 ring-gradient-to-r from-blue-400 to-purple-400">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <ColorfulButton 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full mt-3"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </ColorfulButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
