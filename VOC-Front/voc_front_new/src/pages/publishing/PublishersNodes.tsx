import React, { useEffect, useState } from 'react';
import { getAllPublishersNodes, PublisherNode, updatePublisherNode, deletePublisherNode } from '../../utils/publishers';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Share2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditPublisherNodeModalProps {
  node: PublisherNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: PublisherNode) => void;
}

const EditPublisherNodeModal: React.FC<EditPublisherNodeModalProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(node?.name || '');
  const [description, setDescription] = useState(node?.description || '');
  const [apiUrl, setApiUrl] = useState(node?.api_url || '');
  const [apiKey, setApiKey] = useState(node?.api_key || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setName(node.name);
      setDescription(node.description);
      setApiUrl(node.api_url);
      setApiKey(node.api_key);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const updatedNode = await updatePublisherNode(node.id, {
        name,
        description,
        api_url: apiUrl,
        api_key: apiKey,
      });
      onSave(updatedNode);
      onClose();
    } catch (err) {
      setError('Failed to save publisher node.');
      console.error('Error saving publisher node:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-600 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Edit publishers node</h2>
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
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input
              type="text"
              id="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
            <input
              type="text"
              id="key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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

const PublishersNodes: React.FC = () => {
  const [publishersNodes, setPublishersNodes] = useState<PublisherNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PublisherNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNodes = async () => {
    try {
      const response = await getAllPublishersNodes();
      setPublishersNodes(response.items);
    } catch (err) {
      setError('Failed to load publishers nodes');
      console.error('Error loading publishers nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleSaveNode = (updatedNode: PublisherNode) => {
    // Update the list of nodes with the saved one
    setPublishersNodes(prevNodes =>
      prevNodes.map(node => (node.id === updatedNode.id ? updatedNode : node))
    );
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this publisher node?')) {
      try {
        await deletePublisherNode(nodeId);
        setPublishersNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
      } catch (err) {
        setError('Failed to delete publisher node.');
        console.error('Error deleting publisher node:', err);
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
              <Share2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PUBLISHERS NODES</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={() => navigate('/publishing/publishers-nodes/new')}
              >
                <Plus className="h-4 w-4 mr-1" /> ADD NEW
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Publishers nodes count: {publishersNodes.length}
          </div>

          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-400">
            <div className="grid grid-cols-[1fr,2fr,1fr] gap-4 p-4 border-b border-gray-200 dark:border-dark-400 font-semibold text-gray-700 dark:text-gray-300">
              <div>Node</div>
              <div>Description</div>
              <div>Url</div>
              <div>Actions</div>
            </div>
            {
              publishersNodes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No publishers nodes found.</div>
              ) : (
                publishersNodes.map((node) => (
                  <div
                    key={node.id}
                    className="grid grid-cols-[1fr,2fr,1fr,0.5fr] gap-4 p-4 border-b border-gray-100 dark:border-dark-400 hover:bg-gray-50 dark:hover:bg-dark-400"
                  >
                    <div
                      className="cursor-pointer" onClick={() => {
                        setSelectedNode(node);
                        setIsModalOpen(true);
                      }}
                    >
                      {node.name}
                    </div>
                    <div
                      className="cursor-pointer" onClick={() => {
                        setSelectedNode(node);
                        setIsModalOpen(true);
                      }}
                    >
                      {node.description || 'No description available'}
                    </div>
                    <div
                      className="cursor-pointer" onClick={() => {
                        setSelectedNode(node);
                        setIsModalOpen(true);
                      }}
                    >
                      {node.api_url}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          handleDeleteNode(node.id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-500 text-red-600 dark:text-red-400"
                        title="Delete Node"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )
            }
          </div>
        </div>
      </div>

      <EditPublisherNodeModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
      />
    </div>
  );
};

export default PublishersNodes; 