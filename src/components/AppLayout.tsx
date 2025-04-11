
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <MobileNav />
        <main className="flex-1 p-6 md:px-8 pt-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
