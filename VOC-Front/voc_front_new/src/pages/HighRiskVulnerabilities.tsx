import React from 'react';
import VulnerabilityList from './VulnerabilityList';

const HighRiskVulnerabilities: React.FC = () => {
  // Utiliser le composant VulnerabilityList avec le type de filtre "high-risk"
  return (
    <VulnerabilityList filterType="high-risk" />
  );
};

export default HighRiskVulnerabilities;
