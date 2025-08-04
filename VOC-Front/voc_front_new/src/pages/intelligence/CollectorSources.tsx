import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCollector, fetchCollectorSources } from '../../utils/api';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const CollectorSources: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collector, setCollector] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        
        const [collectorData, sourcesData] = await Promise.all([
          fetchCollector(id),
          fetchCollectorSources(id)
        ]);
        
        setCollector(collectorData);
        setSources(sourcesData || []);
      } catch (err) {
        setError('Failed to load collector sources.');
        console.error('Error loading collector sources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IntelligenceNavbar />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/intelligence/collectors')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {collector?.name || 'Collector'} Sources
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage OSINT sources for this collector
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {sources.length} source{sources.length !== 1 ? 's' : ''} configured
              </span>
            </div>
            <button
              onClick={() => navigate(`/intelligence/collectors/${id}/sources/add`)}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </button>
          </div>

          {sources.length > 0 ? (
            <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                <thead className="bg-gray-50 dark:bg-dark-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                  {sources.map((source) => (
                    <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-dark-300/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {source.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {source.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {source.group_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/intelligence/osint/${source.id}/edit`)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Handle delete */}}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-dark-300 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No sources configured for this collector yet.</p>
              <button
                onClick={() => navigate(`/intelligence/collectors/${id}/sources/add`)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Source
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorSources;