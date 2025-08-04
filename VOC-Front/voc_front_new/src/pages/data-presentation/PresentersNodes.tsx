import React, { useEffect, useState } from 'react';
import { getAllPresentersNodes, PresenterNode, updatePresenterNode } from '../../utils/presenters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PresenterDetailsModalProps {
  presenter: PresenterNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPresenter: PresenterNode) => void;
}

const PresenterDetailsModal: React.FC<PresenterDetailsModalProps> = ({
  presenter,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editablePresenter, setEditablePresenter] = useState<PresenterNode | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setEditablePresenter(presenter);
  }, [presenter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditablePresenter(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (editablePresenter) {
      try {
        await updatePresenterNode(editablePresenter.id, editablePresenter);
        onSave(editablePresenter);
        onClose();
      } catch (error) {
        console.error('Failed to update presenter node:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className={`rounded-lg shadow-xl w-full max-w-md mx-4 ${theme === 'dark' ? 'bg-dark-600 text-gray-200' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Edit Presenter Node</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editablePresenter?.name || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 ${theme === 'dark' ? 'bg-dark-200 border-dark-400 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              id="description"
              name="description"
              value={editablePresenter?.description || ''}
              onChange={handleInputChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 ${theme === 'dark' ? 'bg-dark-200 border-dark-400 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="api_url" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>URL</label>
            <input
              type="text"
              id="api_url"
              name="api_url"
              value={editablePresenter?.api_url || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 ${theme === 'dark' ? 'bg-dark-200 border-dark-400 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="api_key" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Key</label>
            <input
              type="text"
              id="api_key"
              name="api_key"
              value={editablePresenter?.api_key || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 ${theme === 'dark' ? 'bg-dark-200 border-dark-400 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
        </div>
        <div className={`px-4 py-3 text-right sm:px-6 rounded-b-lg ${theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'}`}>
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

const PresentersNodes: React.FC = () => {
  const [presenterNode, setPresenterNode] = useState<PresenterNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [totalPresenters, setTotalPresenters] = useState<number>(0);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchPresentersNodes = async () => {
      try {
        setLoading(true);
        const response = await getAllPresentersNodes();
        setTotalPresenters(response.data.total_count);
        const defaultPresenter = response.data.items.find(node => node.name === 'Default Presenter');
        if (defaultPresenter) {
          setPresenterNode(defaultPresenter);
        } else {
          setError('"Default Presenter" node not found.');
        }
      } catch (err) {
        setError('Failed to load presenters nodes.');
        console.error('Error loading presenters nodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentersNodes();
  }, []);

  const handleSavePresenter = async (updatedPresenter: PresenterNode) => {
    try {
      const response = await getAllPresentersNodes();
      setTotalPresenters(response.data.total_count);
      const defaultPresenter = response.data.items.find(node => node.name === 'Default Presenter');
      if (defaultPresenter) {
        setPresenterNode(defaultPresenter);
      } else {
        setError('"Default Presenter" node not found after update.');
      }
    } catch (err) {
      setError('Failed to re-load presenters nodes after update.');
      console.error('Error re-loading presenters nodes after update:', err);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'} flex justify-center items-center h-full`}>
            <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden p-6 ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'}`}>
        <div className={`mb-4 rounded-md p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
        </div>
      </div>
    );
  }

  if (!presenterNode) {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden p-6 ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'}`}>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No presenter node found.</p>
      </div>
    );
  }

  return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-semibold">PRESENTERS NODES</h1>
        </div>

      <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'}`}>
        <div className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Presenters nodes count: {totalPresenters}
          </div>
          <div 
          className={`rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 ${theme === 'dark' ? 'bg-dark-600' : 'bg-white'} ${theme === 'dark' ? 'hover:bg-dark-500' : 'hover:bg-gray-50'}`}
            onClick={() => setIsModalOpen(true)}
          >
          <div className={`grid grid-cols-3 gap-4 p-4 border-b ${theme === 'dark' ? 'border-dark-500' : 'border-gray-200'} items-center`}>
              <div className="flex items-center space-x-2">
              <Monitor className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Node</span>
              <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} ml-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3 6h18v2H3V6zm3 3h12v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9zm3 0v9h6V9H9zm-4 4h2v6H5V13zm10 0h2v6h-2v-6zm-6-9h6V3H7v1zm2-1h2v1H9V3z" />
                  </svg>
                </button>
              </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>URL</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Key</div>
            </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{presenterNode.name}</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{presenterNode.api_url}</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{presenterNode.api_key ? '********' : 'N/A'}</div>
            </div>
            <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {presenterNode.description || 'No description provided.'}
          </div>
        </div>
      </div>
      <PresenterDetailsModal
        presenter={presenterNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePresenter}
      />
      </div>
    </div>
  );
};

export default PresentersNodes; 