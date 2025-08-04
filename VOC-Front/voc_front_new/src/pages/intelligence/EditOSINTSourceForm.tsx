import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getCollectors, 
  getOsintSourceGroups, 
  fetchWordLists, 
  updateOSINTSource,
  getOsintSources
} from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

// Interfaces (identiques au formulaire de création pour la cohérence)
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
}

interface OSINTSourceGroup {
  id: string;
  name: string;
}

interface WordList {
  id: string;
  name: string;
}

const EditOSINTSourceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // State
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
    const loadInitialData = async () => {
      if (!id) {
        setError("Source ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Charger toutes les données, mais récupérer toutes les sources au lieu d'une seule
        const [allSources, collectorsResponse, groupsData, wordlistsData] = await Promise.all([
          getOsintSources(), // On récupère toute la liste
          getCollectors(),
          getOsintSourceGroups(),
          fetchWordLists()
        ]);
        
        // Trouver la source spécifique dans la liste
        const sourceData = allSources.find((s: any) => s.id === id);
        if (!sourceData) {
          setError(`Error: Could not find OSINT Source with ID ${id}.`);
          setLoading(false);
          return;
        }

        // 1. Configurer les collecteurs
        if (Array.isArray(collectorsResponse)) {
            const defaultCollectors = collectorsResponse.filter(c => c.name === 'Default Docker Collector');
            setCollectors(defaultCollectors);
        } else {
            setCollectors([]);
        }

        // 2. Configurer les groupes et listes de mots
        setGroups(groupsData?.items || (Array.isArray(groupsData) ? groupsData : []));
        setWordlists(wordlistsData?.items || []);

        // 3. Pré-remplir le formulaire avec les données de la source
        setName(sourceData.name || '');
        setDescription(sourceData.description || '');
        setSelectedGroups(sourceData.osint_source_groups?.map((g: any) => g.id) || []);
        setSelectedWordlists(sourceData.word_lists?.map((w: any) => w.id) || []);

        // 4. Trouver et définir le collecteur et le sous-collecteur
        let collectorNodeId = '';
        let subCollectorId = '';

        if (sourceData.collector?.id) {
          subCollectorId = sourceData.collector.id;
          for (const node of collectorsResponse) {
            if (node.collectors.some((sc: SubCollector) => sc.id === subCollectorId)) {
              collectorNodeId = node.id;
              break;
            }
          }
        }
        
        setSelectedCollectorNode(collectorNodeId);
        setSelectedSubCollector(subCollectorId);

        // 5. Pré-remplir les valeurs des paramètres
        const initialParams: { [key: string]: string } = {};
        if (sourceData.parameter_values) {
          sourceData.parameter_values.forEach((pv: any) => {
            if (pv.parameter) {
              initialParams[pv.parameter.key] = pv.value;
            }
          });
        }
        setParameterValues(initialParams);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load source data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

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
    if (!id || !selectedSubCollector) {
      setError('A collector type must be selected.');
      return;
    }

    const subCollector = getCurrentSubCollector();
    if (!subCollector) {
      setError('Could not find selected collector details.');
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
        osint_source_groups: selectedGroups.map(gid => ({ id: gid })),
        word_lists: selectedWordlists.map(wid => ({ id: wid }))
      };
      
      console.log('Updating OSINT source with payload:', payload);
      await updateOSINTSource(id, payload);
      navigate('/intelligence/osint');
    } catch (err) {
      setError('Failed to update OSINT source.');
      console.error('Error updating OSINT source:', err);
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

  const subCollector = getCurrentSubCollector();

  // Le JSX est très similaire à celui de NewOSINTSourceForm
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
            Edit OSINT Source
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update the details of this OSINT source
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
          {/* Les champs sont les mêmes que dans NewOSINTSourceForm, mais pré-remplis */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collector Node</label>
            <select 
              value={selectedCollectorNode} 
              onChange={e => setSelectedCollectorNode(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled
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
                disabled
              >
                <option value="">Select a collector type</option>
                {collectors
                  .find(c => c.id === selectedCollectorNode)
                  ?.collectors.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
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

              {subCollector?.parameters && subCollector.parameters.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Parameters</h2>
                  {subCollector.parameters.map(param => (
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

          <div className="flex justify-end space-x-3 mt-8">
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
            </form>
      </div>
    </div>
  );
};

export default EditOSINTSourceForm;
