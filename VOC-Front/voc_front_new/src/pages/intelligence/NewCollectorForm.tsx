import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCollector } from '../../utils/api';
import { ArrowLeft } from 'lucide-react';

const NewCollectorForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createCollector({ name, description, type });
      navigate('/intelligence/collectors');
    } catch (err) {
      setError('Failed to create collector. Please try again.');
      console.error('Error creating collector:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
                Add New Collector
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new collector node for intelligence gathering
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
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a type</option>
                  <option value="rss">RSS Feed</option>
                  <option value="api">API</option>
                  <option value="web">Web Scraper</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/intelligence/collectors')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Collector'}
                </button>
              </div>
            </form>
      </div>
    </div>
  );
};

export default NewCollectorForm;
