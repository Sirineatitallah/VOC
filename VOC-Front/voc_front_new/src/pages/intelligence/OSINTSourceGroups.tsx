import React, { useState, useEffect } from 'react';
import { getOsintSourceGroups, deleteOSINTSourceGroup } from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, Edit, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface OSINTSourceGroup {
  id: string;
  name: string;
  description: string;
  source_count: number;
}

const OSINTSourceGroups: React.FC = () => {
  const [groups, setGroups] = useState<OSINTSourceGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const response = await getOsintSourceGroups();
        console.log('Raw OSINT source groups response in list component:', response);

        if (response && Array.isArray(response.items)) {
          setGroups(response.items);
        setError(null);
        } else {
          console.warn('Invalid response structure for OSINT source groups:', response);
          setError('Received invalid data structure for OSINT source groups.');
        }
      } catch (err) {
        setError('Failed to load OSINT source groups. Please try again later.');
        console.error('Error loading OSINT source groups:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getOsintSourceGroups();
      setGroups(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to refresh OSINT source groups. Please try again later.');
      console.error('Error refreshing OSINT source groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) return;
    try {
      await deleteOSINTSourceGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      alert('Failed to delete group.');
      console.error('Error deleting group:', err);
    }
  };

  const filteredGroups = Array.isArray(groups)
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">OSINT Source Groups</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Open Source Intelligence source groups
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-200 text-gray-600 dark:text-gray-300"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link 
            to="/intelligence/source-groups/new"
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sources
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                {filteredGroups.map((group) => (
                  <tr 
                    key={group.id} 
                    className="hover:bg-gray-50 dark:hover:bg-dark-300 cursor-pointer"
                    onClick={() => navigate(`/intelligence/source-groups/${group.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{group.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {group.source_count} sources
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id, group.name); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="col-span-3 bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300 text-center">
          <p className="text-gray-600 dark:text-gray-400">No source groups found. Try adjusting your search or add a new group.</p>
        </div>
      )}
    </>
  );
};

export default OSINTSourceGroups;
