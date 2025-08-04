import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Fonction utilitaire pour transformer un report item en structure attendue par le template
function mapReportItemToTemplate(reportItem: any) {
  const attrs: any = {};
  
  // Map des IDs vers les noms de champs attendus par le template
  const attributeIdMap: { [key: number]: string } = {
    1: 'cvss',           // CVSS
    2: 'tlp',           // TLP
    3: 'confidentiality', // Confidentiality
    4: 'impact',         // Impact
    5: 'cve',           // CVE
    6: 'ioc',           // IOC
    7: 'affected_systems', // Affected Systems
    8: 'recommendations', // Recommendations
    9: 'links'          // Links
  };

  for (const attr of reportItem.attributes || []) {
    const fieldName = attributeIdMap[attr.attribute_group_item_id];
    if (!fieldName) continue;

    // Champs qui doivent être des tableaux
    if (['cve', 'impact', 'ioc', 'affected_systems', 'links'].includes(fieldName)) {
      if (!attrs[fieldName]) attrs[fieldName] = [];
      if (Array.isArray(attr.value)) {
        attrs[fieldName].push(...attr.value);
      } else if (attr.value) {
        attrs[fieldName].push(attr.value);
      }
    }
    // CVSS doit être un objet
    else if (fieldName === 'cvss') {
      attrs.cvss = { vectorString: attr.value };
    }
    // Les autres champs (tlp, confidentiality)
    else {
      attrs[fieldName] = attr.value;
    }
  }

  // Champs de base
  attrs.title = reportItem.title || "";
  attrs.description = reportItem.description || reportItem.title || "";
  attrs.exposure_date = reportItem.created || "";
  attrs.update_date = reportItem.last_updated || "";
  attrs.uuid = reportItem.uuid || "";
  attrs.completed = reportItem.completed || false;

  // Log pour debug
  console.log('ATTRIBUTES MAPPED:', attrs);

  return { attrs };
}

const TemplatePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templateOptions, setTemplateOptions] = useState<string[]>([]);
  const [reportItems, setReportItems] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedReportItemId, setSelectedReportItemId] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5174/api/templates')
      .then(res => res.json())
      .then(setTemplateOptions)
      .catch(() => setTemplateOptions([]));
    // Charger les report items (à adapter selon ton API)
    fetch('/api/analyze/report-items')
      .then(res => res.json())
      .then(data => setReportItems(data.items || []))
      .catch(() => setReportItems([]));
  }, []);

  // Récupérer les paramètres de l'URL
  useEffect(() => {
    const templateFromUrl = searchParams.get('template');
    const reportItemIdFromUrl = searchParams.get('reportItemId');
    
    if (templateFromUrl) {
      setSelectedTemplate(templateFromUrl);
    }
    if (reportItemIdFromUrl) {
      setSelectedReportItemId(Number(reportItemIdFromUrl));
    }
  }, [searchParams]);

  const handlePreview = async () => {
    if (!selectedTemplate) {
      alert('Please select a template.');
      return;
    }
    if (!selectedReportItemId) {
      alert('Please select a report item.');
      return;
    }

    try {
      // Charger les détails complets du report item
      const reportItemResponse = await fetch(`/api/analyze/report-items/${selectedReportItemId}`);
      if (!reportItemResponse.ok) {
        throw new Error('Failed to load report item details');
      }
      const reportItemDetails = await reportItemResponse.json();
      
      // Log pour voir la structure des données
      console.log('API RESPONSE:', JSON.stringify(reportItemDetails, null, 2));
      
      // Log pour voir les attributs si présents
      console.log('ATTRIBUTES:', reportItemDetails.attributes);
      
      // Mapper les détails avec les attributs complets
      const mapped = mapReportItemToTemplate(reportItemDetails);
      
      // Log pour voir le résultat du mapping
      console.log('MAPPED DATA:', JSON.stringify(mapped, null, 2));
      
    const data = { data: { report_items: [mapped] } };
      
      console.log('DATA SENT TO TEMPLATE:', JSON.stringify({ template: selectedTemplate, data }, null, 2));
      
    const res = await fetch('http://localhost:5174/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: selectedTemplate, data })
    });
      
      if (!res.ok) {
        throw new Error('Failed to render template');
      }
      
    const html = await res.text();
    setPreviewHtml(html);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to generate preview: ' + (error as Error).message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-gray-50 rounded shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Template Preview</h2>
        <button
          className="px-3 py-1 bg-gray-300 rounded text-xs"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Template</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedTemplate}
          onChange={e => setSelectedTemplate(e.target.value)}
        >
          <option value="">-- Select a template --</option>
          {templateOptions.map(tpl => (
            <option key={tpl} value={tpl}>{tpl}</option>
          ))}
        </select>
      </div>
          <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Report Item</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedReportItemId || ''}
          onChange={e => setSelectedReportItemId(Number(e.target.value))}
        >
          <option value="">-- Select a report item --</option>
          {reportItems.map(item => (
            <option key={item.id} value={item.id}>{item.title || `Report #${item.id}`}</option>
          ))}
        </select>
      </div>
          <div>
        <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          onClick={handlePreview}
        >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Show Preview
        </button>
      </div>
        </div>
        <div className="md:col-span-2">
      {previewHtml && (
            <div className="bg-white border rounded-lg shadow-sm overflow-auto" style={{ minHeight: '600px', maxHeight: '800px' }}>
              <div className="p-6" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewPage; 