import React, { useState, useEffect } from 'react';

interface Collector {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_key: string;
  status?: 'active' | 'inactive' | 'error';
  last_run?: string;
}

interface CollectorDetailsModalProps {
  collector: Collector | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (collector: Collector) => void;
}

const CollectorDetailsModal: React.FC<CollectorDetailsModalProps> = ({ collector, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<Collector | null>(collector);

  useEffect(() => {
    setForm(collector);
  }, [collector]);

  if (!isOpen || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (form) onSave(form);
  };

  return (
    <div className={
      `fixed inset-0 z-50 flex items-center justify-center
      transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
    }>
      <div className={
        `absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`
      } onClick={onClose} />
      <div className={
        `relative bg-white dark:bg-dark-200 p-6 rounded-lg w-full max-w-md shadow-lg
        transform transition-all duration-300
        ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'}`
      }>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Collector Node</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1 bg-white dark:bg-dark-100 border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-200" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1 bg-white dark:bg-dark-100 border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-200" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">URL</label>
          <input name="api_url" value={form.api_url} onChange={handleChange} className="w-full border rounded px-2 py-1 bg-white dark:bg-dark-100 border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-200" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Key</label>
          <input name="api_key" value={form.api_key} onChange={handleChange} className="w-full border rounded px-2 py-1 bg-white dark:bg-dark-100 border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-200" />
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-dark-300 dark:hover:bg-dark-400 text-gray-800 dark:text-gray-200">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default CollectorDetailsModal; 