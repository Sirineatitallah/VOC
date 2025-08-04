import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ApiErrorMessage: React.FC<ApiErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Erreur de connexion à l'API</h3>
      <p className="text-red-600 dark:text-red-300 text-center mb-4">{message}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
        Vérifiez que le serveur API est accessible à l'adresse <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://192.168.40.55:5000</code>
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      )}
    </div>
  );
};

export default ApiErrorMessage;