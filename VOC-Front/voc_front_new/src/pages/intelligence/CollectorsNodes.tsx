import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollectors, deleteCollector, updateCollector, createCollector } from '../../utils/api';
import { Plus, RefreshCw, Edit, Trash, Link as LinkIcon } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CollectorDetailsModal from '../../components/intelligence/CollectorDetailsModal';

interface Collector {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_key: string;
  status?: 'active' | 'inactive' | 'error';
  last_run?: string;
}

const CollectorsNodes: React.FC = () => {
  const [collectorNodes, setCollectorNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      setLoading(true);
      const data = await getCollectors();
      // Filter to show only the 'Default Docker Collector'
      const defaultCollector = Array.isArray(data) ? data.filter(collector => collector.name === 'Default Docker Collector') : [];
      setCollectorNodes(defaultCollector);
      setError(null);
    } catch (err) {
      console.error('Error loading collectors:', err);
      setError('Failed to load collectors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCollectors();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collector?')) {
      try {
        await deleteCollector(id);
        loadCollectors();
      } catch (err) {
        console.error('Error deleting collector:', err);
        setError('Failed to delete collector. Please try again.');
      }
    }
  };

  const handleRowClick = (collector: Collector) => {
    setSelectedCollector(collector);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCollector({
      id: '',
      name: '',
      description: '',
      api_url: '',
      api_key: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCollector = async (node: any) => {
    const { id, name, description, api_url, api_key } = node;
    try {
      if (id) {
        await updateCollector(id, { name, description, api_url, api_key });
        setSuccessMessage('Collector updated successfully!');
      } else {
        await createCollector({ name, description, api_url, api_key });
        setSuccessMessage('Collector added successfully!');
      }
      setIsModalOpen(false);
      setSelectedCollector(null);
      loadCollectors();
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError('Failed to save collector node. Please try again.');
    }
  };

  return (
    <>
      {successMessage && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Collectors Nodes</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Manage your collectors nodes
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-600 dark:text-gray-300 transition-colors duration-200 ease-in-out"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors duration-200 ease-in-out"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400 transition-opacity duration-200 ease-in-out">
              {error}
            </div>
          ) : collectorNodes.length > 0 ? (
            <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden transition-shadow duration-200 ease-in-out">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                  <thead className="bg-gray-50 dark:bg-dark-300">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                    {collectorNodes.map((node) => (
                      <tr key={node.id} className="hover:bg-gray-100 dark:hover:bg-dark-300 cursor-pointer transition duration-150 ease-in-out" onClick={() => handleRowClick(node)}>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">
                          <div className="text-base font-medium text-gray-900 dark:text-white">
                            {node.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {node.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {node.api_url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={e => { e.stopPropagation(); handleDelete(node.id); }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 ease-in-out"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-dark-300 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No collectors found. Create your first collector to get started.</p>
              <Link 
                to="/intelligence/collectors/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Collector
              </Link>
            </div>
          )}
      <CollectorDetailsModal
        collector={selectedCollector}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCollector(null); }}
        onSave={handleSaveCollector}
      />
    </>
  );
};

export default CollectorsNodes;
