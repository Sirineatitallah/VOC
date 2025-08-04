// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.44:5000';
export const INTELLIGENCE_API_BASE_URL = import.meta.env.VITE_INTELLIGENCE_API_URL || 'http://localhost:5001/api';

// API Endpoints
export const API_ENDPOINTS = {
  // CVE Feed endpoints
  CVE_FEED: '/api/cvefeed',
  CVE_DETAILS: '/api/cvefeed/cve',
  
  // Intelligence Center endpoints
  OSINT_SOURCES: '/api/assess/osint-sources',
  OSINT_SOURCE_GROUPS: '/api/assess/osint-source-groups',
  COLLECTORS: '/api/collectors',
  ROLES: '/api/access-control/roles',
  ACLS: '/api/access-control/acls',
  ATTRIBUTES: '/api/attributes',
  WORD_LISTS: '/api/word-lists',
  REMOTE_NODES: '/api/remote-nodes',
  REMOTE_ACCESSES: '/api/remote-accesses',
  BOTS_NODES: '/api/bots-nodes',
  BOTS_PRESETS: '/api/bots-presets'
};