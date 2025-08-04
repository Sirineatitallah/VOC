import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  tools?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', tools }) => {
  return (
    <div className={`card animate-fade-in ${className}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-dark-300 animate-slide-in-down">
        <h3 className="font-medium">{title}</h3>
        {tools && (
          <div className="flex space-x-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {tools}
          </div>
        )}
      </div>
      <div className="p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
