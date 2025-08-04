import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.50:5001/api';
const INTELLIGENCE_API_BASE_URL = 'http://192.168.100.50:5001/api';

export interface PublisherParameter {
  id: number;
  key: string;
  name: string;
  description: string;
  type: string;
  default_value: string;
}

export interface Publisher {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: PublisherParameter[];
}

export interface PublisherNode {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_key: string;
  publishers: Publisher[];
}

export interface PublisherPreset {
  id: string;
  name: string;
  description: string;
  publisher_id: string;
  parameter_values: {
    parameter: PublisherParameter;
    value: string;
  }[];
  use_for_notifications: boolean;
}

export const getAllPublishersNodes = async () => {
  const response = await axios.get(`${API_BASE_URL}/publishers-nodes`);
  return response.data;
};

export const getAllPublishersPresets = async () => {
  const response = await axios.get(`${INTELLIGENCE_API_BASE_URL}/publishers-presets`);
  return response.data;
};

export const updatePublisherNode = async (id: string, data: Partial<PublisherNode>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/publishers-nodes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating publisher node ${id}:`, error);
    throw error;
  }
};

export const createPublisherNode = async (data: Omit<PublisherNode, 'id' | 'publishers'>) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/publishers-nodes`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating publisher node:', error);
    throw error;
  }
};

export const updatePublisherPreset = async (id: string, data: Partial<PublisherPreset>) => {
  try {
    const response = await axios.put(`${INTELLIGENCE_API_BASE_URL}/publishers-presets/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating publisher preset ${id}:`, error);
    throw error;
  }
};

export const createPublisherPreset = async (data: Omit<PublisherPreset, 'id'>) => {
  try {
    const response = await axios.post(`${INTELLIGENCE_API_BASE_URL}/publishers-presets`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating publisher preset:', error);
    throw error;
  }
};

export const deletePublisherNode = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/publishers-nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting publisher node ${id}:`, error);
    throw error;
  }
};

export const deletePublisherPreset = async (id: string) => {
  try {
    const response = await axios.delete(`${INTELLIGENCE_API_BASE_URL}/publishers-presets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting publisher preset ${id}:`, error);
    throw error;
  }
}; 