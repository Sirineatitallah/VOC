import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/vi')) {
      return 'Vulnerability Intelligence';
    } else if (path.includes('/cti')) {
      return 'Cyber Threat Intelligence';
    } else if (path.includes('/asm')) {
      return 'Attack Surface Management';
    } else if (path.includes('/analytics')) {
      return 'Analytiques';
    } else if (path.includes('/activity')) {
      return 'Activité';
    } else if (path.includes('/settings')) {
      return 'Paramètres';
    } else if (path.includes('/help')) {
      return 'Aide';
    }
    return 'Dashboard';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header toggleSidebar={toggleSidebar} title={getPageTitle()} />
        <main className="p-4 lg:p-6 bg-gray-50 dark:bg-dark-400 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;