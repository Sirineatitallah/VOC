import React, { useEffect, useState } from 'react';
import { getAllProductTypes, createProductType, updateProductType, deleteProductType, ProductType } from '../../utils/presenters';
import { intelligenceApi } from '../../utils/api';
import { Plus, Save, Trash2, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ReportItem {
  id: number;
  title: string;
}

interface PublisherPreset {
  id: string;
  name: string;
  description: string;
}

// Interface pour les produits de l'API publish
interface PublishProduct {
  id: number;
  title: string;
  description: string;
  subtitle: string;
  product_type_id: number;
  report_items: any[];
  access: boolean;
  modify: boolean;
  see: boolean;
  tag: string;
}

const PublishPage = () => {
  const [items, setItems] = useState<PublishProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<PublishProduct | null>(null);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [selectedReportItems, setSelectedReportItems] = useState<number[]>([]);
  const [publisherPresets, setPublisherPresets] = useState<PublisherPreset[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchItems();
    fetchPublisherPresets();
    
    // Vérifier si on arrive depuis une sauvegarde réussie
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('saved') === 'true') {
      setSuccessMessage('Product updated successfully!');
      // Nettoyer l'URL
      navigate('/intelligence/publish', { replace: true });
      // Masquer la notification après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location, navigate]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      console.log('=== FETCH PRODUCTS DEBUG ===');
      console.log('Fetching products from Intelligence Center API...');
      
      // Utiliser l'API Intelligence Center pour récupérer les produits
      const res = await intelligenceApi.get('/publish/products');
      console.log('Products response:', res);
      
      setItems(res.data.items || []);
      console.log('=== FETCH PRODUCTS SUCCESS ===');
    } catch (error: any) {
      console.error('=== FETCH PRODUCTS ERROR ===', error);
      setItems([]);
      
      if (error.response) {
        console.error('Error response:', error.response);
        alert(`Failed to load products: ${error.response.data?.error || error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const fetchReportItems = async () => {
    try {
      const res = await intelligenceApi.get('/analyze/report-items');
      setReportItems(res.data.items || []);
    } catch (e) {
      setReportItems([]);
    }
  };

  const fetchPublisherPresets = async () => {
    try {
      const res = await intelligenceApi.get('/publishers-presets');
      setPublisherPresets(res.data.items || []);
    } catch (e) {
      setPublisherPresets([]);
    }
  };

  const handleSelect = (item: PublishProduct) => {
    navigate(`/intelligence/publish/product-types/${item.id.toString()}`);
  };

  const handleAddNew = () => {
    navigate('/intelligence/publish/product-types/new');
  };

  const handleReportItemToggle = (id: number) => {
    setSelectedReportItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePresetToggle = (id: string) => {
    setSelectedPresets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteFromList = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setDeleting(true);
    try {
      console.log('=== DELETE DEBUG ===');
      console.log('Deleting product ID:', id);
      
      // Utiliser l'API Intelligence Center pour supprimer le produit
      const response = await intelligenceApi.delete(`/publish/products/${id}`);
      console.log('Delete response:', response);
      
      // Vérifier si la suppression a réussi malgré le statut 401
      // L'API Intelligence Center retourne parfois 401 mais avec un message de succès
      if (response.status === 401 && response.data?.message === 'Product deleted') {
        console.log('Product deleted successfully (401 with success message)');
        await fetchItems();
        console.log('=== DELETE SUCCESS ===');
        return;
      }
      
      // Si le statut est 200 ou autre succès
      if (response.status >= 200 && response.status < 300) {
        console.log('Product deleted successfully');
        await fetchItems();
        console.log('=== DELETE SUCCESS ===');
        return;
      }
      
      // Si on arrive ici, c'est une vraie erreur
      throw new Error(`Unexpected response: ${response.status} - ${response.data?.message || 'Unknown error'}`);
      
    } catch (error: any) {
      console.error('=== DELETE ERROR ===', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        
        // Cas spécial : 401 avec message de succès
        if (error.response.status === 401 && error.response.data?.message === 'Product deleted') {
          console.log('Product deleted successfully despite 401 status');
          await fetchItems();
          return;
        }
        
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Unknown error occurred';
        alert(`Failed to delete product: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-blue-700">PRODUCTS</h1>
        <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          <Plus className="mr-2" /> ADD NEW
        </button>
      </div>
      
      {/* Notification de succès */}
      {successMessage && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
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
      <div className="mb-2 text-sm">Products count: {filteredItems.length}</div>
      {/* Table header */}
      <div className="flex bg-gray-100 px-4 py-2 rounded-t text-gray-500 text-xs font-semibold">
        <div className="w-1/2">Title</div>
        <div className="w-1/2">Description</div>
        <div className="w-12 text-center">Delete</div>
      </div>
      {/* Liste des items */}
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center border border-t-0 rounded-b bg-white shadow-sm mb-2 cursor-pointer ${selected?.id === item.id ? 'ring-2 ring-blue-400' : ''}`}
              style={{ borderLeft: '4px solid #22c55e' }}
              onClick={() => handleSelect(item)}
            >
              <div className="w-1/2 px-4 py-3">
                <div className="text-xs text-gray-400">Title</div>
                <div className="font-medium text-gray-900">{item.title}</div>
              </div>
              <div className="w-1/2 px-4 py-3">
                <div className="text-xs text-gray-400">Description</div>
                <div className="text-gray-800">{item.description}</div>
              </div>
              <div className="w-12 flex justify-center items-center">
                <button
                  className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"
                  title="Delete Product"
                  onClick={e => handleDeleteFromList(e, item.id.toString())}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublishPage;
