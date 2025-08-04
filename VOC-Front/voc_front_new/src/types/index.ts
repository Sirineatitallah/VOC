export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Status = 'OPEN' | 'CLOSED' | 'IN_PROGRESS';

export interface Vulnerability {
  cve_id: string;
  title: string;
  description: string;
  cwe_id: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  vuln_status: string | null;
  cvss_score: number;
  cvss_vector: string | null;
  epss_score: number;
  epss_percentile: number;
  is_kev: boolean;
  published_date: string;
  nvd_last_modified: string | null;
  vendor: string;
  product: string;
  has_poc: boolean;
  has_template: boolean;
  reported_on_hackerone: boolean;
  taranis_link: string | null;
  taranis_collected_date: string | null;
  last_updated_at: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  source: string | null;
  tags: string | null;
  family: string | null;
  country: string | null;
  region: string | null;
}

export interface VulnerabilityFilters {
  severity?: string;
  status?: string;
  vendor?: string;
  product?: string;
  kev?: string;
  has_poc?: string;
  cvss_min?: number;
  cvss_max?: number;
  epss_min?: number;
  epss_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface VulnerabilitySummary {
  total: number;
  critical: number;
  closed: number;
  inProgress: number;
  open: number;
  percentageClosed: number;
}

export interface RiskStats {
  high_risk_count: number;
  has_poc_count: number;
  exploit_percent: number;
}

export interface VendorSummary {
  vendor: string;
  count: number;
}

export interface ProductSummary {
  product: string;
  count: number;
}

export interface SeveritySummary {
  severity: Severity;
  count: number;
}

export interface StatusSummary {
  status: Status;
  count: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface DailyVulnerabilities {
  date: string;
  count: number;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
