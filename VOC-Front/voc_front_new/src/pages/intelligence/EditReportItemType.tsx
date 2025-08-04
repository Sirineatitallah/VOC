import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Save, Trash, Edit, X } from 'lucide-react';
import { intelligenceApi } from '../../utils/api';

// Interfaces pour la structure des données
interface Attribute {
  id: number;
  attribute_id?: number;
  type: string;
  name: string;
  description: string;
  min_occurrence: number;
  max_occurrence: number;
}

interface AttributeGroup {
  id: number; // Can be a temp ID for new groups
  name: string;
  description: string;
  section: string;
  attributes: Attribute[];
}

interface ReportItemType {
  id: number;
  title: string;
  description: string;
  subtitle?: string;
  tag?: string;
  attribute_groups: AttributeGroup[];
}

const EditReportItemType: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reportItemType, setReportItemType] = useState<ReportItemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch report item type data
  useEffect(() => {
    const fetchReportItemType = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        // As per user instruction: Fetch all items and filter client-side,
        // because there is no direct API endpoint to get a single item by ID.
        const response = await intelligenceApi.get(`/report-item-types`);
        console.log('All Report Types API Response:', response);

        const allItems = response.data.items || response.data;
        if (!Array.isArray(allItems)) {
          throw new Error("API did not return an array of items.");
        }

        const data = allItems.find((item: any) => item.id.toString() === id);

        if (!data) {
          throw new Error(`Report item type with ID ${id} not found in the list.`);
        }
        
        console.log('Found Report Item Type Data:', data);

        // Transform API data to match our interface
        const transformedData: ReportItemType = {
          id: data.id,
          title: data.title || data.name || '',
          description: data.description || '',
          subtitle: data.subtitle,
          tag: data.tag,
          attribute_groups: (data.attribute_groups || []).map((group: any, groupIndex: number) => ({
            id: group.id || Date.now() + groupIndex,
            name: group.title || group.name || '',
            description: group.description || '',
            section: group.section || '',
            attributes: (group.attribute_group_items || group.attributes || []).map((attr: any, attrIndex: number) => ({
              id: attr.id || Date.now() + attrIndex,
              attribute_id: attr.attribute_id || attr.id,
              name: attr.title || attr.name || '',
              description: attr.description || '',
              type: attr.type || 'Text',
              min_occurrence: attr.min_occurrence || 0,
              max_occurrence: attr.max_occurrence || 1,
            })),
          })),
        };
        
        setReportItemType(transformedData);
      } catch (err) {
        console.error('Error fetching report item type:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch report item type');
      } finally {
        setLoading(false);
      }
    };

      fetchReportItemType();
  }, [id]);

  const handleInputChange = (field: 'title' | 'description', value: string) => {
    if (!reportItemType) return;
    setReportItemType(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleGroupChange = (groupIndex: number, field: 'name' | 'description' | 'section', value: string) => {
    if (!reportItemType) return;
    const updatedGroups = [...reportItemType.attribute_groups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
    setReportItemType(prev => prev ? { ...prev, attribute_groups: updatedGroups } : null);
  };

  const handleAddAttributeGroup = () => {
    if (!reportItemType) return;
    const newGroup: AttributeGroup = {
      id: Date.now(), // Temp ID
      name: '',
      description: '',
      section: '',
      attributes: [],
    };
    setReportItemType(prev => prev ? {
      ...prev,
      attribute_groups: [...prev.attribute_groups, newGroup]
    } : null);
  };

  const handleRemoveAttributeGroup = (groupIndex: number) => {
    if (!reportItemType) return;
    const updatedGroups = reportItemType.attribute_groups.filter((_, i) => i !== groupIndex);
    setReportItemType(prev => prev ? { ...prev, attribute_groups: updatedGroups } : null);
  };
  
  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, groupIndex: number, attrIndex: number, field: keyof Attribute) => {
    if (!reportItemType) return;
    const updatedGroups = [...reportItemType.attribute_groups];
    const updatedAttributes = [...updatedGroups[groupIndex].attributes];
    const value = e.target.type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value;
    updatedAttributes[attrIndex] = { ...updatedAttributes[attrIndex], [field]: value };
    updatedGroups[groupIndex].attributes = updatedAttributes;
    setReportItemType(prev => prev ? { ...prev, attribute_groups: updatedGroups } : null);
  };

  const handleAddAttribute = (groupIndex: number) => {
    if (!reportItemType) return;
    const updatedGroups = [...reportItemType.attribute_groups];
    const newAttribute: Attribute = {
      id: Date.now(), // Temp ID
      type: 'Text',
      name: 'New Attribute',
      description: '',
      min_occurrence: 1,
      max_occurrence: 1,
    };
    updatedGroups[groupIndex].attributes.push(newAttribute);
    setReportItemType(prev => prev ? { ...prev, attribute_groups: updatedGroups } : null);
  };

  const handleRemoveAttribute = (groupIndex: number, attrIndex: number) => {
    if (!reportItemType) return;
    const updatedGroups = [...reportItemType.attribute_groups];
    updatedGroups[groupIndex].attributes = updatedGroups[groupIndex].attributes.filter((_, i) => i !== attrIndex);
    setReportItemType(prev => prev ? { ...prev, attribute_groups: updatedGroups } : null);
  };

  const handleSave = async () => {
    if (!reportItemType) return;
    
    setSaving(true);
    setError(null);

    const payload = {
      id: reportItemType.id,
      title: reportItemType.title,
      description: reportItemType.description,
      subtitle: reportItemType.subtitle,
      tag: reportItemType.tag,
      attribute_groups: reportItemType.attribute_groups.map((group, index) => ({
        // Use original ID if it exists for PUT, else don't send it for new groups
        ...(group.id > 1000000000000 ? {} : {id: group.id}), 
        title: group.name,
        description: group.description,
        index: index,
        attribute_group_items: group.attributes.map((attr, attrIndex) => ({
          // Use original ID if it exists for PUT, else don't send it for new attributes
          ...(attr.id > 1000000000000 ? {} : {id: attr.id}),
          title: attr.name,
          description: attr.description,
          type: attr.type,
          index: attrIndex,
          min_occurrence: attr.min_occurrence,
          max_occurrence: attr.max_occurrence,
          attribute_id: attr.attribute_id,
        })),
      })),
    };

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    try {
      await intelligenceApi.put(`/report-item-types/${reportItemType.id}`, payload);
      navigate('/intelligence/report-types');
    } catch (err) {
      setError('Failed to update report item type.');
      console.error(err);
    } finally {
      setSaving(false);
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

  if (error) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reportItemType) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="text-gray-500 dark:text-gray-400">Report item type not found.</div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/intelligence/report-types')}
              className="mr-4 hover:text-gray-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
              Edit report item type
            </h1>
            <span className="ml-4 text-sm text-blue-200">ID: {reportItemType.id}</span>
          </div>
          <button
            onClick={handleSave}
          disabled={saving}
          className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition flex items-center disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
          {saving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          {/* Basic Information */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                id="title"
                value={reportItemType.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={reportItemType.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Attribute Groups */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attribute Groups</h2>
              <button
                onClick={handleAddAttributeGroup}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                NEW ATTRIBUTE GROUP
              </button>
            </div>

            <div className="space-y-6">
              {reportItemType.attribute_groups.map((group, groupIndex) => (
                <div key={group.id} className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-300 bg-gray-50 dark:bg-dark-300">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      <button
                        onClick={() => handleRemoveAttributeGroup(groupIndex)}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Remove group"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={group.name}
                      onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)}
                      className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm"
                      placeholder="Group Name"
                      />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={group.description}
                      onChange={(e) => handleGroupChange(groupIndex, 'description', e.target.value)}
                        rows={2}
                      className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm"
                      placeholder="Group Description"
                      />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={group.section}
                      onChange={(e) => handleGroupChange(groupIndex, 'section', e.target.value)}
                      className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm"
                      placeholder="Group Section"
                      />
                    </div>

                    {/* Attributes Table */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white">Attributes</h4>
                        <button
                          onClick={() => handleAddAttribute(groupIndex)}
                          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          NEW ATTRIBUTE
                        </button>
                      </div>
                      <div className="bg-white dark:bg-dark-200 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-300">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                          <thead className="bg-gray-50 dark:bg-dark-300">
                            <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                            {group.attributes.length > 0 ? (
                              group.attributes.map((attr, attrIndex) => (
                                <tr key={attr.id} className="hover:bg-gray-50 dark:hover:bg-dark-300">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <select
                                      value={attr.type}
                                      onChange={(e) => handleAttributeChange(e, groupIndex, attrIndex, 'type')}
                                    className="w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 text-sm"
                                  >
                                    <option>Text</option>
                                    <option>Number</option>
                                    <option>Boolean</option>
                                    <option>Date</option>
                                    </select>
                                  </td>
                                <td className="px-4 py-2">
                                  <input type="text" value={attr.name} onChange={(e) => handleAttributeChange(e, groupIndex, attrIndex, 'name')} className="w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 text-sm" />
                                  </td>
                                <td className="px-4 py-2">
                                  <input type="text" value={attr.description} onChange={(e) => handleAttributeChange(e, groupIndex, attrIndex, 'description')} className="w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 text-sm" />
                                  </td>
                                <td className="px-4 py-2">
                                  <input type="number" value={attr.min_occurrence} onChange={(e) => handleAttributeChange(e, groupIndex, attrIndex, 'min_occurrence')} className="w-16 rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 text-sm" />
                                  </td>
                                <td className="px-4 py-2">
                                  <input type="number" value={attr.max_occurrence} onChange={(e) => handleAttributeChange(e, groupIndex, attrIndex, 'max_occurrence')} className="w-16 rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 text-sm" />
                                  </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                  <button onClick={() => handleRemoveAttribute(groupIndex, attrIndex)} className="text-red-600 hover:text-red-900" title="Remove attribute">
                                      <X className="h-5 w-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                  No attributes in this group.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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

export default EditReportItemType; 