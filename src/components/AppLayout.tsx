
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:px-8 xl:px-12 2xl:px-16 relative">
          <div className="max-w-8xl mx-auto">
            {children}
          </div>
          <FloatingActionButton />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
