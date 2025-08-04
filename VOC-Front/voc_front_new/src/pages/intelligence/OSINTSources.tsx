import React, { useState, useEffect } from 'react';
import { getOsintSources, deleteOSINTSource } from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Edit, Trash2, Plus, RefreshCw, Search, Trash } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Define interfaces based on the API response structure
interface CollectorInSource {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: any[]; // Simplified for now, can define full parameters interface if needed
}

interface OSINTSource {
  id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  group_name?: string;
  last_attempted?: string;
  last_collected?: string;
  collector: CollectorInSource; // Add the nested collector object
}

const OSINTSources: React.FC = () => {
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const navigate = useNavigate();

    const loadSources = async () => {
      try {
        setLoading(true);
        const data = await getOsintSources();
        setSources(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Failed to load OSINT sources. Please try again later.');
        console.error('Error loading OSINT sources:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSources();
  }, []);

  const handleRefresh = () => {
    loadSources();
  };
  
  const handleDelete = async (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this OSINT source?')) {
      try {
        await deleteOSINTSource(sourceId);
        loadSources(); // Refresh the list
        setSelectedSourceId(null); // Deselect
    } catch (err) {
        setError('Failed to delete OSINT source.');
        console.error('Error deleting OSINT source:', err);
      }
    }
  };

  const handleRowClick = (sourceId: string) => {
    if (selectedSourceId === sourceId) {
      navigate(`/intelligence/osint/${sourceId}/edit`);
    } else {
      setSelectedSourceId(sourceId);
    }
  };

  // Vérifier que sources est bien un tableau avant d'appliquer filter
  const filteredSources = Array.isArray(sources) 
    ? sources.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">OSINT Sources</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Manage your Open Source Intelligence sources
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-600 dark:text-gray-300 transition-colors duration-200 ease-in-out"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link 
            to="/intelligence/osint/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors duration-200 ease-in-out"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Source
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400 transition-opacity duration-200 ease-in-out">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="text-base font-semibold text-gray-700 dark:text-gray-300">OSINT Sources ({filteredSources.length})</div>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ease-in-out"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSources.length > 0 ? (
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden transition-shadow duration-200 ease-in-out">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last attempt</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last collected</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                {filteredSources.map((source) => (
                  <tr
                    key={source.id}
                    className={`cursor-pointer transition duration-150 ease-in-out ${selectedSourceId === source.id ? 'bg-primary-100 dark:bg-dark-400' : 'hover:bg-gray-100 dark:hover:bg-dark-300'}`}
                    onClick={() => handleRowClick(source.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">{source.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{source.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{source.last_attempted || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{source.last_collected || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{source.collector?.type || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {selectedSourceId === source.id && (
                        <div className="flex items-center justify-end space-x-2">
                           <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/intelligence/osint/${source.id}/edit`); }}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 ease-in-out"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(source.id); }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 ease-in-out"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-dark-300 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No OSINT sources found. Create your first source to get started.</p>
          <Link 
            to="/intelligence/osint/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Source
          </Link>
        </div>
      )}
    </>
  );
};

export default OSINTSources;
