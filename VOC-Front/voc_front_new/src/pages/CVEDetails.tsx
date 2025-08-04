import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Vulnerability } from '../types';
import { ArrowLeft, AlertTriangle, ShieldCheck, Calendar, Link as LinkIcon, ExternalLink } from 'lucide-react';

const CVEDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vulnerability = location.state?.vulnerability as Vulnerability;

  if (!vulnerability) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
          Détails de la vulnérabilité non trouvés. Veuillez retourner à la liste.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la liste des vulnérabilités
      </button>
      
      <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-300 flex justify-between items-center">
          <div className="flex items-center">
            {vulnerability.has_poc && (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" title="Exploit disponible" />
            )}
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {vulnerability.cve_id} - {vulnerability.title || 'Sans titre'}
            </h1>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            vulnerability.severity === 'CRITICAL' 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
              : vulnerability.severity === 'HIGH'
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
              : vulnerability.severity === 'MEDIUM'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          }`}>
            {vulnerability.severity}
          </span>
        </div>
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{vulnerability.description || 'Aucune description disponible.'}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Détails</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <ShieldCheck className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 dark:text-gray-300">Score CVSS: {vulnerability.cvss_score?.toFixed(1) || '-'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 dark:text-gray-300">Publié le: {vulnerability.published_date ? new Date(vulnerability.published_date).toLocaleDateString() : '-'}</span>
            </div>
            {vulnerability.last_updated_at && (
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 dark:text-gray-300">Dernière modification: {new Date(vulnerability.last_updated_at).toLocaleDateString()}</span>
              </div>
            )}
            {vulnerability.source && (
              <div className="flex items-center space-x-4">
                <LinkIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 dark:text-gray-300">Source: {vulnerability.source}</span>
              </div>
            )}
            {vulnerability.vendor && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">Vendeur: {vulnerability.vendor}</span>
              </div>
            )}
            {vulnerability.product && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">Produit: {vulnerability.product}</span>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">KEV: {vulnerability.is_kev ? 'Oui' : 'Non'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">Exploit disponible: {vulnerability.has_poc ? 'Oui' : 'Non'}</span>
            </div>
            {vulnerability.epss_score !== undefined && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">EPSS Score: {(vulnerability.epss_score * 100).toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
        {vulnerability.taranis_link && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Lien Taranis</h2>
            <a 
              href={vulnerability.taranis_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {vulnerability.taranis_link} <ExternalLink className="inline w-3 h-3" />
            </a>
          </div>
        )}
        {vulnerability.cve_id && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Lien NVD</h2>
            <a 
              href={`https://nvd.nist.gov/vuln/detail/${vulnerability.cve_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voir sur NVD <ExternalLink className="inline w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVEDetails;
