import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, FileText } from 'lucide-react';
import { fetchAttributes, createAttribute, updateAttribute } from '../../utils/api';

interface AttributeEnum {
  id: number;
  value: string;
  description: string;
  index: number;
}

interface Attribute {
  id: number;
  name: string;
  description: string;
  type: string;
  tag: string;
  validator: string | null;
  validator_parameter: string | null;
  default_value: string | null;
  attribute_enums: AttributeEnum[];
}

const AttributeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (id && id !== 'new') {
      // Fetch all attributes and then filter
      fetchAllAttributesAndFilter(); 
    } else {
      setAttribute({
        id: 0,
        name: '',
        description: '',
        type: 'STRING',
        tag: 'mdi-form-textbox', // This tag seems to be for an old icon library. Should be removed/updated if not used
        validator: null,
        validator_parameter: null,
        default_value: null,
        attribute_enums: []
      });
      setLoading(false);
    }
  }, [id]);

  const fetchAllAttributesAndFilter = async () => {
    try {
      setLoading(true);
      // Fetch all attributes
      const allAttributes = await fetchAttributes(); 
      console.log('All attributes fetched for detail page:', allAttributes);

      // Ensure allAttributes is an array and find the specific attribute by ID
      const data = Array.isArray(allAttributes) ? allAttributes : (allAttributes && allAttributes.items ? allAttributes.items : []);
      const foundAttribute = data.find((attr: Attribute) => attr.id.toString() === id);

      if (foundAttribute) {
        setAttribute(foundAttribute);
        setError(null);
      } else {
        setError(`Attribute with ID ${id} not found.`);
        setAttribute(null);
      }
    } catch (err) {
      console.error('Error fetching all attributes and filtering:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching attributes');
      setAttribute(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!attribute) return;
    const { name, value } = e.target;
    setAttribute(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!attribute) return;
    try {
      if (id === 'new') {
        // Create new attribute
        const response = await createAttribute(attribute); 
        console.log('New attribute created:', response);
      } else {
        // Update existing attribute
        const response = await updateAttribute(id, attribute); 
        console.log('Attribute updated:', response);
      }
      navigate('/intelligence/attributes');
    } catch (err) {
      console.error('Error saving attribute:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving attribute');
    }
  };

  const handleImportConstants = () => {
    // TODO: Implement import constants functionality
  };

  const handleImportCSV = () => {
    // TODO: Implement import CSV functionality
  };

  const handleAddEnum = () => {
    if (!attribute) return;
    const newEnum: AttributeEnum = {
      id: Date.now(), // Temporary ID
      value: '',
      description: '',
      index: attribute.attribute_enums.length
    };
    setAttribute(prev => prev ? {
      ...prev,
      attribute_enums: [...prev.attribute_enums, newEnum]
    } : null);
  };

  const handleEnumChange = (index: number, field: keyof AttributeEnum, value: string) => {
    if (!attribute) return;
    const updatedEnums = [...attribute.attribute_enums];
    updatedEnums[index] = { ...updatedEnums[index], [field]: value };
    setAttribute(prev => prev ? { ...prev, attribute_enums: updatedEnums } : null);
  };

  const handleRemoveEnum = (index: number) => {
    if (!attribute) return;
    const updatedEnums = attribute.attribute_enums.filter((_, i) => i !== index);
    setAttribute(prev => prev ? { ...prev, attribute_enums: updatedEnums } : null);
  };

  if (loading) {
    return (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!attribute) return null;

  const totalPages = Math.ceil(attribute.attribute_enums.length / itemsPerPage);
  const paginatedEnums = attribute.attribute_enums.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/intelligence/attributes')}
              className="mr-4 hover:text-gray-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
              {id === 'new' ? 'New Attribute' : 'Edit Attribute'}
            </h1>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition"
          >
            SAVE
          </button>
        </div>

          {/* Basic Information */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={attribute.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={attribute.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={attribute.type}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="STRING">Text</option>
                  <option value="TEXT">Text Area</option>
                  <option value="NUMBER">Number</option>
                  <option value="ENUM">Enum</option>
                  <option value="TLP">TLP</option>
                </select>
              </div>
              <div>
                <label htmlFor="validator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Validator
                </label>
                <select
                  id="validator"
                  name="validator"
                  value={attribute.validator || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="REGEX">Regular Expression</option>
                  <option value="EMAIL">Email</option>
                  <option value="URL">URL</option>
                </select>
              </div>
              {attribute.validator && (
                <div>
                  <label htmlFor="validator_parameter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Validator Parameter
                  </label>
                  <input
                    type="text"
                    id="validator_parameter"
                    name="validator_parameter"
                    value={attribute.validator_parameter || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Attribute Constants */}
          {attribute.type === 'ENUM' && (
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attribute Constants</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleImportConstants}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-400 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Import Constants
                  </button>
                  <button
                    onClick={handleImportCSV}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-400 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Import CSV
                  </button>
                  <button
                    onClick={handleAddEnum}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Value
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-200 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
                  <thead className="bg-gray-50 dark:bg-dark-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-200 divide-y divide-gray-200 dark:divide-dark-300">
                    {paginatedEnums.map((enumItem, index) => (
                      <tr key={enumItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={enumItem.value}
                            onChange={(e) => handleEnumChange(index, 'value', e.target.value)}
                            className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={enumItem.description}
                            onChange={(e) => handleEnumChange(index, 'description', e.target.value)}
                            className="w-full rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveEnum(index)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
    </div>
  );
};

export default AttributeDetail; 