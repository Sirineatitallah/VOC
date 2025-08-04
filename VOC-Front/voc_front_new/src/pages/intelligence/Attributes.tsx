import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, Type, Hash, List, Tag, FileText } from 'lucide-react';
import { intelligenceApi } from '../../utils/api';

interface Attribute {
  id: number;
  name: string;
  description: string;
  type: string;
  tag: string;
  attribute_enums: Array<{
    id: number;
    value: string;
    description: string;
    index: number;
  }>;
}

const getAttributeIcon = (type: string) => {
  switch (type) {
    case 'STRING':
      return <Type className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'NUMBER':
      return <Hash className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'ENUM':
      return <List className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'TLP':
      return <Tag className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'TEXT':
      return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    default:
      return <Type className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  }
};

const Attributes: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await intelligenceApi.get('/attributes');
      console.log('API Response:', response.data);
      
      // Ensure we have an array of attributes
      const data = response.data;
      if (Array.isArray(data)) {
        setAttributes(data);
      } else if (data && typeof data === 'object' && 'items' in data) {
        setAttributes(data.items);
      } else {
        setAttributes([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching attributes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching attributes');
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/intelligence/attributes/${id}`);
  };

  const handleCreate = () => {
    navigate('/intelligence/attributes/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400">{error}</div>
    );
  }

  return (
    <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attributes</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total attributes: {attributes.length}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Attribute
            </button>
          </div>

          <div className="bg-white dark:bg-dark-200 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-300">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
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
                {attributes.map((attribute) => (
                  <tr key={attribute.id} className="hover:bg-gray-50 dark:hover:bg-dark-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getAttributeIcon(attribute.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {attribute.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {attribute.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(attribute.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </>
  );
};

export default Attributes; 