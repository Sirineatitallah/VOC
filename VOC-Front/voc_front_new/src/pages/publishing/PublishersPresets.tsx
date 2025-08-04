import React, { useEffect, useState } from 'react';
import { getAllPublishersPresets, PublisherPreset, updatePublisherPreset, getAllPublishersNodes, PublisherNode, deletePublisherPreset } from '../../utils/publishers';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Settings, Save, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditPublisherPresetModalProps {
  preset: PublisherPreset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPreset: PublisherPreset) => void;
  allPublishersNodes: PublisherNode[];
}

const EditPublisherPresetModal: React.FC<EditPublisherPresetModalProps> = ({
  preset,
  isOpen,
  onClose,
  onSave,
  allPublishersNodes,
}) => {
  const [name, setName] = useState(preset?.name || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [useForNotifications, setUseForNotifications] = useState(preset?.use_for_notifications || false);
  const [parameterValues, setParameterValues] = useState<
    { parameter: { id: number; key: string; name: string; description: string; type: string; default_value: string; }; value: string; }[]
  >(preset?.parameter_values || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preset) {
      setName(preset.name);
      setDescription(preset.description);
      setUseForNotifications(preset.use_for_notifications);
      // Deep copy parameter_values to ensure independent state
      setParameterValues(JSON.parse(JSON.stringify(preset.parameter_values)));
    }
  }, [preset]);

  if (!isOpen || !preset) return null;

  const foundPublisherNode = allPublishersNodes.find(node =>
    node.publishers.some(publisher => publisher.id === preset.publisher_id)
  );
  const foundPublisher = foundPublisherNode?.publishers.find(publisher => publisher.id === preset.publisher_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const updatedPresetData: Partial<PublisherPreset> = {
        name,
        description,
        use_for_notifications: useForNotifications,
        parameter_values: parameterValues,
      };
      const updatedPreset = await updatePublisherPreset(preset.id, updatedPresetData);
      onSave(updatedPreset);
      onClose();
    } catch (err) {
      setError('Failed to save publisher preset.');
      console.error('Error saving publisher preset:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleParameterChange = (paramId: number, value: string) => {
    setParameterValues(prevParams =>
      prevParams.map(pv =>
        pv.parameter.id === paramId ? { ...pv, value: value } : pv
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-600 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Edit publisher preset</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'SAVE'}
            </button>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="pb-4 border-b border-dotted border-gray-200 dark:border-dark-500">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Publishers Node</p>
            <p className="text-base text-gray-900 dark:text-white">{foundPublisherNode?.name || 'N/A'}</p>
          </div>

          <div className="pb-4 border-b border-dotted border-gray-200 dark:border-dark-500">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Publisher</p>
            <p className="text-base text-gray-900 dark:text-white">{foundPublisher?.name || 'N/A'}</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="flex items-center pt-4 border-t border-dotted border-gray-200 dark:border-dark-500">
            <input
              type="checkbox"
              id="useForNotifications"
              checked={useForNotifications}
              onChange={(e) => setUseForNotifications(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="useForNotifications" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Use for all global notifications
            </label>
          </div>

          {parameterValues.length > 0 && (
            <div className="pt-4 border-t border-dotted border-gray-200 dark:border-dark-500 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publisher specific parameters</h3>
              {parameterValues.map((paramValue) => (
                <div key={paramValue.parameter.id}>
                  <label htmlFor={`param-${paramValue.parameter.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {paramValue.parameter.name}
                  </label>
                  <input
                    type="text"
                    id={`param-${paramValue.parameter.id}`}
                    value={paramValue.value}
                    onChange={(e) => handleParameterChange(paramValue.parameter.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{paramValue.parameter.description}</p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const PublishersPresets: React.FC = () => {
  const [publishersPresets, setPublishersPresets] = useState<PublisherPreset[]>([]);
  const [allPublishersNodes, setAllPublishersNodes] = useState<PublisherNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PublisherPreset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishersData = async () => {
      try {
        const presetsResponse = await getAllPublishersPresets();
        setPublishersPresets(presetsResponse.items);
        const nodesResponse = await getAllPublishersNodes();
        setAllPublishersNodes(nodesResponse.items);
      } catch (err) {
        setError('Failed to load publishers data');
        console.error('Error loading publishers data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishersData();
  }, []);

  const handleSavePreset = (updatedPreset: PublisherPreset) => {
    setPublishersPresets(prevPresets =>
      prevPresets.map(preset => (preset.id === updatedPreset.id ? updatedPreset : preset))
    );
  };

  const handleDeletePreset = async (presetId: string) => {
    if (window.confirm('Are you sure you want to delete this publisher preset?')) {
      try {
        await deletePublisherPreset(presetId);
        setPublishersPresets(prevPresets => prevPresets.filter(preset => preset.id !== presetId));
      } catch (err) {
        setError('Failed to delete publisher preset.');
        console.error('Error deleting publisher preset:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="intelligence-container">
        <IntelligenceSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <IntelligenceNavbar />
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intelligence-container">
        <IntelligenceSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <IntelligenceNavbar />
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IntelligenceNavbar />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Presets</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your publisher presets and their configurations</p>
              </div>
            </div>
            {/* Add New Button for Presets */}
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              onClick={() => navigate('/publishing/publishers-presets/new')}
            >
              <Plus className="h-4 w-4 mr-1" /> ADD NEW
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishersPresets.map((preset) => (
              <div
                key={preset.id}
                className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-400 hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                      onClick={() => navigate(`/publishing/publishers-presets/${preset.id}`)}
                    >
                      {preset.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        {preset.parameter_values.length} Parameters
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click from firing
                          handleDeletePreset(preset.id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-500 text-red-600 dark:text-red-400"
                        title="Delete Preset"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    {preset.description || 'No description available'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-4">
                      Use for Notifications: {preset.use_for_notifications ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishersPresets; 