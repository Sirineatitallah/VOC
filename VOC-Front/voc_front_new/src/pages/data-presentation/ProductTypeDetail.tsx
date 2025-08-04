import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllProductTypes, PresenterNode, updateProductType, getAllPresentersNodes, ProductTypeBackend } from '../../utils/presenters';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { ProductType as ProductTypeAPI, ProductTypeParameter as ProductTypeParameterAPI } from '../../utils/presenters';

interface TemplateParameterDescriptionModalProps {
  parameter: any; // Use a more specific type if available, e.g., ProductTypeParameter
  isOpen: boolean;
  onClose: () => void;
}

interface ProductType extends ProductTypeAPI {
  subtitle?: string;
  tag?: string;
}

interface ProductTypeParameter extends ProductTypeParameterAPI {
  id?: number;
}

const TemplateParameterDescriptionModal: React.FC<TemplateParameterDescriptionModalProps> = ({
  parameter,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !parameter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-dark-600 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in dark:text-gray-200">
        <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Template Parameter Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name:</p>
            <p className="text-base text-gray-900 dark:text-white">{parameter.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description:</p>
            <p className="text-base text-gray-900 dark:text-white">{parameter.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type:</p>
            <p className="text-base text-gray-900 dark:text-white">{parameter.type}</p>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-dark-700 text-right sm:px-6 rounded-b-lg">
          <button
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductTypeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedParameter, setSelectedParameter] = useState<any>(null);
  const [allPresentersNodes, setAllPresentersNodes] = useState<PresenterNode[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductTypeAndPresenters = async () => {
      if (!id) {
        setLoading(false);
        setError('No product type ID provided.');
        return;
      }

      try {
        setLoading(true);
        const [productTypesResponse, presentersNodesResponse] = await Promise.all([
          getAllProductTypes(),
          getAllPresentersNodes()
        ]);
        
        setAllPresentersNodes(presentersNodesResponse.data.items);
        console.log('Product Types Response:', productTypesResponse.data.items);
        console.log('Presenters Nodes Response:', presentersNodesResponse.data.items);

        const foundProductType = productTypesResponse.data.items.find(type => String(type.id) === String(id));
        if (foundProductType) {
          setProductType(foundProductType);
        } else {
          setError(`Product type with ID ${id} not found.`);
        }
      } catch (err) {
        setError('Failed to load product type details or presenters nodes.');
        console.error('Error loading product type details or presenters nodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypeAndPresenters();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductType(prev => {
      if (!prev) return null;
      // This handles the template path specifically, assuming it's the first parameter value
      if (name === 'template_path' && prev.parameter_values.length > 0) {
        const updatedParameterValues = [...prev.parameter_values];
        updatedParameterValues[0].value = value;
        return { ...prev, parameter_values: updatedParameterValues };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (!productType) return;
    setLoading(true);
    try {
      // Construction du payload strictement conforme à l'API
      const payload: ProductTypeBackend = {
        id: Number(productType.id),
        title: productType.title,
        subtitle: productType.subtitle,
        tag: productType.tag,
        description: productType.description,
        presenter_id: productType.presenter_id,
        parameter_values: (productType.parameter_values || []).map((pv: any) => ({
          parameter: {
            id: pv.parameter.id,
            key: pv.parameter.key,
            name: pv.parameter.name,
            description: pv.parameter.description,
            type: pv.parameter.type,
          },
          value: pv.value || '',
        })),
      };
      await updateProductType(productType.id, payload);
      setError(null);
      navigate('/data-presentation/product-types');
    } catch (err) {
      setError('Failed to save product type details.');
      console.error('Error saving product type details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowTemplateParameters = () => {
    if (productType && productType.parameter_values.length > 0) {
      // Assuming the first parameter value is the template path parameter
      setSelectedParameter(productType.parameter_values[0].parameter);
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="intelligence-container">
        <IntelligenceSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <IntelligenceNavbar />
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intelligence-container">
        <IntelligenceSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <IntelligenceNavbar />
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="intelligence-container">
        <IntelligenceSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <IntelligenceNavbar />
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
            <p className="text-gray-500 dark:text-gray-400">Product type not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const templatePath = productType.parameter_values.length > 0 ? productType.parameter_values[0].value : '';

  let presenterNodeName = 'N/A';
  let presenterName = 'N/A';

  // Find the matching presenter and its node
  for (const node of allPresentersNodes) {
    // @ts-ignore: presenters is not typed on PresenterNode
    const foundPresenter = (node as any).presenters?.find((presenter: any) => presenter.id === productType.presenter_id);
    if (foundPresenter) {
      presenterNodeName = node.name;
      presenterName = foundPresenter.name;
      break;
    }
  }

  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-semibold">Edit product type</h1>
          <button
            className="px-4 py-1 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition"
            onClick={handleSave}
          >
            SAVE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          {/* ID */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dotted dark:border-dark-500">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ID:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{productType.id}</p>
          </div>

          {/* Presenter Node & Presenter */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dotted dark:border-dark-500">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Presenters Node</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 pb-4 border-b border-dashed border-gray-200 dark:border-dark-500">{presenterNodeName}</p>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1">Presenter</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{presenterName}</p>
          </div>

          {/* General Information (Name and Description) */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dotted dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 sr-only">General Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={productType.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border-0 border-b border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-none focus:border-primary-500 focus:ring-0 sm:text-sm px-0 py-2"
                  style={{ boxShadow: 'none' }}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={productType.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border-0 border-b border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-none focus:border-primary-500 focus:ring-0 sm:text-sm px-0 py-2"
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* HTML template with its path */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dotted dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 sr-only">HTML template with its path</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="template_path" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">HTML template with its path</label>
                <input
                  type="text"
                  id="template_path"
                  name="template_path"
                  value={templatePath}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white dark:bg-dark-200 border-0 border-b border-gray-300 dark:border-dark-400 text-gray-700 dark:text-gray-300 shadow-none focus:border-primary-500 focus:ring-0 sm:text-sm px-0 py-2"
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Template Parameters Description Button */}
          <div className="flex justify-start">
            <button
              onClick={handleShowTemplateParameters}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span>TEMPLATE PARAMETERS DESCRIPTION</span>
            </button>
          </div>

        </div>
      </div>

      <TemplateParameterDescriptionModal
        parameter={selectedParameter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ProductTypeDetail; 