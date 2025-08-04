import React from 'react';
import { Construction } from 'lucide-react';

const CTIPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Construction className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Section en construction</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
        La section Cyber Threat Intelligence est en cours de développement et sera disponible prochainement.
      </p>
    </div>
  );
};

export default CTIPage;