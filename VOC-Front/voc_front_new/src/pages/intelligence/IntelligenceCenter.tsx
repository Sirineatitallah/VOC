import React from 'react';
import { Outlet } from 'react-router-dom';
import IntelligenceNavbar from '../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../components/intelligence/IntelligenceSidebar';

const IntelligenceCenter: React.FC = () => {
  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IntelligenceNavbar />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <Outlet /> {/* This will render the child routes */}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceCenter; 