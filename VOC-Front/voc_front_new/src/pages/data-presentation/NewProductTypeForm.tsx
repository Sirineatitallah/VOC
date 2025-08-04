import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPresentersNodes, createProductType, ProductTypeParameter, PresenterNode, ProductTypeBackend } from '../../utils/presenters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';

interface Presenter {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: ProductTypeParameter[];
}

const NewProductTypeForm: React.FC = () => {
  const [presenterNodes, setPresenterNodes] = useState<PresenterNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [selectedPresenterId, setSelectedPresenterId] = useState('');
  const [selectedPresenter, setSelectedPresenter] = useState<Presenter | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [parameterValues, setParameterValues] = useState<{ [key: string]: string }>({});
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Charger les presenter nodes au montage
  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      try {
        const res = await getAllPresentersNodes();
        setPresenterNodes(res.data.items || []);
      } catch (err) {
        setError('Failed to load presenter nodes.');
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, []);

  // Mettre à jour la liste des presenters quand un node est sélectionné
  useEffect(() => {
    if (!selectedNodeId) {
      setPresenters([]);
      setSelectedPresenterId('');
      setSelectedPresenter(null);
      return;
    }
    const node = presenterNodes.find(n => n.id === selectedNodeId);
    // On suppose que chaque node a une propriété presenters (array)
    // Si ce n'est pas le cas, il faudra adapter ici
    // @ts-ignore
    setPresenters(node?.presenters || []);
    setSelectedPresenterId('');
    setSelectedPresenter(null);
  }, [selectedNodeId, presenterNodes]);

  // Mettre à jour le presenter sélectionné
  useEffect(() => {
    if (!selectedPresenterId) {
      setSelectedPresenter(null);
      setSelectedType('');
      return;
    }
    const presenter = presenters.find(p => p.id === selectedPresenterId) || null;
    setSelectedPresenter(presenter);
    setSelectedType(presenter?.type || '');
    // Réinitialiser les valeurs des paramètres
    if (presenter && presenter.parameters) {
      const initialParams: { [key: string]: string } = {};
      presenter.parameters.forEach(param => {
        initialParams[param.key] = param.default_value || '';
      });
      setParameterValues(initialParams);
    } else {
      setParameterValues({});
    }
  }, [selectedPresenterId, presenters]);

  // Gestion du changement de valeur d'un paramètre dynamique
  const handleParameterChange = (key: string, value: string) => {
    setParameterValues(prev => ({ ...prev, [key]: value }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId || !selectedPresenterId) {
      setError('Please select a presenter node and a presenter type.');
      return;
    }
    if (!title) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Construction du payload strictement conforme à l'API
      const payload: ProductTypeBackend = {
        id: 9999, // ID temporaire, number
        title,
        subtitle,
        tag,
        description,
        presenter_id: selectedPresenterId,
        parameter_values: (selectedPresenter?.parameters || []).map(param => ({
          parameter: {
            id: param.id,
            key: param.key,
            name: param.name,
            description: param.description,
            type: param.type,
          },
          value: parameterValues[param.key] || '',
        })),
      };
      await createProductType(payload);
      navigate('/data-presentation/product-types');
    } catch (err) {
      setError('Failed to create product type.');
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
    <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'}`}>  
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Product Type</h1>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Sélection du presenter node */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presenter Node</label>
            <select
              value={selectedNodeId}
              onChange={e => setSelectedNodeId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a presenter node</option>
              {presenterNodes.map(node => (
                <option key={node.id} value={node.id}>{node.name}</option>
              ))}
            </select>
          </div>

          {/* Sélection du presenter/type */}
          {presenters.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presenter Type</label>
              <select
                value={selectedPresenterId}
                onChange={e => setSelectedPresenterId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a presenter type</option>
                {presenters.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          )}

          {/* Champs génériques */}
          {selectedPresenter && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag</label>
                <input
                  type="text"
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Champs dynamiques des paramètres */}
              {selectedPresenter.parameters && selectedPresenter.parameters.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Parameters</h2>
                  {selectedPresenter.parameters.map(param => (
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
                        placeholder={param.default_value}
                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/data-presentation/product-types')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
              disabled={submitting || !selectedPresenter}
            >
              {submitting ? 'Creating...' : 'Create Product Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductTypeForm; 