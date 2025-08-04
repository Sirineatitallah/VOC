import React from 'react';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'in_progress' | 'resolved' | 'not_applicable';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  
  const statusClasses = {
    open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    not_applicable: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
  };
  
  const displayText = {
    open: 'Open',
    closed: 'Closed',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    not_applicable: 'N/A'
  };
  
  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {displayText[status]}
    </span>
  );
};

export default StatusBadge;
