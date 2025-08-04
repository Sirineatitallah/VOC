import React from 'react';
import { 
  Database, 
  Grid, 
  Share2, 
  Bot, 
  FileText, 
  Users, 
  Folder, 
  Monitor, 
  Settings, 
  List, 
  Tag, 
  Key, 
  Share,
  Shield,
  Building,
  UserCheck,
  BarChart2,
  PieChart,
  LineChart,
  Activity,
  Zap,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import IntelligenceNavbar from '../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../components/intelligence/IntelligenceSidebar';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, change, icon, trend }) => (
  <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-300 p-5">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      </div>
      <div className="p-2 rounded-lg bg-gray-50 dark:bg-dark-300 text-primary-500 dark:text-primary-400">
        {icon}
      </div>
    </div>
    <div className={`mt-4 flex items-center text-sm ${
      trend === 'up' ? 'text-green-600 dark:text-green-400' : 
      trend === 'down' ? 'text-red-600 dark:text-red-400' : 
      'text-gray-500 dark:text-gray-400'
    }`}>
      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
    </div>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, to }) => (
  <Link 
    to={to}
    className="bg-white dark:bg-dark-200 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-300 p-5 hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex items-start">
      <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400 mr-4">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </Link>
);

// New component for Intelligence Dashboard content
const IntelligenceDashboardContent: React.FC = () => {
  const analyticsData = [
    { 
      title: "Active Sources", 
      value: 128, 
      change: "12% from last month", 
      icon: <Database className="h-5 w-5" />, 
      trend: "up" as const 
    },
    { 
      title: "Intelligence Reports", 
      value: 842, 
      change: "8% from last month", 
      icon: <FileText className="h-5 w-5" />, 
      trend: "up" as const 
    },
    { 
      title: "Automated Tasks", 
      value: 267, 
      change: "3% from last month", 
      icon: <Bot className="h-5 w-5" />, 
      trend: "up" as const 
    },
    { 
      title: "System Alerts", 
      value: 12, 
      change: "5 new alerts today", 
      icon: <AlertTriangle className="h-5 w-5" />, 
      trend: "neutral" as const 
    }
  ];

  const quickActions = [
    {
      title: "Configure New Source",
      description: "Add and configure a new intelligence source",
      icon: <Database className="h-5 w-5" />,
      to: "/intelligence/osint/new"
    },
    {
      title: "Create Report",
      description: "Generate a new intelligence report",
      icon: <FileText className="h-5 w-5" />,
      to: "/intelligence/reports/new"
    },
    {
      title: "Manage Users",
      description: "Add or modify user access permissions",
      icon: <Users className="h-5 w-5" />,
      to: "/access-control/users"
    },
    {
      title: "View Analytics",
      description: "See detailed intelligence analytics",
      icon: <BarChart2 className="h-5 w-5" />,
      to: "/intelligence/analytics"
    },
    {
      title: "Configure Automation",
      description: "Set up automated intelligence tasks",
      icon: <Bot className="h-5 w-5" />,
      to: "/intelligence/bots"
    },
    {
      title: "System Health",
      description: "Check the status of all system components",
      icon: <Activity className="h-5 w-5" />,
      to: "/intelligence/system-health"
    }
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Intelligence Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure and manage your intelligence gathering and analysis infrastructure
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsData.map((item, index) => (
            <AnalyticsCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <ActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-300">
          <div className="p-4 border-b border-gray-200 dark:border-dark-300 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">System Activity Log</h3>
            <div className="flex space-x-2">
              <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-300">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-300">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          {/* Recent Activity content (placeholder for now) */}
          <div className="p-4 text-gray-500 dark:text-gray-400">
            No recent activity to display.
          </div>
        </div>
      </div>
    </>
  );
};

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
export { IntelligenceDashboardContent };
