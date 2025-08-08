
import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import FloatingActionButton from './FloatingActionButton';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <Header />
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 p-6 lg:px-8 xl:px-12 2xl:px-16 relative overflow-auto">
            <div className="max-w-8xl mx-auto">
              {children}
            </div>
            <FloatingActionButton />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
