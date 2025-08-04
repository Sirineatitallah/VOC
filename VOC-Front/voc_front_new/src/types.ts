// Assurons-nous que le type Vulnerability contient tous les champs de la base de données
export interface Vulnerability {
  cve_id: string;
  title: string;
  description: string;
  severity: string;
  cvss_score: number | null;
  epss_score: number | null;
  epss_percentile: number | null;
  is_kev: boolean;
  published_date: string;
  vendor: string;
  product: string;
  has_poc: boolean;
  has_template: boolean;
  reported_on_hackerone: boolean;
  taranis_link: string | null;
  taranis_collected_date: string | null;
  last_updated_at: string;
  status: string;
  source: string;
  tags: string;
  affected_systems: number;
  risk_score: number;
  family: string;
  country: string;
  region: string;
  cwe_id: string;
}

export interface VulnerabilitySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  inProgress: number;
  closed: number;
  open: number;
  percentageClosed?: number;
}

export interface SeveritySummary {
  severity: string;
  count: number;
}

export interface StatusSummary {
  status: string;
  count: number;
}