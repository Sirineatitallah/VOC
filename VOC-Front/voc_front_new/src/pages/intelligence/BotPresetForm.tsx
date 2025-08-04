import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { fetchBotNodes, fetchBotNodesFull, createBotPreset, updateBotPreset, fetchBotPresets } from '../../utils/api';

interface BotParameter {
  id: number;
  key: string;
  name: string;
  type: string;
  description: string;
  default_value?: string;
  required?: boolean;
}

interface BotType {
  type: string;
  name: string;
  description: string;
  parameters: BotParameter[];
}

interface BotNode {
  id: string;
  name: string;
  description: string;
  title?: string;
}

interface BotNodeFull {
  id: string;
  title: string;
  bots: BotType[];
}

interface BotPreset {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  name: string;
    description: string;
  bot_id: string;
  parameter_values: Array<{
    value: string;
    parameter: BotParameter;
  }>;
}

// Fonction pour générer un UUID simple
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const BotPresetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('mdi-robot');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [botNodes, setBotNodes] = useState<BotNode[]>([]);
  const [botNodesFull, setBotNodesFull] = useState<BotNodeFull[]>([]);
  const [selectedBotNode, setSelectedBotNode] = useState<string>('');
  const [selectedBotType, setSelectedBotType] = useState<string>('');
  const [parameterValues, setParameterValues] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch bot nodes and full data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nodes, fullNodes] = await Promise.all([
          fetchBotNodes(),
          fetchBotNodesFull()
        ]);
        
        console.log('=== API DATA DEBUG ===');
        console.log('Bot Nodes:', nodes);
        console.log('Bot Nodes Full:', fullNodes);
        console.log('=====================');
        
        setBotNodes(nodes);
        setBotNodesFull(fullNodes);

        // If editing, load existing preset data
        if (id) {
          const allPresets = await fetchBotPresets();
          const presetData = allPresets.find((preset: BotPreset) => preset.id === id);

          if (presetData) {
            setTitle(presetData.title || '');
            setSubtitle(presetData.subtitle || '');
            setTag(presetData.tag || 'mdi-robot');
            setName(presetData.name || '');
            setDescription(presetData.description || '');
            setSelectedBotNode(presetData.bot_id || '');
            setSelectedBotType(''); // We'll need to determine this from the bot_id
            // Convert parameter_values array to object
            const paramObj: { [key: string]: string } = {};
            if (presetData.parameter_values) {
              presetData.parameter_values.forEach(pv => {
                paramObj[pv.parameter.key] = pv.value;
              });
            }
            setParameterValues(paramObj);
          } else {
            setError('Bot Preset not found.');
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getCurrentBotType = (): BotType | null => {
    if (!selectedBotNode || !selectedBotType) return null;
    const node = botNodesFull.find(n => n.id === selectedBotNode);
    return node?.bots.find(b => b.type === selectedBotType) || null;
  };

  const handleBotNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nodeId = e.target.value;
    setSelectedBotNode(nodeId);
    setSelectedBotType(''); // Reset bot type when node changes
    setParameterValues({}); // Reset parameters
  };

  const handleBotTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeName = e.target.value;
    setSelectedBotType(typeName);
    setParameterValues({}); // Reset parameters when type changes
  };

  const handleParameterChange = (paramKey: string, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBotNode || !selectedBotType) {
      setError('Please select both a bot node and a bot type.');
      return;
    }

    const botType = getCurrentBotType();
    if (!botType) {
      setError('Selected bot type not found.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Build parameter_values array in the correct format
      const parameter_values = botType.parameters.map(param => ({
        value: parameterValues[param.key] || param.default_value || '',
        parameter: {
          id: param.id,
          key: param.key,
          name: param.name,
          description: param.description,
          type: param.type,
          default_value: param.default_value
        }
      }));

      const payload = {
        id: id || generateUUID(), // Utilise l'ID existant ou génère un nouvel UUID
        title: title || name, // Use title if provided, otherwise use name
        subtitle: subtitle || description,
        tag: tag,
        name: name,
        description: description,
        bot_id: botType.id, // Utiliser l'ID du bot type, pas du bot node
        parameter_values: parameter_values
      };

      console.log('=== PAYLOAD DEBUG ===');
      console.log('Selected Bot Node:', selectedBotNode);
      console.log('Selected Bot Type:', selectedBotType);
      console.log('Bot Type Object:', botType);
      console.log('Parameter Values:', parameterValues);
      console.log('Final Payload:', JSON.stringify(payload, null, 2));
      console.log('====================');
      
      if (id) {
        await updateBotPreset(id, payload);
      } else {
        await createBotPreset(payload);
      }
      
      navigate('/intelligence/bots-presets');
    } catch (err) {
      console.error('Error details:', err);
      let errorMessage = 'Failed to save bot preset.';
      
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        
        // Try to extract error message from response
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        }
      } else if (err.request) {
        console.error('Request error:', err.request);
        errorMessage = 'Network error - no response received';
      } else {
        console.error('Error message:', err.message);
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => navigate('/intelligence/bots-presets')}
              className="mr-4 hover:text-gray-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
        {id ? 'Edit Bot Preset' : 'Add New Bot Preset'}
            </h1>
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition flex items-center disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {submitting ? 'SAVING...' : 'SAVE'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Bot Node Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bot Node *
              </label>
              <select
                value={selectedBotNode}
                onChange={handleBotNodeChange}
                required
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a bot node</option>
                {botNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title || node.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bot Type Selection */}
            {selectedBotNode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bot Type *
                </label>
                <select
                  value={selectedBotType}
                  onChange={handleBotTypeChange}
                  required
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a bot type</option>
                  {botNodesFull
                    .find(n => n.id === selectedBotNode)
                    ?.bots.map((bot) => (
                      <option key={bot.type} value={bot.type}>
                        {bot.name || bot.type} - {bot.description}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Basic Information */}
            {selectedBotType && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    placeholder="mdi-robot"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
              required
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
              rows={3}
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Bot Parameters */}
                {(() => {
                  const botType = getCurrentBotType();
                  if (!botType || !botType.parameters || botType.parameters.length === 0) {
                    return null;
                  }

                  return (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Bot Parameters
                      </h3>
                      <div className="space-y-4">
                        {botType.parameters.map((param) => (
                          <div key={param.key}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {param.name || param.key}
                              {param.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                              type={param.type === 'NUMBER' ? 'number' : 'text'}
                              value={parameterValues[param.key] || ''}
                              onChange={e => handleParameterChange(param.key, e.target.value)}
                              required={param.required}
                              placeholder={param.default_value}
                              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {param.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {param.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
          </form>
    </div>
  );
};

export default BotPresetForm; 