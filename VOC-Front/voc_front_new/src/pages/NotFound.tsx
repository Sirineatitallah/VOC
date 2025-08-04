import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <AlertTriangle className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Page non trouvée</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-6">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        to="/"
        className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
      >
        <Home className="h-4 w-4 mr-2" />
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;