import axios from 'axios';
import { Vulnerability } from '../types';

// Utiliser l'URL de l'API configurée dans le fichier de configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
const INTELLIGENCE_API_URL = import.meta.env.VITE_INTELLIGENCE_API_URL || 'http://localhost:5173/api';

// Configuration de base pour Axios
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status: number) => status >= 200 && status < 500,
};

// Instance axios pour l'API Intelligence Center
export const intelligenceApi = axios.create({
  ...axiosConfig,
  baseURL: INTELLIGENCE_API_URL,
  timeout: 30000, // 30 secondes
});

// Configuration de l'API principale avec des timeouts adaptés
const api = axios.create({
  ...axiosConfig,
  baseURL: `${API_URL}/api`,
  timeout: 60000, // 60 secondes
});

// Configuration spécifique pour les requêtes longues
const longRequestApi = axios.create({
  ...axiosConfig,
  baseURL: `${API_URL}/api`,
  timeout: 180000, // 3 minutes
});

// Fonction pour gérer les retries
const retryRequest = async (error: any, retryCount = 0, maxRetries = 3) => {
  if (retryCount >= maxRetries) {
    throw error;
  }

  // Attendre un peu plus longtemps à chaque retry
  const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
  await new Promise(resolve => setTimeout(resolve, delay));

  // Refaire la requête
  const config = error.config;
  return axios(config);
};

// Gestionnaire d'erreurs amélioré
const handleApiError = async (error: any) => {
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    console.error('Erreur de connexion:', error.message);
    // Tenter de refaire la requête
    try {
      return await retryRequest(error);
    } catch (retryError) {
      throw new Error(
        "La connexion à l'API a expiré après plusieurs tentatives. Vérifiez que le serveur API est accessible."
      );
    }
    } else if (error.response) {
    console.error(`Erreur API ${error.response.status}:`, error.response.data);
    throw new Error(`Erreur API ${error.response.status}: ${error.response.data?.message || 'Erreur inconnue'}`);
    } else {
    console.error('Erreur inattendue:', error.message);
    throw error;
  }
};

// Ajouter les intercepteurs
[api, longRequestApi, intelligenceApi].forEach(instance => {
  instance.interceptors.response.use(
    response => response,
    handleApiError
  );
});

// Intelligence Center API calls
export const fetchAllOSINTSources = async () => {
  try {
    const response = await api.get('/assess/osint-sources');
    return response.data;
  } catch (error) {
    console.error('Error fetching OSINT sources:', error);
    throw error;
  }
};

export const fetchOSINTSourceGroups = async () => {
  try {
    const response = await api.get('/osint-source-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching OSINT source groups:', error);
    throw error;
  }
};

export const fetchCollectors = async () => {
  try {
    const response = await api.get('/collectors');
    return response.data;
  } catch (error) {
    console.error('Error fetching collectors:', error);
    throw error;
  }
};

export const fetchCollectorSources = async (collectorId: string) => {
  try {
    const response = await api.get(`/collectors/${collectorId}/osint-sources`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sources for collector ${collectorId}:`, error);
    throw error;
  }
};

export const fetchCollector = async (id: string) => {
  try {
    const response = await api.get(`/collectors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching collector ${id}:`, error);
    throw error;
  }
};

export const updateCollector = async (id: string, data: { name: string; description: string; api_url: string; api_key: string }) => {
  try {
    const payload = {
      name: data.name,
      description: data.description,
      api_url: data.api_url,
      api_key: data.api_key,
    };
    console.log('PUT payload:', payload);
    const response = await intelligenceApi.put(`/collectors/${id}`, payload);
    return response.data;
  } catch (error: unknown) { // Explicitly type error as unknown
    let errorMessage = 'An unknown error occurred';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `API error ${error.response.status}: ${error.response.data?.message || error.message}`;
        console.error('API error details:', error.response.data);
      } else if (error.request) {
        errorMessage = 'No response received from API server. Check if the server is running.';
      } else {
        errorMessage = `Error setting up request: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error updating collector ${id}:`, error);
    throw new Error(errorMessage);
  }
};

interface Collector {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_key: string;
  collectors: any[];
  tag: string;
  status: string;
}

export const getCollectors = async () => {
  try {
    const response = await intelligenceApi.get('/collectors');
    console.log('Raw collectors response:', response.data);
    
    // Vérifier si la réponse a la structure attendue
    if (response.data && response.data.items && Array.isArray(response.data.items)) {
      // Filtrer pour ne retourner que le Default Docker Collector
      const defaultCollector = response.data.items.filter(
        (collector: Collector) => collector.name === 'Default Docker Collector'
      );
      return defaultCollector;
    }
    
    // Si la structure n'est pas celle attendue, retourner un tableau vide
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching collectors:', error);
    throw error;
  }
};

export const getOsintSources = async () => {
  try {
    const response = await intelligenceApi.get('/osint-sources');
    console.log('Raw OSINT sources response:', response);
    // Vérifier la structure de la réponse et extraire les données correctement
    return response.data && response.data.items ? response.data.items : [];
  } catch (error) {
    console.error('Error fetching OSINT sources:', error);
    throw error;
  }
};

export const getOsintSourceGroups = async () => {
  try {
    const response = await intelligenceApi.get('/osint-source-groups');
    console.log('Raw OSINT source groups response data:', response.data);
    
    // Return the data directly since it already has the correct structure
    return response.data;
  } catch (error) {
    console.error('Error fetching OSINT source groups:', error);
    throw error;
  }
};

// Fonctions pour les sources OSINT
export const fetchOSINTSource = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/osint-sources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching OSINT source ${id}:`, error);
    throw error;
  }
};

export const createOSINTSource = async (sourceData: any) => {
  try {
    const response = await intelligenceApi.post('/osint-sources', sourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating OSINT source:', error);
    throw error;
  }
};

export const updateOSINTSource = async (id: string, sourceData: any) => {
  try {
    const response = await intelligenceApi.put(`/osint-sources/${id}`, sourceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating OSINT source ${id}:`, error);
    throw error;
  }
};

// Fonctions pour les groupes de sources OSINT
export const fetchOSINTSourceGroup = async (id: string) => {
  try {
    const response = await api.get(`/osint-source-groups/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching OSINT source group ${id}:`, error);
    throw error;
  }
};

export const getOsintSourceGroupById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/osint-source-groups/${id}`);
    console.log(`Raw OSINT source group ${id} response:`, response);
    // Assuming the response for a single item is directly the group object, not in an 'items' array
    return response.data; // Adjust based on actual API response structure for single item
  } catch (error: unknown) { // Explicitly type error as unknown
    let errorMessage = 'An unknown error occurred';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `API error ${error.response.status}: ${error.response.data?.message || error.message}`;
        console.error('API error details:', error.response.data);
      } else if (error.request) {
        errorMessage = 'No response received from API server. Check if the server is running.';
      } else {
        errorMessage = `Error setting up request: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error fetching OSINT source group ${id} with intelligenceApi:`, error);
    throw new Error(errorMessage);
  }
};

export const createOSINTSourceGroup = async (groupData: any) => {
  try {
    const response = await api.post('/osint-source-groups', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating OSINT source group:', error);
    throw error;
  }
};

export const updateOsintSourceGroup = async (id: string, groupData: {
    id: string;
    name: string;
    description: string;
    osint_source_ids: string[];
    default: boolean;
    tag?: string;
}) => {
  try {
        const response = await intelligenceApi.put(`/osint-source-groups/${id}`, groupData);
    return response.data;
    } catch (error: unknown) {
        let errorMessage = 'An unknown error occurred';
        if (axios.isAxiosError(error)) {
            if (error.response) {
                errorMessage = `API error ${error.response.status}: ${error.response.data?.message || error.message}`;
                console.error('API error details:', error.response.data);
            } else if (error.request) {
                errorMessage = 'No response received from API server. Check if the server is running.';
            } else {
                errorMessage = `Error setting up request: ${error.message}`;
            }
        }
    console.error(`Error updating OSINT source group ${id}:`, error);
        throw new Error(errorMessage);
  }
};

// Fonction pour vérifier si l'API est accessible avec un timeout court
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Vérification de la connexion à l\'API...');
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 3000 // Timeout court pour vérifier rapidement
    });
    console.log('API accessible:', response.status === 200);
    return response.status === 200;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

// Fonction pour récupérer les données du tableau de bord avec mise en cache
let dashboardCache = {
  data: null,
  timestamp: 0,
  page: 1,
  pageSize: 100000 // Revenir à 100000 par défaut
};

export const fetchDashboardData = async (page: number = 1, pageSize: number = 500, forceRefresh = false) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    // Ajouter la recherche globale si elle existe
    if (window.location.search.includes('cve-2025')) {
      params.append('search', 'cve-2025');
    }
    
    const response = await api.get(`/cvefeed?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Cache pour les vulnérabilités avec pagination
let vulnerabilitiesCache = {
  data: null as Vulnerability[] | null,
  filters: null as any,
  timestamp: 0,
  page: 1,
  pageSize: 100000, // Revenir à 100000 pour les vulnérabilités individuelles
  totalCount: 0
};

// Fonction pour récupérer les vulnérabilités avec filtres et mise en cache
export const fetchVulnerabilities = async (
  filters?: any, 
  page: number = 1, 
  pageSize: number = 500,
  forceRefresh = false
): Promise<{ data: Vulnerability[], totalCount: number }> => {
  try {
    // Utiliser le cache si les filtres sont identiques et pas trop ancien (moins de 5 minutes)
    const now = Date.now();
    const filtersString = JSON.stringify(filters || {});
    const cachedFiltersString = JSON.stringify(vulnerabilitiesCache.filters || {});
    
    if (!forceRefresh && 
        vulnerabilitiesCache.data && 
        filtersString === cachedFiltersString && 
        page === vulnerabilitiesCache.page &&
        pageSize === vulnerabilitiesCache.pageSize &&
        (now - vulnerabilitiesCache.timestamp < 5 * 60 * 1000)) {
      console.log('Utilisation des données en cache pour les vulnérabilités');
      return {
        data: vulnerabilitiesCache.data,
        totalCount: vulnerabilitiesCache.totalCount
      };
    }
    
    console.log(`Fetching vulnerabilities with filters:`, JSON.stringify(filters));
    
    // Construire la chaîne de requête pour l'API
      const params = new URLSearchParams();
      
    if (filters) {
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      if (filters.vendor) params.append('vendor', filters.vendor);
      if (filters.product) params.append('product', filters.product);
      if (filters.kev !== undefined) params.append('kev', filters.kev);
      if (filters.has_poc !== undefined) params.append('has_poc', filters.has_poc);
      if (filters.cvss_min !== undefined) params.append('cvss_min', filters.cvss_min.toString());
      if (filters.cvss_max !== undefined) params.append('cvss_max', filters.cvss_max.toString());
      if (filters.epss_min !== undefined) params.append('epss_min', filters.epss_min.toString());
      if (filters.epss_max !== undefined) params.append('epss_max', filters.epss_max.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
    }
    
    // Ajouter les paramètres de pagination
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    console.log('Query string:', params.toString());
    
    // Utiliser longRequestApi pour les requêtes de vulnérabilités
    const response = await longRequestApi.get(`/cvefeed?${params.toString()}`);
    
    if (!response.data) {
      console.warn("No data received from API");
      return { data: [], totalCount: 0 };
    }

    // Fonction pour normaliser une vulnérabilité
    const normalizeVulnerability = (cve: any): Vulnerability => ({
      cve_id: cve.cve_id || '',
      title: cve.title || '',
      description: cve.description || '',
      severity: cve.severity?.toUpperCase() || 'UNKNOWN',
      cvss_score: cve.cvss_score || 0,
      epss_score: cve.epss_score || 0,
      epss_percentile: cve.epss_percentile || 0,
      published_date: cve.published_date || new Date().toISOString(),
      vendor: cve.vendor || 'Unknown',
      product: cve.product || 'Unknown',
      is_kev: Boolean(cve.is_kev),
      has_poc: Boolean(cve.has_poc),
      has_template: Boolean(cve.has_template),
      reported_on_hackerone: Boolean(cve.reported_on_hackerone),
      status: (cve.status?.toUpperCase() || 'OPEN'),
      taranis_link: cve.taranis_link || '',
      affected_systems: cve.affected_systems || 0,
      source: cve.source || 'NVD',
      tags: cve.tags || '',
      family: cve.family || 'Unknown',
      country: cve.country || 'Unknown',
      region: cve.region || 'Unknown',
      risk_score: cve.risk_score || 0.0,
      taranis_collected_date: cve.taranis_collected_date || new Date().toISOString(),
      last_updated_at: cve.last_updated_at || new Date().toISOString()
    });

    let vulnerabilities: Vulnerability[] = [];
    let totalCount = 0;

    // Vérifier si nous avons reçu les données du tableau de bord
    if (response.data.all_cves && Array.isArray(response.data.all_cves)) {
      vulnerabilities = response.data.all_cves.map(normalizeVulnerability);
      totalCount = vulnerabilities.length;
    }
    // Vérifier si nous avons reçu une liste directe de vulnérabilités
    else if (Array.isArray(response.data)) {
      vulnerabilities = response.data.map(normalizeVulnerability);
      totalCount = vulnerabilities.length;
    }
    // Vérifier si nous avons reçu une structure paginée
    else if (response.data.items && Array.isArray(response.data.items)) {
      vulnerabilities = response.data.items.map(normalizeVulnerability);
      totalCount = response.data.total_count || vulnerabilities.length;
    }
    else {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }
    
    // Mettre à jour le cache
    vulnerabilitiesCache = {
      data: vulnerabilities,
      filters: filters || {},
      timestamp: now,
      page,
      pageSize,
      totalCount
    };
    
    return {
      data: vulnerabilities,
      totalCount
    };
  } catch (error: any) {
    console.error('Error fetching vulnerabilities:', error);
    throw error;
  }
};

// Cache pour les détails de CVE
const cveDetailsCache = new Map();

// Fonction pour récupérer les détails d'une CVE spécifique avec mise en cache
export const fetchCVEDetails = async (cveId: string, forceRefresh = false) => {
  try {
    // Utiliser le cache si disponible et pas trop ancien (moins de 30 minutes)
    const now = Date.now();
    if (!forceRefresh && 
        cveDetailsCache.has(cveId) && 
        (now - cveDetailsCache.get(cveId).timestamp < 30 * 60 * 1000)) {
      console.log(`Utilisation des données en cache pour CVE ${cveId}`);
      return cveDetailsCache.get(cveId).data;
    }
    
    console.log(`Fetching details for CVE ${cveId}...`);
    const response = await api.get(`/cve/${cveId}`);
    
    // Mettre à jour le cache
    cveDetailsCache.set(cveId, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for CVE ${cveId}:`, error);
    throw error;
  }
};

// Fonction pour ajouter des sources à un collecteur
export const addSourceToCollector = async (collectorId: string, sourceIds: string[]) => {
  try {
    const response = await api.post(`/collectors/${collectorId}/sources`, { sourceIds });
    return response.data;
  } catch (error) {
    console.error(`Error adding sources to collector ${collectorId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une source d'un collecteur
export const removeSourceFromCollector = async (collectorId: string, sourceId: string) => {
  try {
    const response = await api.delete(`/collectors/${collectorId}/sources/${sourceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing source ${sourceId} from collector ${collectorId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une source OSINT
export const deleteOSINTSource = async (sourceId: string) => {
  try {
    const response = await intelligenceApi.delete(`/osint-sources/${sourceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting OSINT source ${sourceId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un groupe de sources OSINT
export const deleteOSINTSourceGroup = async (groupId: string) => {
  try {
    const response = await api.delete(`/osint-source-groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting OSINT source group ${groupId}:`, error);
    throw error;
  }
};

export const fetchVulnerabilityDetails = async (cveId: string) => {
  try {
    // Simulation de données pour le développement
    return {
      cve_id: cveId,
      description: 'This is a sample vulnerability description for testing purposes.',
      severity: 'CRITICAL',
      cvss_score: 9.8,
      cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      published_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
      status: 'OPEN',
      source: 'NVD',
      has_exploit: true,
      affected_products: ['Windows 10', 'Windows 11', 'Windows Server 2019'],
      references: [
        { url: 'https://nvd.nist.gov/vuln/detail/' + cveId, source: 'NVD' },
        { url: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=' + cveId, source: 'MITRE' }
      ],
      patches_available: true,
      mitigation: 'Update to the latest version of the affected software.'
    };
    
    // Implémentation réelle
    // const response = await axios.get(`/api/vulnerabilities/${cveId}`);
    // return response.data;
  } catch (error) {
    console.error(`Error fetching vulnerability details for ${cveId}:`, error);
    throw error;
  }
};

// Nouvelles fonctions pour les collecteurs et sources OSINT
export const createCollector = async (data: { name: string; description: string; api_url: string; api_key: string }) => {
  try {
    // N'envoie que les champs du node
    const payload = {
      name: data.name,
      description: data.description,
      api_url: data.api_url,
      api_key: data.api_key,
    };
    const response = await intelligenceApi.post('/collectors', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating collector:', error);
    throw error;
  }
};

export const deleteCollector = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/collectors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting collector ${id}:`, error);
    throw error;
  }
};

// Nouvelle fonction pour mettre à jour une source OSINT avec intelligenceApi
export const updateOsintSource = async (id: string, sourceData: any) => {
  try {
    const response = await intelligenceApi.put(`/osint-sources/${id}`, sourceData);
    return response.data;
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `API error ${error.response.status}: ${error.response.data?.message || error.message}`;
        console.error('API error details:', error.response.data);
      } else if (error.request) {
        errorMessage = 'No response received from API server. Check if the server is running.';
      } else {
        errorMessage = `Error setting up request: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error updating OSINT source ${id}:`, error);
    throw new Error(errorMessage);
  }
};

// Attributes API calls
export const fetchAttributes = async () => {
  try {
    const response = await intelligenceApi.get('/attributes');
    return response.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
    throw error;
  }
};

export const fetchAttribute = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/attributes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attribute ${id}:`, error);
    throw error;
  }
};

export const createAttribute = async (data: any) => {
  try {
    const response = await intelligenceApi.post('/attributes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating attribute:', error);
    throw error;
  }
};

export const updateAttribute = async (id: string, data: any) => {
  try {
    const response = await intelligenceApi.put(`/attributes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating attribute ${id}:`, error);
    throw error;
  }
};

export const deleteAttribute = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/attributes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting attribute ${id}:`, error);
    throw error;
  }
};

// New function for Word Lists
export const fetchWordLists = async (searchQuery: string = '') => {
  try {
    const url = searchQuery ? `/word-lists?search=${encodeURIComponent(searchQuery)}` : '/word-lists';
    const response = await intelligenceApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching word lists:', error);
    throw error;
  }
};

export const fetchWordListById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/word-lists/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching word list ${id}:`, error);
    throw error;
  }
};

// Remote Nodes API calls
export const fetchRemoteNodes = async (searchQuery: string = '') => {
  try {
    const url = searchQuery ? `/remote-nodes?search=${encodeURIComponent(searchQuery)}` : '/remote-nodes';
    const response = await intelligenceApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching remote nodes:', error);
    throw error;
  }
};

export const fetchRemoteNodeById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/remote-nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching remote node ${id}:`, error);
    throw error;
  }
};

export const createRemoteNode = async (data: any) => {
  try {
    const response = await intelligenceApi.post('/remote-nodes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating remote node:', error);
    throw error;
  }
};

export const updateRemoteNode = async (id: string, data: any) => {
  try {
    const response = await intelligenceApi.put(`/remote-nodes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating remote node ${id}:`, error);
    throw error;
  }
};

export const deleteRemoteNode = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/remote-nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting remote node ${id}:`, error);
    throw error;
  }
};

// Remote Access API calls
export const fetchRemoteAccesses = async (searchQuery: string = '') => {
  try {
    const url = searchQuery ? `/remote-accesses?search=${encodeURIComponent(searchQuery)}` : '/remote-accesses';
    const response = await intelligenceApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching remote accesses:', error);
    throw error;
  }
};

export const fetchRemoteAccessById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/remote-accesses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching remote access ${id}:`, error);
    throw error;
  }
};

export const createRemoteAccess = async (data: any) => {
  try {
    const response = await intelligenceApi.post('/remote-accesses', data);
    return response.data;
  } catch (error) {
    console.error('Error creating remote access:', error);
    throw error;
  }
};

export const updateRemoteAccess = async (id: string, data: any) => {
  try {
    const response = await intelligenceApi.put(`/remote-accesses/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating remote access ${id}:`, error);
    throw error;
  }
};

export const deleteRemoteAccess = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/remote-accesses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting remote access ${id}:`, error);
    throw error;
  }
};

// Report Item Types API call
export const fetchReportItemTypesSimple = async () => {
  try {
    const response = await intelligenceApi.get('/report-item-types-simple');
    // Ensure the response data is always an array, checking for an 'items' key first
    return response.data && response.data.items ? response.data.items : (Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error('Error fetching report item types:', error);
    throw error;
  }
};

// Bots Nodes API calls
export const fetchBotNodes = async () => {
  try {
    const response = await intelligenceApi.get('/bots-nodes');
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching bot nodes:', error);
    throw error;
  }
};

export const fetchBotNodeById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/bots-nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bot node ${id}:`, error);
    throw error;
  }
};

export const createBotNode = async (data: any) => {
  try {
    const response = await intelligenceApi.post('/bots-nodes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating bot node:', error);
    throw error;
  }
};

export const updateBotNode = async (id: string, data: any) => {
  try {
    const response = await intelligenceApi.put(`/bots-nodes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating bot node ${id}:`, error);
    throw error;
  }
};

export const deleteBotNode = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/bots-nodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting bot node ${id}:`, error);
    throw error;
  }
};

// Bots Presets API calls
export const fetchBotPresets = async () => {
  try {
    const response = await intelligenceApi.get('/bots-presets');
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching bot presets:', error);
    throw error;
  }
};

export const fetchBotPresetById = async (id: string) => {
  try {
    const response = await intelligenceApi.get(`/bots-presets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bot preset ${id}:`, error);
    throw error;
  }
};

export const createBotPreset = async (data: any) => {
  try {
    console.log('Sending bot preset data to API:', JSON.stringify(data, null, 2));
    const response = await intelligenceApi.post('/bots-presets', data);
    console.log('Bot preset created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating bot preset - Full error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Throw a more detailed error
      const errorMessage = error.response.data?.error || error.response.data?.message || JSON.stringify(error.response.data);
      throw new Error(`API Error ${error.response.status}: ${errorMessage}`);
    } else if (error.request) {
      console.error('Request error:', error.request);
      throw new Error('Network error - no response received');
    } else {
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

export const updateBotPreset = async (id: string, data: any) => {
  try {
    const response = await intelligenceApi.put(`/bots-presets/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating bot preset ${id}:`, error);
    throw error;
  }
};

export const deleteBotPreset = async (id: string) => {
  try {
    const response = await intelligenceApi.delete(`/bots-presets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting bot preset ${id}:`, error);
    throw error;
  }
};

// Bots Nodes Full API call (for dynamic forms)
export const fetchBotNodesFull = async () => {
  try {
    const response = await intelligenceApi.get('/bots-nodes-full');
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching full bot nodes data:', error);
    throw error;
  }
};

// Fonction pour récupérer les vulnérabilités de l'API Assess
export const fetchAssessVulnerabilities = async () => {
  try {
    const response = await intelligenceApi.get('/assess/vulnerabilities');
    return response.data && response.data.items ? response.data.items : response.data;
  } catch (error) {
    console.error('Error fetching Assess vulnerabilities:', error);
    throw error;
  }
};







