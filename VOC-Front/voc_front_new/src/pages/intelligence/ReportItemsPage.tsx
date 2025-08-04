import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../../utils/api';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  see: boolean;
  access: boolean;
  modify: boolean;
  uuid: string;
  title_prefix: string;
  created: string;
  last_updated: string;
  completed: boolean;
  report_item_type_id: number;
  remote_user: string | null;
}

const ReportItemsPage = () => {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await intelligenceApi.get('/analyze/report-items');
      setItems(res.data.items || []);
    } catch (e) {
      setItems([]);
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this report item?')) {
      try {
        await intelligenceApi.delete(`/analyze/report-items/${id}`);
        fetchItems(); // Refresh list after deletion
      } catch (err) {
        console.error('Failed to delete report item', err);
        alert('Failed to delete report item.');
      }
    }
  };

  const handleItemClick = (id: number) => {
    navigate(`/intelligence/analyze/report-items/${id}`);
  };
  
  const handleAddNew = () => {
    navigate('/intelligence/analyze/report-items/new');
  };

  // Filtrage et recherche
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-blue-700">REPORT ITEMS</h1>
        <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          <Plus className="mr-2" /> ADD NEW
        </button>
      </div>
      {/* Filtres */}
      <div className="flex items-center gap-2 mb-2">
        <button className={`px-2 py-1 rounded ${filter === 'All' ? 'bg-blue-100 text-blue-700' : ''}`} onClick={() => setFilter('All')}>All</button>
        <button className={`px-2 py-1 rounded ${filter === 'Today' ? 'bg-blue-100 text-blue-700' : ''}`} onClick={() => setFilter('Today')}>Today</button>
        <button className={`px-2 py-1 rounded ${filter === 'ThisWeek' ? 'bg-blue-100 text-blue-700' : ''}`} onClick={() => setFilter('ThisWeek')}>This Week</button>
        <button className={`px-2 py-1 rounded ${filter === 'ThisMonth' ? 'bg-blue-100 text-blue-700' : ''}`} onClick={() => setFilter('ThisMonth')}>This Month</button>
        <input
          type="text"
          placeholder="Search"
          className="ml-4 border px-2 py-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="mb-2 text-sm">Report items count: {filteredItems.length}</div>
      {/* Table header */}
      <div className="flex bg-gray-100 px-4 py-2 rounded-t text-gray-500 text-xs font-semibold">
        <div className="w-2/3">Title</div>
        <div className="w-1/3">Created</div>
        <div className="w-16">Actions</div>
      </div>
      {/* Liste des items */}
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="flex items-center border border-t-0 rounded-b bg-white shadow-sm mb-2 cursor-pointer hover:bg-gray-50"
              style={{ borderLeft: '4px solid #22c55e' }} // Bordure verte à gauche
            >
              <div className="w-2/3 flex items-center px-4 py-3">
                {/* Icône fichier */}
                <span className="mr-2 text-gray-400">
                  <i className="mdi mdi-file-table-outline" />
                </span>
                <div>
                  <div className="text-xs text-gray-400">Title</div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                </div>
              </div>
              <div className="w-1/3 px-4 py-3">
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-gray-800">{item.created}</div>
              </div>
              <div className="w-16 px-4 py-3 text-center">
                 <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"
                    title="Delete Item"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportItemsPage; 