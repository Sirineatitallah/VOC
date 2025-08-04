import React from 'react';
import VulnerabilityList from './VulnerabilityList';

const RecentVulnerabilities: React.FC = () => {
  return <VulnerabilityList filterType="recent" />;
};

export default RecentVulnerabilities;