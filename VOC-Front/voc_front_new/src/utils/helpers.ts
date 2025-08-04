import { Vulnerability, VulnerabilitySummary, SeveritySummary, StatusSummary, VendorSummary, ProductSummary } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const calculateVulnerabilitySummary = (vulnerabilities: Vulnerability[]): VulnerabilitySummary => {
  const total = vulnerabilities.length;
  const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
  const closed = vulnerabilities.filter(v => v.status === 'CLOSED').length;
  const inProgress = vulnerabilities.filter(v => v.status === 'IN_PROGRESS').length;
  const open = vulnerabilities.filter(v => v.status === 'OPEN').length;
  const percentageClosed = total > 0 ? Math.round((closed / total) * 100) : 0;

  return {
    total,
    critical,
    closed,
    inProgress,
    open,
    percentageClosed
  };
};

export const calculateSeveritySummary = (vulnerabilities: Vulnerability[]): SeveritySummary[] => {
  const severityCounts = vulnerabilities.reduce((acc, vulnerability) => {
    const severity = vulnerability.severity;
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(severityCounts).map(([severity, count]) => ({
    severity: severity as any,
    count
  }));
};

export const calculateStatusSummary = (vulnerabilities: Vulnerability[]): StatusSummary[] => {
  const statusCounts = vulnerabilities.reduce((acc, vulnerability) => {
    const status = vulnerability.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status as any,
    count
  }));
};

export const getTopVendors = (vulnerabilities: Vulnerability[], limit: number = 10): VendorSummary[] => {
  const vendorCounts = vulnerabilities.reduce((acc, vulnerability) => {
    const vendor = vulnerability.vendor;
    acc[vendor] = (acc[vendor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(vendorCounts)
    .map(([vendor, count]) => ({ vendor, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getTopProducts = (vulnerabilities: Vulnerability[], limit: number = 10): ProductSummary[] => {
  const productCounts = vulnerabilities.reduce((acc, vulnerability) => {
    const product = vulnerability.product;
    acc[product] = (acc[product] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(productCounts)
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getCvssScoreRanges = (vulnerabilities: Vulnerability[]): { range: string; count: number }[] => {
  const ranges = [
    { min: 0, max: 1.9, label: '0-1.9' },
    { min: 2, max: 3.9, label: '2-3.9' },
    { min: 4, max: 5.9, label: '4-5.9' },
    { min: 6, max: 7.9, label: '6-7.9' },
    { min: 8, max: 8.9, label: '8-8.9' },
    { min: 9, max: 10, label: '9-10' }
  ];

  const scoreCounts = ranges.map(range => {
    const count = vulnerabilities.filter(v => 
      v.cvss_score >= range.min && v.cvss_score <= range.max
    ).length;
    
    return {
      range: range.label,
      count
    };
  });

  return scoreCounts;
};

export const getSeverityColor = (severity: string): string => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return '#b91c1c'; // Red-700
    case 'HIGH':
      return '#ea580c'; // Orange
    case 'MEDIUM':
      return '#eab308'; // Yellow
    case 'LOW':
      return '#1d4ed8'; // Blue-700
    case 'UNKNOWN':
      return '#6b7280'; // Gray
    case 'NONE':
      return '#9ca3af'; // Light Gray
    case 'N/A':
      return '#d1d5db'; // Very Light Gray
    default:
      return '#6b7280';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return '#b91c1c'; // Red-700
    case 'CLOSED':
      return '#16a34a'; // Green
    case 'IN_PROGRESS':
      return '#d97706'; // Amber-600
    default:
      return '#6b7280';
  }
};

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return dateString;
  }
};

export const translateSeverity = (severity: string): string => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'Critique';
    case 'HIGH':
      return 'Élevée';
    case 'MEDIUM':
      return 'Moyenne';
    case 'LOW':
      return 'Faible';
    default:
      return severity;
  }
};

export const translateStatus = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return 'Ouvert';
    case 'CLOSED':
      return 'Fermé';
    case 'IN_PROGRESS':
      return 'En cours';
    default:
      return status;
  }
};

// Add risk score calculation function
export const calculateRiskScore = (vulnerability: Vulnerability): number => {
  const { cvss_score, is_kev, has_poc, epss_score } = vulnerability;
  
  // Base score is CVSS
  let risk_score = cvss_score || 0;
  
  // Add multipliers for KEV, PoC and EPSS
  const kevMultiplier = is_kev ? 0.5 : 0;
  const pocMultiplier = has_poc ? 0.5 : 0;
  const epssMultiplier = epss_score || 0;
  
  // Calculate final score
  risk_score = risk_score * (1 + kevMultiplier + pocMultiplier + epssMultiplier);
  
  return parseFloat(risk_score.toFixed(2));
};

// Function to determine if a vulnerability is high risk
export const isHighRisk = (vulnerability: Vulnerability): boolean => {
  const risk_score = calculateRiskScore(vulnerability);
  return risk_score > 12 || vulnerability.cvss_score >= 9;
};
