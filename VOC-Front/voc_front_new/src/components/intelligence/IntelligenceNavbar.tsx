import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';

const IntelligenceNavbar: React.FC = () => {
  const navItems = [
    { label: 'ANALYZE', path: '/intelligence/analyze/report-items' },
    { label: 'PUBLISH', path: '/intelligence/publish' },
    { label: 'CONFIGURATION', path: '/intelligence/config' }
  ];

  return (
    <div className="intelligence-navbar bg-white dark:bg-dark-300 border-b border-gray-200 dark:border-dark-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => 
                  `px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                    isActive 
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 rounded-md bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceNavbar;
