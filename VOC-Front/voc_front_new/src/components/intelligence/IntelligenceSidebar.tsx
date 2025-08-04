import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Grid, 
  Database, 
  Monitor, 
  List, 
  Share2, 
  Settings, 
  Tag, 
  FileText, 
  Key, 
  Share,
  Bot,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Building,
  UserCheck,
  Shield,
  Folder
} from 'lucide-react';

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

const IntelligenceSidebar: React.FC = () => {
  const mainNavItems = [
    { icon: <List className="h-5 w-5" />, label: 'ANALYZE', to: '/intelligence/analyze/report-items' },
    { icon: <Share className="h-5 w-5" />, label: 'PUBLISH', to: '/intelligence/publish' },
    { icon: <Settings className="h-5 w-5" />, label: 'CONFIGURATION', to: '/intelligence/config' },
  ];

  return (
    <div className="intelligence-sidebar">
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded intelligence-search"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="mt-2 mb-6">
        {mainNavItems.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </div>
      
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Configuration Categories
        </h3>
      </div>
      
      <div className="mt-1">
        <SidebarGroup icon={<Shield className="h-5 w-5" />} label="Access Control">
          <SidebarItem icon={<Users className="h-5 w-5" />} label="Users" to="/access-control/users" />
          <SidebarItem icon={<Building className="h-5 w-5" />} label="Organizations" to="/access-control/organizations" />
          <SidebarItem icon={<UserCheck className="h-5 w-5" />} label="Roles" to="/access-control/roles" />
          <SidebarItem icon={<Shield className="h-5 w-5" />} label="Access Control Lists" to="/access-control/acls" />
        </SidebarGroup>
        
        <SidebarGroup icon={<Database className="h-5 w-5" />} label="Data Collection">
          <SidebarItem icon={<Grid className="h-5 w-5" />} label="Collectors Nodes" to="/intelligence/collectors" />
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
          <SidebarItem icon={<FileText className="h-5 w-5" />} label="Report Types" to="/intelligence/report-types" />
          <SidebarItem icon={<List className="h-5 w-5" />} label="Word Lists" to="/intelligence/word-lists" />
        </SidebarGroup>
        
        <SidebarGroup icon={<Share className="h-5 w-5" />} label="Remote Systems">
          <SidebarItem icon={<Key className="h-5 w-5" />} label="Remote Access" to="/intelligence/remote-accesses" />
          <SidebarItem icon={<Share className="h-5 w-5" />} label="Remote Nodes" to="/intelligence/remote-nodes" />
        </SidebarGroup>
        
        <SidebarGroup icon={<Bot className="h-5 w-5" />} label="Automation">
          <SidebarItem icon={<Bot className="h-5 w-5" />} label="Bot Nodes" to="/intelligence/bots-nodes" />
          <SidebarItem icon={<Settings className="h-5 w-5" />} label="Bot Presets" to="/intelligence/bots-presets" />
        </SidebarGroup>
      </div>
    </div>
  );
};

export default IntelligenceSidebar;
