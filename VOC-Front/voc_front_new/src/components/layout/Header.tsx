import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Bell, Menu, Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-400 h-16 flex items-center justify-between px-4 lg:px-6 transition-colors duration-200 z-10">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      <div className="hidden md:flex space-x-1">
        <NavLink 
          to="/vi/vulnerabilities"
          className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200'
            }`
          }
        >
          Total CVEs
        </NavLink>
        <NavLink 
          to="/vi/critical"
          className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200'
            }`
          }
        >
          Critiques
        </NavLink>
        <NavLink 
          to="/vi/recent"
          className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200'
            }`
          }
        >
          Récents
        </NavLink>
        <NavLink 
          to="/vi/high-risk"
          className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200'
            }`
          }
        >
          Haut Risque
        </NavLink>
        <NavLink 
          to="/vi/with-exploit"
          className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200'
            }`
          }
        >
          Avec Exploit
        </NavLink>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/intelligence')}
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
        >
          <Brain className="h-4 w-4 mr-2" />
          Intelligence Center
        </button>
        <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200">
          <Search className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200">
          <Bell className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-dark-200"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;