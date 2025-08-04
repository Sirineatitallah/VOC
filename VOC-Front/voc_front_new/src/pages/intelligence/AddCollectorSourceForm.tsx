import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCollector, fetchAllOSINTSources, addSourceToCollector } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Search } from 'lucide-react';

interface OSINTSource {
  id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  group_name?: string;
}

const AddCollectorSourceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [collector, setCollector] = useState<any>(null);
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        
        const [collectorData, sourcesData] = await Promise.all([
          fetchCollector(id),
          fetchAllOSINTSources()
        ]);
        
        setCollector(collectorData);
        setSources(sourcesData || []);
      } catch (err) {
        setError('Failed to load data.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || selectedSources.length === 0) return;
    
    try {
      setSaving(true);
      await addSourceToCollector(id, selectedSources);
      navigate(`/intelligence/collectors/${id}/sources`);
    } catch (err) {
      setError('Failed to add sources to collector. Please try again.');
      console.error('Error adding sources:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const filteredSources = sources.filter(source => 
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(`/intelligence/collectors/${id}/sources`)}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Add Sources to {collector?.name || 'Collector'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Select OSINT sources to add to this collector
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                  <thead className="bg-gray-50 dark:bg-dark-300">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Group
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                    {filteredSources.length > 0 ? (
                      filteredSources.map((source) => (
                        <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-dark-300">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedSources.includes(source.id)}
                              onChange={() => toggleSourceSelection(source.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{source.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{source.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {source.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {source.group_name || 'None'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No sources found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/intelligence/collectors/${id}/sources`)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || selectedSources.length === 0}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Selected Sources'}
              </button>
            </div>
          </form>
    </div>
  );
};

export default AddCollectorSourceForm;