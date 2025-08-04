import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2 } from 'lucide-react';
import { intelligenceApi } from '../../utils/api';

interface ReportType {
  id: number;
  title: string;
  description: string;
  subtitle?: string;
  tag?: string;
}

const ReportTypesList: React.FC = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

    const fetchReportTypes = async () => {
      try {
        setLoading(true);
        setError(null);
      const response = await intelligenceApi.get(`/report-item-types-simple?search=${searchTerm}`);
        console.log('Report Types API Response:', response.data);
        
        const data = response.data;
        if (data && Array.isArray(data.items)) {
          setReportTypes(data.items);
          setTotalCount(data.total_count || 0);
        } else {
          setReportTypes([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Error fetching report types:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch report types');
        setReportTypes([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    // Debounce search term to avoid excessive API calls
    const handler = setTimeout(() => {
      fetchReportTypes();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (id: number) => {
    navigate(`/intelligence/report-types/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Empêche la navigation lors du clic sur l'icône
    if (window.confirm('Are you sure you want to delete this report type?')) {
      try {
        await intelligenceApi.delete(`/report-item-types/${id}`);
        // Rafraîchir la liste après la suppression
        fetchReportTypes(); 
      } catch (err) {
        console.error('Error deleting report type:', err);
        setError('Failed to delete report type.');
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Types</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Report types count: {totalCount}
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search report types..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <button
            onClick={() => navigate('/intelligence/report-types/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" /> ADD NEW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.length > 0 ? (
          reportTypes.map((reportType) => (
            <div
              key={reportType.id}
              onClick={() => handleCardClick(reportType.id)}
              className="relative bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 p-5 cursor-pointer hover:shadow-md transition-shadow duration-200 group"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {reportType.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reportType.description}
              </p>
              <button
                onClick={(e) => handleDelete(e, reportType.id)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-dark-300 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Report Type"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
            No report types found.
          </div>
        )}
      </div>
    </>
  );
};

export default ReportTypesList; 