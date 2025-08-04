import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProductTypes, createProductType, ProductType } from '../../utils/presenters';
import { intelligenceApi } from '../../utils/api';
import { Save } from 'lucide-react';

interface ReportItem {
  id: number;
  title: string;
}
interface PublisherPreset {
  id: string;
  name: string;
  description: string;
}

const ProductTypeNewPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<ProductType> & { product_type_id?: string }>({ title: '', description: '' });
  const [items, setItems] = useState<ProductType[]>([]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [selectedReportItems, setSelectedReportItems] = useState<number[]>([]);
  const [publisherPresets, setPublisherPresets] = useState<PublisherPreset[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllProductTypes();
      setItems(res.data.items || []);
      const reportRes = await intelligenceApi.get('/analyze/report-items');
      setReportItems(reportRes.data.items || []);
      const presetRes = await intelligenceApi.get('/publishers-presets');
      setPublisherPresets(presetRes.data.items || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleFormChange = (field: keyof ProductType, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleProductTypeSelect = (id: string) => {
    const selected = items.find(i => String(i.id) === id);
    setForm(prev => ({
      ...prev,
      product_type_id: selected?.id ? String(selected.id) : '',
      presenter_id: selected?.presenter_id || '',
      presenter_node_id: selected?.presenter_node_id || '',
      parameter_values: selected?.parameter_values || [],
    }));
  };
  const handleReportItemToggle = (id: number) => {
    setSelectedReportItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handlePresetToggle = (id: string) => {
    setSelectedPresets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        id: -1, // convention backend pour création
        title: form.title || '',
        description: form.description || '',
        product_type_id: form.product_type_id ? parseInt(form.product_type_id, 10) : undefined,
        report_items: selectedReportItems.map(id => ({ id })),
      };
      console.log('Payload envoyé à /publish/products/create :', payload);
      await intelligenceApi.post('/publish/products/create', payload);
      navigate('/intelligence/publish');
    } catch (e) {
      alert('Failed to create product.');
    }
    setSaving(false);
  };
  const handleShowPreview = async () => {
    if (!form.product_type_id && !form.presenter_node_id && !form.parameter_values) {
      alert('Please select a product type to preview.');
      return;
    }
    if (!selectedReportItems.length) {
      alert('Please select at least one report item to preview.');
      return;
    }
    // Chercher le paramètre template_path
    const param = form.parameter_values?.find(
      pv => pv.parameter.key && pv.parameter.key.toUpperCase().includes('TEMPLATE_PATH')
    );
    const template = param ? param.value : '';
    if (!template) {
      alert('No template path found for this product type.');
      return;
    }
    const reportItemId = selectedReportItems[0];
    try {
      setSaving(true);
      if (form.id) {
        // Produit déjà créé, faire un PUT
        // Utiliser le state reportItems pour éviter un nouvel appel API
        const selectedReportItemObjects = reportItems.filter((ri: ReportItem) => selectedReportItems.includes(ri.id));
        const savePayload = {
          id: parseInt(form.id as string, 10),
          title: form.title || `Product ${form.id}`,
          description: form.description || `Product description for ${form.id}`,
          product_type_id: form.product_type_id ? parseInt(form.product_type_id, 10) : undefined,
          report_items: selectedReportItemObjects
        };
        await intelligenceApi.put(`/publish/products/${form.id}`, savePayload);
        navigate(`/intelligence/template-preview?template=${encodeURIComponent(template)}&reportItemId=${reportItemId}`);
      } else {
        // Produit pas encore créé, faire un POST puis rediriger vers édition
        const payload = {
          id: -1,
        title: form.title || '',
        description: form.description || '',
        presenter_id: form.presenter_id || '',
        presenter_node_id: form.presenter_node_id || '',
        presenter: { id: '', name: '', type: '', description: '' },
        parameter_values: form.parameter_values || [],
      };
        const res = await createProductType(payload);
        if (res && res.data && res.data.id) {
          navigate(`/intelligence/publish/product-types/${res.data.id}`);
        } else {
          alert('Failed to create product type for preview.');
        }
      }
    } catch (e) {
      alert('Failed to save or create product type for preview.');
    } finally {
      setSaving(false);
    }
  };
  const handlePublish = async () => {
    setSaving(true);
    try {
      let productId = form.id;
      // Si pas d'id, créer le produit d'abord
      if (!productId) {
        const payload = {
          id: -1,
          title: form.title || '',
          description: form.description || '',
          product_type_id: form.product_type_id ? parseInt(form.product_type_id, 10) : undefined,
          report_items: selectedReportItems.map(id => ({ id })),
        };
        const res = await intelligenceApi.post('/publish/products/create', payload);
        productId = res.data?.id || res.data?.product?.id;
        if (!productId) throw new Error('Erreur lors de la création du produit.');
      }
      // PUT pour sauvegarder les dernières modifs
      const savePayload = {
        id: parseInt(productId, 10),
        title: form.title || `Product ${productId}`,
        description: form.description || `Product description for ${productId}`,
        product_type_id: form.product_type_id ? parseInt(form.product_type_id, 10) : undefined,
        report_items: selectedReportItems.map(id => ({ id })),
      };
      await intelligenceApi.put(`/publish/products/${productId}`, savePayload);
      // POST pour chaque preset sélectionné
      let publishErrors = [];
      for (const presetId of selectedPresets) {
        try {
          await intelligenceApi.post(`/publish/products/${productId}/publish/${presetId}`);
        } catch (e) {
          publishErrors.push(presetId);
        }
      }
      if (publishErrors.length === 0) {
        alert('Produit publié avec succès !');
      navigate('/intelligence/publish');
      } else {
        alert(`Erreur lors de la publication pour les presets : ${publishErrors.join(', ')}`);
      }
    } catch (e) {
      alert('Erreur lors de la publication du produit.');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div className="max-w-6xl mx-auto mt-8 p-10 bg-gray-50 rounded shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">New Product Type</h2>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Type <span className="text-red-500">*</span></label>
        <select
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
          onChange={e => handleProductTypeSelect(e.target.value)}
          required
        >
          <option value="">-- Select Product Type --</option>
          {items.map(i => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
            value={form.title || ''}
            onChange={e => handleFormChange('title', e.target.value)}
            placeholder="Enter product title"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <input
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
            value={form.description || ''}
            onChange={e => handleFormChange('description', e.target.value)}
            placeholder="Enter product description"
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-1 text-xs text-gray-500">Report Items</div>
        <div className="flex flex-wrap gap-2">
          {reportItems.map(item => (
            <label key={item.id} className="flex items-center gap-1 text-xs bg-white border rounded px-2 py-1">
              <input
                type="checkbox"
                checked={selectedReportItems.includes(item.id)}
                onChange={() => handleReportItemToggle(item.id)}
              />
              {item.title}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-1 text-xs text-gray-500">Publisher Presets</div>
        <div className="flex flex-wrap gap-2">
          {publisherPresets.map(preset => (
            <label key={preset.id} className="flex items-center gap-1 text-xs bg-white border rounded px-2 py-1">
              <input
                type="checkbox"
                checked={selectedPresets.includes(preset.id)}
                onChange={() => handlePresetToggle(preset.id)}
              />
              {preset.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <button
          className="px-3 py-1 bg-gray-100 rounded text-xs flex items-center"
          onClick={handleShowPreview}
          disabled={saving}
        >
          Show Product Preview
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="mr-2" size={16} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          onClick={() => navigate('/intelligence/publish')}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
          onClick={handlePublish}
          disabled={saving}
        >
          Publish Product
        </button>
      </div>
    </div>
  );
};
export default ProductTypeNewPage; 