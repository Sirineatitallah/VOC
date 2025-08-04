import React from 'react';
import { ExternalLink } from '../icons';

interface EPSSScoreBadgeProps {
  score?: number;
  showLabel?: boolean;
  className?: string;
}

const EPSSScoreBadge: React.FC<EPSSScoreBadgeProps> = ({ 
  score, 
  showLabel = true,
  className = '' 
}) => {
  const formatEpssScore = (score?: number) => {
    if (score === undefined || score === null) return 'N/A';
    return `${(score * 100).toFixed(2)}%`;
  };
  
  const getBackgroundColor = (score?: number) => {
    if (score === undefined || score === null) return 'bg-gray-500';
    if (score > 0.3) return 'bg-red-600';
    if (score > 0.1) return 'bg-orange-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center justify-center w-16 h-8 rounded ${getBackgroundColor(score)} text-white font-bold text-sm`}>
          {formatEpssScore(score)}
        </span>
      </div>
      {showLabel && (
        <div className="ml-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Probability of exploitation activity in the next 30 days
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Percentile, the proportion of vulnerabilities that are scored at or less
          </div>
        </div>
      )}
    </div>
  );
};

export default EPSSScoreBadge;