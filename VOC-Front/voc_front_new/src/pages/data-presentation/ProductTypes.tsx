import React, { useEffect, useState } from 'react';
import { getAllProductTypes, ProductType, deleteProductType } from '../../utils/presenters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Trash2 } from 'lucide-react';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';

const ProductTypes: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoading(true);
        const response = await getAllProductTypes();
        setProductTypes(response.data.items);
        setTotalCount(response.data.total_count);
      } catch (err) {
        setError('Failed to load product types.');
        console.error('Error loading product types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/data-presentation/product-types/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Product Type?')) return;
    setDeletingId(id);
    try {
      await deleteProductType(id);
      setProductTypes(prev => prev.filter(pt => pt.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      alert('Failed to delete Product Type.');
    } finally {
      setDeletingId(null);
    }
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

  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IntelligenceNavbar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">PRODUCT TYPES</h1>
        <button
              onClick={() => navigate('/data-presentation/product-types/new')}
          className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition"
        >
          ADD NEW
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-dark-400' : 'bg-gray-50'}`}>
            <div className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Product types count: {totalCount}</div>
        <div className={`rounded-lg shadow overflow-hidden ${theme === 'dark' ? 'bg-dark-600' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
            <thead className={`${theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'}`}>
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Title
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Description
                </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                      Actions
                    </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-dark-600' : 'bg-white'} divide-y divide-gray-200 dark:divide-dark-500`}>
              {productTypes.map((type) => (
                <tr
                  key={type.id}
                  onClick={() => handleRowClick(type.id)}
                      className={`${theme === 'dark' ? 'hover:bg-dark-500' : 'hover:bg-gray-50'} cursor-pointer group relative`}
                >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{type.title}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{type.description}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right align-middle">
                        <button
                          type="button"
                          className={`invisible group-hover:visible text-red-600 hover:text-red-800 transition ${deletingId === String(type.id) ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={e => { e.stopPropagation(); handleDelete(type.id); }}
                          disabled={deletingId === String(type.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypes; 