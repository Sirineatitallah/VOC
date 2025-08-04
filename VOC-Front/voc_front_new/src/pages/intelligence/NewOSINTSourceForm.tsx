import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollectors, getOsintSourceGroups, fetchWordLists, createOSINTSource } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

interface CollectorParameter {
  id: number;
  key: string;
  name: string;
  type: string;
  description: string;
  default_value: string;
}

interface SubCollector {
  id: string;
  type: string;
  name: string;
  description: string;
  parameters: CollectorParameter[];
}

interface Collector {
  id: string;
  name: string;
  description: string;
  collectors: SubCollector[];
  api_url: string;
  api_key: string;
  tag: string;
  status: string;
}

interface OSINTSourceGroup {
  id: string;
  name: string;
  description: string;
}

interface WordList {
  id: string;
  name: string;
  description: string;
}

const NewOSINTSourceForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollectorNode, setSelectedCollectorNode] = useState<string>('');
  const [selectedSubCollector, setSelectedSubCollector] = useState<string>('');
  const [parameterValues, setParameterValues] = useState<{ [key: string]: string }>({});
  const [groups, setGroups] = useState<OSINTSourceGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [wordlists, setWordlists] = useState<WordList[]>([]);
  const [selectedWordlists, setSelectedWordlists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const collectorsResponse = await getCollectors();
        console.log('Collectors response:', collectorsResponse);
        
        // Filtrer pour ne garder que le Default Docker Collector
        if (Array.isArray(collectorsResponse)) {
          const defaultCollector = collectorsResponse.filter(c => c.name === 'Default Docker Collector');
          setCollectors(defaultCollector);
        } else {
          console.error('Invalid collectors data format:', collectorsResponse);
          setCollectors([]);
        }

      try {
          const groupsData = await getOsintSourceGroups();
          console.log('Groups data:', groupsData);
          if (groupsData?.items) {
            setGroups(groupsData.items);
          } else if (Array.isArray(groupsData)) {
            setGroups(groupsData);
          } else {
            console.error('Invalid groups data format:', groupsData);
            setGroups([]);
          }
        } catch (groupErr) {
          console.error('Error loading groups:', groupErr);
          setGroups([]);
        }

        try {
          const wordlistsData = await fetchWordLists();
          console.log('Wordlists data:', wordlistsData);
          setWordlists(wordlistsData?.items || []);
        } catch (wordlistErr) {
          console.error('Error loading wordlists:', wordlistErr);
          setWordlists([]);
        }

      } catch (err) {
        console.error('Error loading collectors:', err);
        setError(err instanceof Error ? err.message : 'Failed to load collectors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset sub-collector when main collector changes
  useEffect(() => {
    setSelectedSubCollector('');
    setParameterValues({});
  }, [selectedCollectorNode]);

  // Reset parameters when sub-collector changes
  useEffect(() => {
    if (!selectedSubCollector) {
      setParameterValues({});
      return;
    }

    const collector = collectors.find(c => c.id === selectedCollectorNode);
    const subCollector = collector?.collectors.find(sc => sc.id === selectedSubCollector);

    if (subCollector) {
      const defaults: { [key: string]: string } = {};
      subCollector.parameters?.forEach(param => {
        defaults[param.key] = param.default_value || '';
      });
      setParameterValues(defaults);
    }
  }, [selectedSubCollector, selectedCollectorNode, collectors]);

  const handleParameterChange = (key: string, value: string) => {
    setParameterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleGroupChange = (id: string, checked: boolean) => {
    setSelectedGroups(prev => checked ? [...prev, id] : prev.filter(gid => gid !== id));
  };

  const handleWordlistChange = (id: string, checked: boolean) => {
    setSelectedWordlists(prev => checked ? [...prev, id] : prev.filter(wid => wid !== id));
  };

  const getCurrentSubCollector = () => {
    const collector = collectors.find(c => c.id === selectedCollectorNode);
    return collector?.collectors.find(sc => sc.id === selectedSubCollector);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectorNode || !selectedSubCollector) {
      setError('Please select both a collector node and a collector type.');
      return;
    }

    const subCollector = getCurrentSubCollector();
    if (!subCollector) {
      setError('Selected collector type not found.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name, 
        description, 
        collector_id: selectedSubCollector,
        parameter_values: subCollector.parameters.map(param => ({
          parameter: param,
          value: parameterValues[param.key] || ''
        })),
        osint_source_groups: selectedGroups.map(id => ({ id })),
        word_lists: selectedWordlists.map(id => ({ id }))
      };
      console.log('Creating OSINT source with payload:', payload);
      await createOSINTSource(payload);
      navigate('/intelligence/osint');
    } catch (err) {
      setError('Failed to create OSINT source.');
      console.error('Error creating OSINT source:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
              onClick={() => navigate('/intelligence/osint')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Add New OSINT Source
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
            Create a new OSINT source for intelligence gathering
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
                {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collector Node</label>
            <select 
              value={selectedCollectorNode} 
              onChange={e => setSelectedCollectorNode(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a collector node</option>
              {collectors.map(collector => (
                <option key={collector.id} value={collector.id}>
                  {collector.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCollectorNode && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collector Type</label>
              <select
                value={selectedSubCollector}
                onChange={e => setSelectedSubCollector(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a collector type</option>
                {collectors
                  .find(c => c.id === selectedCollectorNode)
                  ?.collectors.map(subCollector => (
                    <option key={subCollector.id} value={subCollector.id}>
                      {subCollector.name}
                    </option>
                  ))}
              </select>
              </div>
            )}
            
          {selectedSubCollector && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)} 
                  rows={3} 
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              {getCurrentSubCollector()?.parameters && getCurrentSubCollector()?.parameters.length > 0 && (
              <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Parameters</h2>
                  {getCurrentSubCollector()?.parameters.map(param => (
                    <div key={param.key} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {param.name}
                        {param.description && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{param.description}</span>
                        )}
                </label>
                      <input
                        type={param.type === 'NUMBER' ? 'number' : 'text'}
                        value={parameterValues[param.key] || ''}
                        onChange={e => handleParameterChange(param.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
              </div>
              )}
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">OSINT Source Groups</h2>
                <div className="flex flex-col space-y-2">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center">
                <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={e => handleGroupChange(group.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Word Lists</h2>
                <div className="flex flex-col space-y-2">
                  {wordlists.map(wordlist => (
                    <label key={wordlist.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedWordlists.includes(wordlist.id)}
                        onChange={e => handleWordlistChange(wordlist.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{wordlist.name}</span>
                </label>
                  ))}
                </div>
              </div>
            </>
          )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/intelligence/osint')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
              disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
              disabled={submitting || !selectedSubCollector}
                >
              {submitting ? 'Creating...' : 'Create Source'}
                </button>
              </div>
            </form>
      </div>
    </div>
  );
};

export default NewOSINTSourceForm;
