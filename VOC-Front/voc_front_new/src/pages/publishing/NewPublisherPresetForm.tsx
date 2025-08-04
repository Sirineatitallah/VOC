import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPublisherPreset, getAllPublishersNodes, PublisherNode, Publisher } from '../../utils/publishers';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const NewPublisherPresetForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [useForNotifications, setUseForNotifications] = useState(false);
  const [selectedPublisherNodeId, setSelectedPublisherNodeId] = useState<string | ''>('');
  const [selectedPublisherId, setSelectedPublisherId] = useState<string | ''>('');
  const [allPublishersNodes, setAllPublishersNodes] = useState<PublisherNode[]>([]);
  const [availablePublishers, setAvailablePublishers] = useState<Publisher[]>([]);
  const [parameterValues, setParameterValues] = useState<
    { parameter: { id: number; key: string; name: string; description: string; type: string; default_value: string; }; value: string; }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await getAllPublishersNodes();
        setAllPublishersNodes(response.items);
      } catch (err) {
        setError('Failed to load publishers nodes.');
        console.error('Error loading publishers nodes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, []);

  useEffect(() => {
    // Reset publishers and parameters when publisher node changes
    setSelectedPublisherId('');
    setParameterValues([]);
    const selectedNode = allPublishersNodes.find(node => node.id === selectedPublisherNodeId);
    if (selectedNode) {
      setAvailablePublishers(selectedNode.publishers || []);
    } else {
      setAvailablePublishers([]);
    }
  }, [selectedPublisherNodeId, allPublishersNodes]);

  useEffect(() => {
    // Reset parameters when publisher changes
    setParameterValues([]);
    const selectedNode = allPublishersNodes.find(node => node.id === selectedPublisherNodeId);
    const selectedPublisher = selectedNode?.publishers.find(pub => pub.id === selectedPublisherId);
    if (selectedPublisher) {
      setParameterValues(selectedPublisher.parameters.map(param => ({
        parameter: param,
        value: param.default_value || '',
      })));
    }
  }, [selectedPublisherId, selectedPublisherNodeId, allPublishersNodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!selectedPublisherId) {
      setError('Please select a Publisher.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        id: uuidv4(),
        title: name,
        subtitle: description,
        tag: "mdi-file-star-outline",
        name,
        description,
        use_for_notifications: useForNotifications,
        publisher_id: selectedPublisherId,
        parameter_values: parameterValues,
      };
      await createPublisherPreset(payload);
      navigate('/publishing/publishers-presets');
    } catch (err) {
      setError('Failed to create publisher preset. Please try again.');
      console.error('Error creating publisher preset:', err);
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
              onClick={() => navigate('/publishing/publishers-presets')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Add New Publisher Preset
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the details for the new publisher preset
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="publisherNode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publisher Node
                </label>
                <select
                  id="publisherNode"
                  value={selectedPublisherNodeId}
                  onChange={(e) => setSelectedPublisherNodeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a Publisher Node</option>
                  {allPublishersNodes.map(node => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
                </select>
              </div>

              {selectedPublisherNodeId && availablePublishers.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publisher
                  </label>
                  <select
                    id="publisher"
                    value={selectedPublisherId}
                    onChange={(e) => setSelectedPublisherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a Publisher</option>
                    {availablePublishers.map(publisher => (
                      <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPublisherId && parameterValues.length > 0 && (
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

              <div className="flex items-center mt-4">
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

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/publishing/publishers-presets')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Publisher Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPublisherPresetForm; 