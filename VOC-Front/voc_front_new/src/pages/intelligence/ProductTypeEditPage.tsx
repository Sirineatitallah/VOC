import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllProductTypes, updateProductType, deleteProductType, ProductType } from '../../utils/presenters';
import { intelligenceApi } from '../../utils/api';
import { Save, Trash2, Eye, Loader2, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';

interface ReportItem {
  id: number;
  title: string;
}

interface PublisherPreset {
  id: string;
  name: string;
  description: string;
}

// Interface pour le formulaire d'édition de produit
interface ProductFormData {
  id?: number;
  title?: string;
  description?: string;
  subtitle?: string;
  product_type_id?: string;
  presenter_id?: string;
  parameter_values?: any[];
}

const ProductTypeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormData>({});
  const [items, setItems] = useState<ProductType[]>([]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [selectedReportItems, setSelectedReportItems] = useState<number[]>([]);
  const [publisherPresets, setPublisherPresets] = useState<PublisherPreset[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templateOptions, setTemplateOptions] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    fetch('http://localhost:5174/api/templates')
      .then(res => res.json())
      .then(setTemplateOptions)
      .catch(() => setTemplateOptions([]));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== FETCH PRODUCT DATA DEBUG ===');
      console.log('Product ID to load:', id);
      
      // 1. Récupérer tous les produits depuis l'API Intelligence Center
      const productsRes = await intelligenceApi.get('/publish/products');
      console.log('Products response:', productsRes);
      
      // 2. Trouver le produit spécifique par son ID
      const product = productsRes.data.items?.find((p: any) => String(p.id) === String(id));
      console.log('Found product:', product);
      
      if (!product) {
        setError(`Product with ID ${id} not found.`);
        setLoading(false);
        return;
      }
      
      // 3. Récupérer les product types depuis l'API de configuration pour le dropdown
      const productTypesRes = await getAllProductTypes();
      setItems(productTypesRes.data.items || []);
      console.log('Product types loaded:', productTypesRes.data.items);
      
      // 4. Pré-remplir le formulaire avec les données du produit
      const selectedProductType = productTypesRes.data.items?.find(
        (pt: any) => String(pt.id) === String(product.product_type_id)
      );
      setForm({
        id: product.id,
        title: product.title,
        description: product.description,
        subtitle: product.subtitle,
        product_type_id: product.product_type_id.toString(),
        parameter_values: selectedProductType?.parameter_values || [],
      });
      
      // 5. Pré-sélectionner les report items du produit
      const productReportItemIds = product.report_items?.map((ri: any) => ri.id) || [];
      setSelectedReportItems(productReportItemIds);
      console.log('Pre-selected report items:', productReportItemIds);
      
      // 6. Charger les report items et publisher presets
      const reportRes = await intelligenceApi.get('/analyze/report-items');
      setReportItems(reportRes.data.items || []);
      
      const presetRes = await intelligenceApi.get('/publishers-presets');
      setPublisherPresets(presetRes.data.items || []);
      
      console.log('=== FETCH PRODUCT DATA SUCCESS ===');
    } catch (error: any) {
      console.error('=== FETCH PRODUCT DATA ERROR ===', error);
      setError('Failed to load product data.');
      
      if (error.response) {
        console.error('Error response:', error.response);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
    setLoading(false);
  };

  const handleFormChange = (field: keyof ProductFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleReportItemToggle = (id: number) => {
    setSelectedReportItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handlePresetToggle = (id: string) => {
    setSelectedPresets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleProductTypeSelect = (id: string) => {
    const selected = items.find(i => String(i.id) === id);
    setForm(prev => ({
      ...prev,
      product_type_id: id,
      presenter_id: selected?.presenter_id || '',
      parameter_values: selected?.parameter_values || [],
    }));
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('=== SAVE DEBUG ===');
      console.log('Saving product ID:', id);
      console.log('Form data:', form);

      // Utiliser l'API Intelligence Center pour sauvegarder le produit
      // Récupérer les objets report items complets
      const selectedReportItemObjects = reportItems.filter(ri => selectedReportItems.includes(ri.id));
      
      const savePayload = {
        id: parseInt(id || '0'),
        title: form.title || `Product ${id}`,
        description: form.description || `Product description for ${id}`,
        product_type_id: parseInt(form.product_type_id || id || '0'),
        report_items: selectedReportItemObjects // Envoyer les objets complets
      };

      console.log('Save payload:', savePayload);
      
      const response = await intelligenceApi.put(`/publish/products/${id}`, savePayload);
      console.log('Save response:', response);
      
      console.log('=== SAVE SUCCESS ===');
      
      // Rediriger directement vers la page publish avec notification de succès
      navigate('/intelligence/publish?saved=true');
      
    } catch (error: any) {
      console.error('=== SAVE ERROR ===', error);
      setError('Failed to save product.');
      
      if (error.response) {
        console.error('Error response:', error.response);
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Unknown error occurred';
        setError(`Failed to save product: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product type?')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProductType(id!);
      navigate('/intelligence/publish');
    } catch (e) {
      setError('Failed to delete.');
    }
    setDeleting(false);
  };

  const handlePublish = async () => {
    if (!id) {
      setError('Product ID is required for publishing.');
      return;
    }

    if (selectedReportItems.length === 0) {
      setError('Please select at least one report item to publish.');
      return;
    }

    if (selectedPresets.length === 0) {
      setError('Please select at least one publisher preset to publish.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Récupérer les objets report items complets
      const selectedReportItemObjects = reportItems.filter(ri => selectedReportItems.includes(ri.id));
      // Première API : PUT /publish/products/{id} - Mettre à jour le produit
      const productUpdatePayload = {
        id: parseInt(id),
        title: form.title || `Product ${id}`,
        description: form.description || `Product description for ${id}`,
        product_type_id: parseInt(form.product_type_id || id),
        report_items: selectedReportItemObjects
      };
      await intelligenceApi.put(`/publish/products/${id}`, productUpdatePayload);
      // Deuxième API : POST /publish/products/{id}/publish/{preset_id} - Publier avec chaque preset
      let publishErrors = [];
      for (const presetId of selectedPresets) {
        try {
          await intelligenceApi.post(`/publish/products/${id}/publish/${presetId}`);
        } catch (e) {
          publishErrors.push(presetId);
        }
      }
      if (publishErrors.length === 0) {
        setSuccess('Product published successfully!');
        alert('Produit publié avec succès !');
        navigate('/intelligence/publish');
      } else {
        setError(`Erreur lors de la publication pour les presets : ${publishErrors.join(', ')}`);
        alert(`Erreur lors de la publication pour les presets : ${publishErrors.join(', ')}`);
      }
    } catch (error) {
      setError('Failed to publish product.');
    } finally {
      setSaving(false);
    }
  };

  const getTemplatePathValue = () => {
    const param = form.parameter_values?.find(pv => pv.parameter.key === 'template_path');
    return param ? param.value : '';
  };
  const setTemplatePathValue = (value: string) => {
    setForm(prev => {
      const parameter_values = prev.parameter_values ? [...prev.parameter_values] : [];
      const idx = parameter_values.findIndex(pv => pv.parameter.key === 'template_path');
      if (idx !== -1) {
        parameter_values[idx] = { ...parameter_values[idx], value };
      } else {
        parameter_values.push({ parameter: { key: 'template_path', name: 'Template Path', type: 'string', description: '', default_value: '' }, value });
      }
      return { ...prev, parameter_values };
    });
  };

  // Fonction utilitaire pour transformer un report item en structure attendue par le template
  function mapReportItemToTemplate(reportItem: any) {
    const attrs: any = {};
    for (const attr of reportItem.attributes || []) {
      if (attr.attribute_group_item_title === "CVSS") {
        attrs.cvss = { vectorString: attr.value };
      }
      if (attr.attribute_group_item_title === "Confidentiality") {
        attrs.confidentiality = attr.value;
      }
      // Ajoute d'autres mappings ici selon les besoins du template
      // Exemples :
      // if (attr.attribute_group_item_title === "TLP") attrs.tlp = attr.value;
      // if (attr.attribute_group_item_title === "Description") attrs.description = attr.value;
      // etc.
    }
    // Champs additionnels (à adapter selon tes besoins réels)
    attrs.description = reportItem.title || "";
    attrs.exposure_date = reportItem.created || "";
    attrs.update_date = reportItem.last_updated || "";
    // Ajoute d'autres champs si besoin
    return { attrs };
  }

  const handleShowPreview = async () => {
    if (!form.product_type_id) {
      alert('Please select a product type to preview.');
      return;
    }
    if (!selectedReportItems.length) {
      alert('Please select at least one report item to preview.');
      return;
    }
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
      // Utiliser le state reportItems pour éviter un nouvel appel API
      const selectedReportItemObjects = reportItems.filter((ri: ReportItem) => selectedReportItems.includes(ri.id));
      const savePayload = {
        id: parseInt(id || '0', 10),
        title: form.title || `Product ${id}`,
        description: form.description || `Product description for ${id}`,
        product_type_id: parseInt(form.product_type_id as string || id || '0', 10),
        report_items: selectedReportItemObjects
      };
      await intelligenceApi.put(`/publish/products/${id}`, savePayload);
      navigate(`/intelligence/template-preview?template=${encodeURIComponent(template)}&reportItemId=${reportItemId}`);
    } catch (error) {
      alert('Failed to save product before preview.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto mt-10 p-10 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <span>Edit Product Type</span>
      </h2>
      {error && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Type <span className="text-red-500">*</span></label>
        <select
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
          value={form.product_type_id || ''}
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
      {/* Report Items */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-700 text-sm">Report Items</span>
          <span className="text-xs text-gray-400">({reportItems.length})</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {reportItems.map(item => (
            <label key={item.id} className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition">
              <input
                type="checkbox"
                className="accent-blue-600 w-4 h-4"
                checked={selectedReportItems.includes(item.id)}
                onChange={() => handleReportItemToggle(item.id)}
              />
              <span className="text-sm">{item.title}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Publisher Presets */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-700 text-sm">Publisher Presets</span>
          <span className="text-xs text-gray-400">({publisherPresets.length})</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {publisherPresets.map(preset => (
            <label key={preset.id} className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-green-50 transition">
              <input
                type="checkbox"
                className="accent-green-600 w-4 h-4"
                checked={selectedPresets.includes(preset.id)}
                onChange={() => handlePresetToggle(preset.id)}
              />
              <span className="text-sm">{preset.name}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Template Path */}
      <div className="mb-4">
        <button
          className="px-3 py-1 bg-gray-100 rounded text-xs flex items-center"
          onClick={handleShowPreview}
        >
          <Eye className="mr-1" size={14} /> SHOW PRODUCT PREVIEW
        </button>
      </div>
      {previewHtml && (
        <div className="mb-4 p-4 border rounded bg-white">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
          onClick={() => navigate('/intelligence/publish')}
        >
          Cancel
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
          onClick={handlePublish}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />} Publish Product
        </button>
      </div>
    </div>
  );
};
export default ProductTypeEditPage; 