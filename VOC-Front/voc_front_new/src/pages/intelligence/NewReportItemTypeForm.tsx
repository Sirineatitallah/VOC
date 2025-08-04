import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Save, Trash, X } from 'lucide-react';
import { intelligenceApi } from '../../utils/api';

// Interfaces pour la structure des données (similaire à EditReportItemType)
interface Attribute {
  id: number;
  type: string;
  name: string;
  description: string;
  min_occurrence: number;
  max_occurrence: number;
}

interface ApiAttribute {
  id: number;
  name: string;
  description: string;
  // Ajoute d'autres champs si nécessaire depuis l'API
}

interface ConfiguredAttribute {
  id: number; // Temp ID for React key
  attribute_id: number; // Real ID from DB
  name: string;
  description: string;
  min_occurrence: number;
  max_occurrence: number;
}

interface AttributeGroup {
  id: number; // Temp ID for React key
  name: string;
  description: string;
  section: string;
  attributes: ConfiguredAttribute[];
}

// --- MODAL COMPONENT ---

interface AddAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attribute: ConfiguredAttribute) => void;
}

const AddAttributeModal: React.FC<AddAttributeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [availableAttributes, setAvailableAttributes] = useState<ApiAttribute[]>([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minOccurrence, setMinOccurrence] = useState(0);
  const [maxOccurrence, setMaxOccurrence] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAttributes = async () => {
        setLoading(true);
        try {
          const response = await intelligenceApi.get('/attributes');
          setAvailableAttributes(response.data.items || []);
        } catch (error) {
          console.error("Failed to fetch attributes", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAttributes();
    }
  }, [isOpen]);

  useEffect(() => {
    const selected = availableAttributes.find(attr => attr.id === selectedAttributeId);
    if (selected) {
      setName(selected.name);
      setDescription(selected.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [selectedAttributeId, availableAttributes]);

  const handleSave = () => {
    console.log('Save button clicked. Selected Attribute ID:', selectedAttributeId);
    if (!selectedAttributeId) {
      alert('Please select an attribute from the list.');
      return;
    }
    const newAttribute = {
      id: Date.now(),
      attribute_id: selectedAttributeId,
      name,
      description,
      min_occurrence: minOccurrence,
      max_occurrence: maxOccurrence,
    };
    console.log('Calling onSave with attribute:', newAttribute);
    onSave(newAttribute);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-600 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Attribute</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attribute</label>
                <select
                  value={selectedAttributeId}
                  onChange={(e) => setSelectedAttributeId(Number(e.target.value))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an attribute</option>
                  {availableAttributes.map(attr => (
                    <option key={attr.id} value={attr.id}>{attr.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Occurrence</label>
                  <input type="number" value={minOccurrence} onChange={e => setMinOccurrence(Number(e.target.value))} className="mt-1 block w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Occurrence</label>
                  <input type="number" value={maxOccurrence} onChange={e => setMaxOccurrence(Number(e.target.value))} className="mt-1 block w-full rounded-md bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400 shadow-sm" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-dark-500 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">SAVE</button>
        </div>
      </div>
    </div>
  );
};

const NewReportItemTypeForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const handleOpenModal = (groupId: number) => {
    setActiveGroupId(groupId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveGroupId(null);
  };

  const handleAddAttributeToGroup = (attribute: ConfiguredAttribute) => {
    console.log('handleAddAttributeToGroup called for group ID:', activeGroupId);
    if (activeGroupId === null) {
      console.error('No active group ID to add attribute to.');
      return;
    }
    setAttributeGroups(groups => {
      const newGroups = groups.map(group =>
        group.id === activeGroupId
          ? { ...group, attributes: [...group.attributes, attribute] }
          : group
      );
      console.log('New attribute groups state:', newGroups);
      return newGroups;
    });
  };
  
  const handleRemoveAttribute = (groupId: number, attributeId: number) => {
    setAttributeGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, attributes: group.attributes.filter(attr => attr.id !== attributeId) }
          : group
      )
    );
  };

  const handleAddAttributeGroup = () => {
    const newGroup: AttributeGroup = {
      id: Date.now(),
      name: '',
      description: '',
      section: '',
      attributes: [],
    };
    setAttributeGroups([...attributeGroups, newGroup]);
  };

  const handleRemoveAttributeGroup = (groupId: number) => {
    setAttributeGroups(attributeGroups.filter(g => g.id !== groupId));
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, groupId: number, field: 'name' | 'description' | 'section') => {
    setAttributeGroups(attributeGroups.map(group =>
      group.id === groupId ? { ...group, [field]: e.target.value } : group
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      id: Date.now(),
      title: name,
      description,
      subtitle: description,
      tag: 'mdi-file-table-outline',
      attribute_groups: attributeGroups.map((group, index) => ({
        title: group.name,
        description: group.description,
        index: index,
        attribute_group_items: group.attributes.map((attr, attrIndex) => ({
          title: attr.name,
          description: attr.description,
          index: attrIndex,
          min_occurrence: attr.min_occurrence,
          max_occurrence: attr.max_occurrence,
          attribute_id: attr.attribute_id,
        })),
      })),
    };

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    try {
       await intelligenceApi.post('/report-item-types', payload);
       navigate('/intelligence/report-types');
    } catch (err) {
      setError('Failed to create report item type.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <button type="button" onClick={() => navigate('/intelligence/report-types')} className="mr-4 hover:text-gray-200">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">Add new report item type</h1>
          </div>
          <button type="submit" disabled={saving} className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition flex items-center disabled:opacity-50">
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400" required />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attribute Groups</h2>
              <button type="button" onClick={handleAddAttributeGroup} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                NEW ATTRIBUTE GROUP
              </button>
            </div>

            <div className="space-y-6">
              {attributeGroups.map((group) => (
                <div key={group.id} className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-300 bg-gray-50 dark:bg-dark-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                    <button type="button" onClick={() => handleRemoveAttributeGroup(group.id)} className="text-gray-500 hover:text-red-600" title="Remove group">
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => handleGroupChange(e, group.id, 'name')}
                        className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400"
                        placeholder="Group Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea value={group.description} onChange={(e) => handleGroupChange(e, group.id, 'description')} rows={2} className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                      <input type="text" value={group.section} onChange={(e) => handleGroupChange(e, group.id, 'section')} className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400" />
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white">Attributes</h4>
                        <button type="button" onClick={() => handleOpenModal(group.id)} className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          <Plus className="h-4 w-4 mr-2" />
                          NEW ATTRIBUTE
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-dark-300">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">NAME</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MIN</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MAX</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-dark-200">
                            {group.attributes.length > 0 ? (
                              group.attributes.map((attr) => (
                                <tr key={attr.id} className="border-t border-gray-200 dark:border-dark-300">
                                  <td className="px-4 py-2 whitespace-nowrap">{attr.name}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">{attr.min_occurrence}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">{attr.max_occurrence}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-right">
                                    <button type="button" onClick={() => handleRemoveAttribute(group.id, attr.id)} className="text-red-500 hover:text-red-700">
                                      <Trash className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center text-gray-500 py-4">No attributes added yet.</td>
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
      </form>
      <AddAttributeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleAddAttributeToGroup}
      />
    </div>
  );
};

export default NewReportItemTypeForm; 