import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, BarChart2, Radio, Layers, Settings, HelpCircle, Activity, Shield, Database, Monitor, Share2, FileText, Bot, Users, Building, UserCheck, ChevronDown, ChevronRight, Folder, List, Tag, Key, Share } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

interface SidebarGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm transition-colors duration-200 ${
        isActive
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-200 dark:hover:text-gray-200'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    <span className="text-sm">{label}</span>
  </NavLink>
);

const SidebarGroup: React.FC<SidebarGroupProps> = ({ icon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-200 transition-colors duration-200"
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="pl-4 border-l border-gray-200 dark:border-dark-200 ml-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Définition des éléments de la barre latérale
const sidebarItems = [
  {
    path: '/vi',
    label: 'Vulnerability Intelligence',
    icon: <ShieldAlert className="h-5 w-5" />
  },
  {
    path: '/cti',
    label: 'Cyber Threat Intelligence',
    icon: <Activity className="h-5 w-5" />
  },
  {
    path: '/asm',
    label: 'Attack Surface Management',
    icon: <Layers className="h-5 w-5" />
  }
];

// Définition des outils de la barre latérale
const toolItems = [
  {
    path: '/analytics',
    label: 'Analytiques',
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    path: '/settings',
    label: 'Paramètres',
    icon: <Settings className="h-5 w-5" />
  }
];

// Définition des éléments du bas de la barre latérale
const bottomItems = [
  {
    path: '/help',
    label: 'Aide',
    icon: <HelpCircle className="h-5 w-5" />
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`fixed left-0 h-full bg-white dark:bg-dark-300 shadow-lg transition-all duration-300 z-20 ${
        isOpen ? 'w-64' : 'w-16'
      } border-r border-gray-200 dark:border-dark-400`}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-dark-400">
        <button 
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-6 px-2">
        <div className={`mb-6 ${isOpen ? 'px-4' : 'px-0 flex justify-center'}`}>
          <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${!isOpen && 'sr-only'}`}>
            Menu principal
          </h3>
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={item.path} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-in-left">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  }
                >
                  {item.icon}
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={`mb-6 ${isOpen ? 'px-4' : 'px-0 flex justify-center'}`}>
          <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${!isOpen && 'sr-only'}`}>
            Outils
          </h3>
          <ul className="space-y-1">
            {toolItems.map((item, index) => (
              <li key={item.path} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-in-left">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  }
                >
                  {item.icon}
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* <div className={`mb-6 ${isOpen ? 'px-4' : 'px-0 flex justify-center'}`}>
          <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${!isOpen && 'sr-only'}`}>
            CONFIGURATION CATEGORIES
          </h3>
          <ul className="space-y-1">
            <SidebarGroup icon={<Shield className="h-5 w-5" />} label="Access Control">
              <SidebarItem icon={<Users className="h-5 w-5" />} label="Users" to="/access-control/users" />
              <SidebarItem icon={<Building className="h-5 w-5" />} label="Organizations" to="/access-control/organizations" />
              <SidebarItem icon={<UserCheck className="h-5 w-5" />} label="Roles" to="/intelligence/config/roles" />
              <SidebarItem icon={<Shield className="h-5 w-5" />} label="Access Control Lists" to="/intelligence/config/acl" />
            </SidebarGroup>

            <SidebarGroup icon={<Database className="h-5 w-5" />} label="Data Collection">
              <SidebarItem icon={<Users className="h-5 w-5" />} label="Collectors Nodes" to="/intelligence/collectors" />
              <SidebarItem icon={<Database className="h-5 w-5" />} label="OSINT Sources" to="/intelligence/osint" />
              <SidebarItem icon={<Folder className="h-5 w-5" />} label="OSINT Source Groups" to="/intelligence/source-groups" />
            </SidebarGroup>

            <SidebarGroup icon={<Monitor className="h-5 w-5" />} label="Data Presentation">
              <SidebarItem icon={<Monitor className="h-5 w-5" />} label="Presenters Nodes" to="/data-presentation/presenters-nodes" />
              <SidebarItem icon={<List className="h-5 w-5" />} label="Product Types" to="/data-presentation/product-types" />
            </SidebarGroup>

            <SidebarGroup icon={<Share2 className="h-5 w-5" />} label="Publishing">
              <SidebarItem icon={<Share2 className="h-5 w-5" />} label="Publishers Nodes" to="/publishing/publishers-nodes" />
              <SidebarItem icon={<Settings className="h-5 w-5" />} label="Publisher Presets" to="/publishing/publishers-presets" />
            </SidebarGroup>

            <SidebarGroup icon={<FileText className="h-5 w-5" />} label="Content Management">
              <SidebarItem icon={<Tag className="h-5 w-5" />} label="Attributes" to="/intelligence/attributes" />
              <SidebarItem icon={<Bot className="h-5 w-5" />} label="Feeds" to="/intelligence/feeds" />
            </SidebarGroup>

            <SidebarGroup icon={<Share className="h-5 w-5" />} label="Remote Systems">
              <SidebarItem icon={<Settings className="h-5 w-5" />} label="Remote Systems" to="/remote-systems/remote-systems" />
              <SidebarItem icon={<Key className="h-5 w-5" />} label="API Keys" to="/remote-systems/api-keys" />
            </SidebarGroup>

            <SidebarGroup icon={<Bot className="h-5 w-5" />} label="Automation">
              <SidebarItem icon={<Bot className="h-5 w-5" />} label="Automations" to="/intelligence/automations" />
              <SidebarItem icon={<Activity className="h-5 w-5" />} label="Automation Logs" to="/intelligence/automation-logs" />
            </SidebarGroup>
          </ul>
        </div> */}

        <div className={`absolute bottom-8 w-full ${isOpen ? 'px-4' : 'px-0 flex justify-center'} left-0`}>
          <ul className="space-y-1">
            {bottomItems.map((item, index) => (
              <li key={item.path} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-in-left">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  }
                >
                  {item.icon}
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
