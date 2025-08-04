import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  type = 'text',
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-dark-300 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-300 dark:via-dark-200 dark:to-dark-300 bg-[length:400%_100%]';
  
  switch (type) {
    case 'circle':
      return <div className={`${baseClasses} rounded-full ${width} ${height} ${className}`}></div>;
    case 'rectangle':
      return <div className={`${baseClasses} rounded-md ${width} ${height} ${className}`}></div>;
    case 'text':
    default:
      return <div className={`${baseClasses} rounded ${width} ${height} ${className}`}></div>;
  }
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="card animate-fade-in overflow-hidden">
      <div className="p-4 space-y-4">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array(columns).fill(0).map((_, colIndex) => (
              <SkeletonLoader 
                key={colIndex} 
                width={colIndex === 0 ? 'w-1/6' : 'w-1/4'} 
                className="mb-0"
                style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;