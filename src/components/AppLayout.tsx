
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import FloatingActionButton from './FloatingActionButton';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:px-8 xl:px-12 2xl:px-16 relative overflow-auto">
          <div className="max-w-8xl mx-auto">
            {children}
          </div>
          <FloatingActionButton />
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
