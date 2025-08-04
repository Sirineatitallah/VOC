import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOsintSources, getOsintSourceGroupById, createOSINTSourceGroup, updateOsintSourceGroup, deleteOSINTSourceGroup } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface OSINTSource {
  id: string;
  name: string;
  description: string;
}

const PAGE_SIZE = 10;

const OSINTSourceGroupForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load sources and, if edit, group data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allSources, group] = await Promise.all([
          getOsintSources(),
          isEdit && id ? getOsintSourceGroupById(id) : Promise.resolve(null)
        ]);
        setSources(allSources || []);
        if (group) {
          setName(group.name || '');
          setDescription(group.description || '');
          setIsDefault(!!group.default);
          setSelectedSources(Array.isArray(group.osint_sources) ? group.osint_sources.map((s: any) => s.id) : []);
        }
      } catch (err) {
        setError('Failed to load data.');
        console.error('Error loading group or sources:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    setSelectedSources(prev =>
      checked ? [...prev, sourceId] : prev.filter(id => id !== sourceId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        name,
        description,
        default: isDefault,
        osint_sources: selectedSources.map(id => ({ id })),
      };
      if (isEdit && id) {
        payload.id = id;
        await updateOsintSourceGroup(id, payload);
      } else {
        await createOSINTSourceGroup(payload);
      }
      navigate('/intelligence/source-groups');
    } catch (err) {
      setError('Failed to save group.');
      console.error('Error saving group:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteOSINTSourceGroup(id);
      navigate('/intelligence/source-groups');
    } catch (err) {
      setError('Failed to delete group.');
      console.error('Error deleting group:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(sources.length / PAGE_SIZE);
  const paginatedSources = sources.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
          onClick={() => navigate('/intelligence/source-groups')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {isEdit ? 'Edit OSINT Source Group' : 'Add New OSINT Source Group'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update the details of this source group' : 'Create a new group for organizing your OSINT sources'}
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
              onChange={e => setName(e.target.value)}
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
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="default"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
            />
            <label htmlFor="default" className="text-sm text-gray-700 dark:text-gray-300">Default group</label>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">OSINT Sources</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                <thead className="bg-gray-50 dark:bg-dark-300">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                  {paginatedSources.map(source => (
                    <tr key={source.id}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.id)}
                          onChange={e => handleSourceChange(source.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{source.name}</td>
                      <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{source.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="px-3 py-1 bg-gray-100 dark:bg-dark-300 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="px-3 py-1 bg-gray-100 dark:bg-dark-300 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center space-x-3">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-md disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/intelligence/source-groups')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-md"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
              >
                {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Group')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OSINTSourceGroupForm; 