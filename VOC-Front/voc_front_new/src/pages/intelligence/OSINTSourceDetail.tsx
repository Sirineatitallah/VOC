import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { getOsintSourceById, updateOsintSource } from '../../utils/api'; // TODO: Implement these API functions
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getOsintSources, getOsintSourceGroups, updateOsintSource } from '../../utils/api'; // Import both API functions

// Define interfaces based on the API response structure
interface CollectorParameter {
  id: number;
  key: string;
  name: string;
  type: string;
  description: string;
  default_value: string;
}

interface ParameterValue {
  parameter: CollectorParameter;
  value: string;
}

interface OSINTSourceGroup {
  id: string;
  name: string;
  description: string;
}

interface WordList {
  id: string;
  name: string;
  description: string;
}

interface Collector {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: CollectorParameter[];
}

interface OSINTSourceDetailData {
  id: string;
  name: string;
  description: string;
  type: string;
  url: string; // Assuming URL is part of general info or a parameter value
  collector_id: string;
  collector: Collector; // Assuming collector details are included
  last_attempted?: string;
  last_collected?: string;
  osint_source_groups: OSINTSourceGroup[];
  parameter_values: ParameterValue[];
  word_lists: WordList[];
  tag?: string;
}

const OSINTSourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [source, setSource] = useState<OSINTSourceDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for editable fields
  const [editableSource, setEditableSource] = useState<OSINTSourceDetailData | null>(null);

  // State for available OSINT Source Groups
  const [allOsintSourceGroups, setAllOsintSourceGroups] = useState<OSINTSourceGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    const loadSourceAndGroups = async () => {
      if (!id) {
        setLoading(false);
        setLoadingGroups(false);
        setError('No OSINT source ID provided.');
        return;
      }

      try {
        setLoading(true);
        setLoadingGroups(true);

        const [allSources, groupsData] = await Promise.all([
          getOsintSources(),
          getOsintSourceGroups()
        ]);

        const sourceData = allSources.find((s: OSINTSourceDetailData) => s.id === id);
        
        console.log('Debug: groupsData received in OSINTSourceDetail:', groupsData);
        console.log('Debug: groupsData.items in OSINTSourceDetail:', groupsData?.items);

        setAllOsintSourceGroups(groupsData && Array.isArray(groupsData.items) ? groupsData.items : []);

        if (sourceData) {
          setSource(sourceData);
          setEditableSource(sourceData);
          // Initialize selected groups with the source's current groups
          setSelectedGroups(sourceData.osint_source_groups?.map(g => g.id) || []);
          setError(null);
        } else {
          setSource(null);
          setEditableSource(null);
          setError(`OSINT source with ID ${id} not found.`);
        }

      } catch (err) {
        setError('Failed to load OSINT source details or groups.');
        console.error('Error loading OSINT source details or groups:', err);
      } finally {
        setLoading(false);
        setLoadingGroups(false);
      }
    };

    loadSourceAndGroups();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableSource(prev => {
      if (!prev) return null;
      // Handle nested updates if necessary for specific fields
      return { ...prev, [name]: value };
    });
  };

  const handleParameterChange = (paramKey: string, value: string) => {
    setEditableSource(prev => {
      if (!prev) return null;
      const updatedParameterValues = prev.parameter_values.map(pv =>
        pv.parameter.key === paramKey ? { ...pv, value } : pv
      );
      return { ...prev, parameter_values: updatedParameterValues };
    });
  };

  const handleGroupCheckboxChange = (groupId: string, isChecked: boolean) => {
    setSelectedGroups(prev => 
      isChecked 
        ? [...prev, groupId]
        : prev.filter(id => id !== groupId)
    );
  };

    const handleWordListCheckboxChange = (wordListId: string, isChecked: boolean) => {
    setEditableSource(prev => {
      if (!prev) return null;
      // This logic depends on how word list selection/deselection is handled by the API
      // For now, just update the mock data structure or add a flag.
      // TODO: Implement actual word list association logic.
      console.log(`Word List ${wordListId} checked: ${isChecked}`);
      return prev;
    });
  };

  const handleSave = async () => {
    if (!editableSource) return;
    setLoading(true);
    try {
      const updatePayload = {
        ...editableSource,
        osint_source_group_ids: selectedGroups // Use the selected groups
      };
      
      await updateOsintSource(editableSource.id, updatePayload);
      // Refresh the data after successful update
      const [allSources, groupsData] = await Promise.all([
        getOsintSources(),
        getOsintSourceGroups()
      ]);

      const updatedSource = allSources.find((s: OSINTSourceDetailData) => s.id === id);
      if (updatedSource) {
        setSource(updatedSource);
        setEditableSource(updatedSource);
        setSelectedGroups(updatedSource.osint_source_groups?.map(g => g.id) || []);
      }
      
      setAllOsintSourceGroups(Array.isArray(groupsData) ? groupsData : []);
      
    } catch (err) {
      setError('Failed to save OSINT source details.');
      console.error('Error saving OSINT source details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingGroups) { // Overall loading state includes groups
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
              {error}
         </div>
       </div>
    );
  }

  if (!editableSource) {
      return (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
             <p className="text-gray-500 dark:text-gray-400">Source not found.</p>
       </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-semibold">Edit OSINT source</h1>
          <button
            className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition"
            onClick={handleSave}
          >
            SAVE
          </button>
        </div>

           {/* Source ID */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ID:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{editableSource.id}</p>
          </div>

          {/* Collector Node & Collector */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Collector</h2>
            {editableSource.collector ? (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                 <div>
                    <span className="font-semibold">Collector Node:</span>
                    {/* Assuming collector node name/ID is available or implied */}
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Default Docker Collector</span> {/* TODO: Replace with actual collector node data */}
                 </div>
                 <div>
                    <span className="font-semibold">Collector:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{editableSource.collector.name} (ID: {editableSource.collector.id})</span>
                 </div>
              </div>
            ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">Collector information not available.</p>
            )}
          </div>

          {/* General Information */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">General Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editableSource.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editableSource.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Parameters */}
           <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Parameters</h2>
             <div className="space-y-4">
               {editableSource.parameter_values && editableSource.parameter_values.length > 0 ? (
                 editableSource.parameter_values.map(pv => (
                   <div key={pv.parameter.key}>
                     <label htmlFor={pv.parameter.key} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{pv.parameter.name}</label>
                     <input
                       type={pv.parameter.type === 'NUMBER' ? 'number' : 'text'} // Basic type handling
                       id={pv.parameter.key}
                       name={pv.parameter.key}
                       value={pv.value}
                       onChange={(e) => handleParameterChange(pv.parameter.key, e.target.value)}
                       placeholder={pv.parameter.default_value} // Use default as placeholder
                       className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     />
                      {pv.parameter.description && (
                         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{pv.parameter.description}</p>
                      )}
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-gray-600 dark:text-gray-400">No parameters defined for this collector.</p>
               )}
             </div>
           </div>

          {/* OSINT Source Groups */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">OSINT Source Groups</h2>
            {loadingGroups ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : allOsintSourceGroups.length > 0 ? (
              <div className="space-y-2">
                {allOsintSourceGroups.map(group => (
                  <div key={group.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-200 rounded-md border border-gray-200 dark:border-dark-300">
                    <input
                      type="checkbox"
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onChange={(e) => handleGroupCheckboxChange(group.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`group-${group.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-white">{group.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{group.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No OSINT source groups available.</p>
            )}
          </div>

          {/* Word Lists */}
           <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Word Lists</h2>
                <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">ADD NEW</button> {/* TODO: Implement add word list logic */}
            </div>
            {editableSource.word_lists && editableSource.word_lists.length > 0 ? (
             <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                 <thead className="bg-gray-50 dark:bg-dark-300">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th> {/* Checkbox column */}
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                   {editableSource.word_lists.map(wordList => (
                     <tr key={wordList.id} className="hover:bg-gray-50 dark:hover:bg-dark-300">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <input 
                             type="checkbox" 
                             checked={true} // TODO: Check if source is associated with this word list
                             onChange={(e) => handleWordListCheckboxChange(wordList.id, e.target.checked)}
                             className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                        </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{wordList.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{wordList.description}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
            ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No word lists associated.</p>
            )}
          </div>

    </div>
  );
};

export default OSINTSourceDetail; 