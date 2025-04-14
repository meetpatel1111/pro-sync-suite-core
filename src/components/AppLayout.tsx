
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import IntegrationNotifications from './IntegrationNotifications';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:px-8">
          <IntegrationNotifications />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
