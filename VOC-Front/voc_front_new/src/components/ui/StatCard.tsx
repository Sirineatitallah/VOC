import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  href?: string;
  badge?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend = 0, href, badge }) => {
  const content = (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value.toLocaleString()}</p>
          
          {badge && (
            <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              {badge}
            </span>
          )}
        </div>
        {icon && <div>{icon}</div>}
      </div>
      
      {trend !== 0 && (
        <div className={`text-sm ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}% depuis le mois dernier
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default StatCard;
