import React, { useEffect } from 'react';
import VulnerabilityList from './VulnerabilityList';

const CriticalVulnerabilities: React.FC = () => {
  // Mettre à jour le titre de la page
  useEffect(() => {
    document.title = 'Vulnérabilités Critiques | VOC Platform';
    
    // Log pour le débogage
    console.log('Rendering CriticalVulnerabilities page');
  }, []);

  return <VulnerabilityList filterType="critical" />;
};

export default CriticalVulnerabilities;
