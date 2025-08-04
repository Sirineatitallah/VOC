import { intelligenceApi } from './api';

export interface PresenterNode {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_key: string;
  type?: string;
}

export interface ProductTypeParameter {
  key: string;
  name: string;
  type: string;
  description: string;
  default_value: string;
}

// Interface pour les paramètres envoyés au backend (sans default_value)
export interface ProductTypeParameterBackend {
  id?: number;
  key: string;
  name: string;
  type: string;
  description: string;
}

export interface ProductType {
  id: string;
  title: string;
  description: string;
  presenter_id: string;
  presenter_node_id: string;
  presenter: {
    id: string;
    name: string;
    type: string;
    description: string;
  };
  parameter_values: {
    parameter: ProductTypeParameter;
    value: string;
  }[];
}

// Interface pour les ProductTypes envoyés au backend
export interface ProductTypeBackend {
  id: string | number;
  title: string;
  description: string;
  presenter_id: string;
  presenter_node_id?: string;
  subtitle?: string;
  tag?: string;
  parameter_values: {
    parameter: ProductTypeParameterBackend;
    value: string;
  }[];
}

export function getAllPresentersNodes() {
  return intelligenceApi.get<{ items: PresenterNode[]; total_count: number }>('/presenters-nodes');
}

export function getAllProductTypes() {
  return intelligenceApi.get<{ items: ProductType[]; total_count: number }>('/product-types');
}

export function updatePresenterNode(id: string, payload: PresenterNode) {
  return intelligenceApi.put<PresenterNode>(`/presenters-nodes/${id}`, payload);
}

export function updateProductType(id: string, payload: ProductTypeBackend) {
  return intelligenceApi.put<ProductType>(`/product-types/${id}`, payload);
} 

export function createProductType(payload: ProductTypeBackend) {
  return intelligenceApi.post<ProductType>(`/product-types`, payload);
}

export function deleteProductType(id: string) {
  return intelligenceApi.delete(`/product-types/${id}`);
} 