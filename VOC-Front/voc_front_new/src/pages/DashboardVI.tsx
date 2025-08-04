import React, { useState, useEffect, useTransition } from 'react';
import { fetchDashboardData } from '../utils/api';
import { Vulnerability, VulnerabilitySummary, SeveritySummary, StatusSummary } from '../types';
import { 
  getSeverityColor,
  getStatusColor,
  calculateRiskScore,
  isHighRisk
} from '../utils/helpers';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import VulnerabilityTable from '../components/dashboard/VulnerabilityTable';
import VulnerabilityDetail from '../components/dashboard/VulnerabilityDetail';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import { AlertTriangle, ShieldAlert, ShieldCheck, Clock, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import AdvancedCharts from '../components/dashboard/AdvancedCharts';

// Fonction de tri personnalisée pour les vulnérabilités
const customCveSort = (a: Vulnerability, b: Vulnerability) => {
  const yearA = new Date(a.published_date).getFullYear();
  const yearB = new Date(b.published_date).getFullYear();

  // Prioriser 2025 puis 2024
  const isYearAPrioritized = yearA === 2025 || yearA === 2024;
  const isYearBPrioritized = yearB === 2025 || yearB === 2024;

  if (isYearAPrioritized && !isYearBPrioritized) return -1; // A est prioritaire
  if (!isYearAPrioritized && isYearBPrioritized) return 1;  // B est prioritaire

  // Si les deux sont prioritaires ou aucun ne l'est, trier par année décroissante puis par date de publication décroissante
  if (yearA !== yearB) {
    return yearB - yearA; // Tri par année décroissante
  }

  // Tri par date de publication décroissante (plus récent en premier)
  return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
};

const DashboardVI: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [summary, setSummary] = useState<VulnerabilitySummary | null>(null);
  const [severitySummary, setSeveritySummary] = useState<SeveritySummary[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [riskStats, setRiskStats] = useState<{
    high_risk_count: number;
    has_poc_count: number;
    exploit_percent: number;
  }>({
    high_risk_count: 0,
    has_poc_count: 0,
    exploit_percent: 0
  });
  const [allVulnerabilities, setAllVulnerabilities] = useState<Vulnerability[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(500); // Limité à 500 vulnérabilités
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const [sortField, setSortField] = useState<keyof Vulnerability>('published_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Vérifier si une recherche est présente dans l'URL
    const searchParams = new URLSearchParams(window.location.search);
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
    
    // Force refresh on initial load
    fetchData(1, false, true); 
    const interval = setInterval(() => fetchData(1, false, true), 300000); // Refresh every 5 minutes, force refresh
    return () => clearInterval(interval);
  }, [retryCount, searchQuery]);

  const fetchData = async (page: number = 1, append: boolean = false, forceRefresh: boolean = false) => {
    if (page === 1) {
    setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      console.log('Fetching dashboard data for page:', page, 'Force Refresh:', forceRefresh);
      
      const data = await fetchDashboardData(page, pageSize, forceRefresh);
      console.log('Dashboard data received:', data);
      
      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }
      
      // Mettre à jour les données du tableau de bord
      setDashboardData(data);
      setTotalPages(Math.ceil(data.total_count / pageSize));
      
      // Traiter les vulnérabilités
      let processedVulnerabilities: Vulnerability[] = [];
      if (data.items && Array.isArray(data.items)) {
        processedVulnerabilities = data.items.map((vuln: any): Vulnerability => ({
          cve_id: vuln.cve_id || '',
          title: vuln.title || '',
          description: vuln.description || '',
          severity: vuln.severity?.toUpperCase() || 'UNKNOWN',
          cvss_score: Number(vuln.cvss_score) || 0,
          epss_score: Number(vuln.epss_score) || 0,
          epss_percentile: Number(vuln.epss_percentile) || 0,
          published_date: vuln.published_date || new Date().toISOString(),
          vendor: vuln.vendor || 'Unknown',
          product: vuln.product || 'Unknown',
          is_kev: Boolean(vuln.is_kev),
          has_poc: Boolean(vuln.has_poc),
          has_template: Boolean(vuln.has_template),
          reported_on_hackerone: Boolean(vuln.reported_on_hackerone),
          status: (vuln.status?.toUpperCase() || 'OPEN'),
          taranis_link: vuln.taranis_link || null,
          affected_systems: Number(vuln.affected_systems) || 0,
          source: vuln.source || 'NVD',
          tags: vuln.tags || '',
          family: vuln.family || 'Unknown',
          country: vuln.country || 'Unknown',
          region: vuln.region || 'Unknown',
          risk_score: Number(vuln.risk_score) || 0.0,
          taranis_collected_date: vuln.taranis_collected_date || new Date().toISOString(),
          last_updated_at: vuln.last_updated_at || new Date().toISOString(),
          cwe_id: vuln.cwe_id || ''
        }));
      }
      
      // Appliquer le tri personnalisé
      processedVulnerabilities.sort(customCveSort);

      // Mettre à jour les vulnérabilités
      let currentVulnerabilities: Vulnerability[];
      if (append) {
        currentVulnerabilities = [...allVulnerabilities, ...processedVulnerabilities];
      } else {
        currentVulnerabilities = processedVulnerabilities;
      }

      setAllVulnerabilities(currentVulnerabilities);
      setVulnerabilities(currentVulnerabilities);
      
      // Mettre à jour le résumé
      setSummary({
        total: data.total_count || 0,
        critical: currentVulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        high: currentVulnerabilities.filter(v => v.severity === 'HIGH').length,
        medium: currentVulnerabilities.filter(v => v.severity === 'MEDIUM').length,
        low: currentVulnerabilities.filter(v => v.severity === 'LOW').length,
        inProgress: currentVulnerabilities.filter(v => v.status === 'IN_PROGRESS').length,
        closed: currentVulnerabilities.filter(v => v.status === 'CLOSED').length,
        open: currentVulnerabilities.filter(v => v.status === 'OPEN').length
      });

      // Mettre à jour les statistiques de risque
      const highRiskVulns = currentVulnerabilities.filter(v => 
        (Number(v.cvss_score) >= 9) || 
        (v.is_kev && Number(v.cvss_score) >= 7) || 
        (v.has_poc && Number(v.cvss_score) >= 7)
      );
      
      const exploitableVulns = currentVulnerabilities.filter(v => 
        v.has_poc || v.has_template
      );
      
        setRiskStats({
          high_risk_count: highRiskVulns.length,
          has_poc_count: exploitableVulns.length,
        exploit_percent: currentVulnerabilities.length > 0 
          ? Math.round((exploitableVulns.length / currentVulnerabilities.length) * 100) 
            : 0
        });
      
      // Mettre à jour les données de sévérité
      const severityData = [
        { severity: 'CRITICAL', count: currentVulnerabilities.filter(v => v.severity === 'CRITICAL').length },
        { severity: 'HIGH', count: currentVulnerabilities.filter(v => v.severity === 'HIGH').length },
        { severity: 'MEDIUM', count: currentVulnerabilities.filter(v => v.severity === 'MEDIUM').length },
        { severity: 'LOW', count: currentVulnerabilities.filter(v => v.severity === 'LOW').length },
        { severity: 'UNKNOWN', count: currentVulnerabilities.filter(v => !v.severity || v.severity === 'UNKNOWN').length }
      ];
        setSeveritySummary(severityData);
      
      // Mettre à jour les données de statut
      const statusData = [
        { status: 'OPEN', count: currentVulnerabilities.filter(v => v.status === 'OPEN').length },
        { status: 'IN_PROGRESS', count: currentVulnerabilities.filter(v => v.status === 'IN_PROGRESS').length },
        { status: 'CLOSED', count: currentVulnerabilities.filter(v => v.status === 'CLOSED').length }
      ];
        setStatusSummary(statusData);
      
      setLastUpdated(new Date());
      setLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Erreur lors du chargement des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSort = (field: keyof Vulnerability) => {
    setSortDirection(prevDir => (
      sortField === field ? (prevDir === 'asc' ? 'desc' : 'asc') : 'desc'
    ));
    setSortField(field);
  };

  const getFormattedLastUpdated = () => {
    const hours = lastUpdated.getHours().toString().padStart(2, '0');
    const minutes = lastUpdated.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Ajouter des logs pour déboguer
  useEffect(() => {
    console.log('Current vulnerabilities:', allVulnerabilities.length);
    console.log('Current risk stats:', riskStats);
    console.log('Current severity summary:', severitySummary);
    console.log('Current status summary:', statusSummary);
  }, [allVulnerabilities, riskStats, severitySummary, statusSummary]);

  // Préparer les données pour les graphiques
  const severityChartData = severitySummary.map(item => ({
    name: item.severity,
    value: item.count,
    color: getSeverityColor(item.severity)
  }));

  const statusChartData = statusSummary.map(item => ({
    name: item.status,
    value: item.count,
    color: getStatusColor(item.status)
  }));

  // Données pour les graphiques à barres
  const vendorChartData = dashboardData?.vendor_dist ? {
    labels: dashboardData.vendor_dist.map((item: any) => item.vendor).slice(0, 5),
    datasets: [
      {
        data: dashboardData.vendor_dist.map((item: any) => item.count).slice(0, 5),
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',   // Rouge pour les éléments critiques
          'rgba(234, 88, 12, 0.8)',   // Orange pour les éléments importants
          'rgba(59, 130, 246, 0.8)',  // Bleu professionnel
          'rgba(16, 185, 129, 0.8)',  // Vert professionnel
          'rgba(139, 92, 246, 0.8)'   // Violet professionnel
        ],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 20,
        maxBarThickness: 30
      }
    ]
  } : {
    labels: ['Microsoft', 'Cisco', 'Apple', 'Apache', 'Adobe'],
    datasets: [
      {
        data: [42, 38, 35, 30, 25],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',   // Rouge pour les éléments critiques
          'rgba(234, 88, 12, 0.8)',   // Orange pour les éléments importants
          'rgba(59, 130, 246, 0.8)',  // Bleu professionnel
          'rgba(16, 185, 129, 0.8)',  // Vert professionnel
          'rgba(139, 92, 246, 0.8)'   // Violet professionnel
        ],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 20,
        maxBarThickness: 30
      }
    ]
  };

  // Fonction améliorée pour calculer la distribution CVSS avec les nouvelles plages
  const calculateCvssDistribution = () => {
    if (allVulnerabilities.length === 0) {
      return {
        labels: ['0-4', '4-7', '7-9', '9-10'],
        datasets: [
          {
            data: [0, 0, 0, 0],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',  // Vert professionnel pour 0-4
              'rgba(234, 179, 8, 0.8)',   // Jaune pour 4-7
              'rgba(234, 88, 12, 0.8)',   // Orange pour 7-9
              'rgba(220, 38, 38, 0.8)'    // Rouge pour 9-10 (critique)
            ],
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20,
            maxBarThickness: 30
          }
        ]
      };
    }

    // Compter les vulnérabilités par plage de score CVSS selon les nouvelles plages
    const range0to4 = allVulnerabilities.filter(v => {
      const score = v.cvss_score ?? 0; // Utiliser l'opérateur de coalescing nullish pour gérer null
      return score >= 0 && score <= 4;
    }).length;
    const range4to7 = allVulnerabilities.filter(v => {
      const score = v.cvss_score ?? 0;
      return score > 4 && score <= 7;
    }).length;
    const range7to9 = allVulnerabilities.filter(v => {
      const score = v.cvss_score ?? 0;
      return score > 7 && score <= 9;
    }).length;
    const range9to10 = allVulnerabilities.filter(v => {
      const score = v.cvss_score ?? 0;
      return score > 9 && score <= 10;
    }).length;

    console.log('CVSS Distribution:', { range0to4, range4to7, range7to9, range9to10 });

    return {
      labels: ['0-4', '4-7', '7-9', '9-10'],
      datasets: [
        {
          data: [range0to4, range4to7, range7to9, range9to10],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // Vert professionnel pour 0-4
            'rgba(234, 179, 8, 0.8)',   // Jaune pour 4-7
            'rgba(234, 88, 12, 0.8)',   // Orange pour 7-9
            'rgba(220, 38, 38, 0.8)'    // Rouge pour 9-10 (critique)
          ],
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 20,
          maxBarThickness: 30
        }
      ]
    };
  };

  // Utiliser cette nouvelle fonction pour les données du graphique
  const cvssDistributionData = calculateCvssDistribution();

  const handleLoadMore = async () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchData(nextPage, true);
    }
  };

  // Afficher un indicateur de chargement
  if (loading && allVulnerabilities.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Chargement du tableau de bord...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Cela peut prendre quelques instants</p>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-red-500 mb-4">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Erreur</h2>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          <RefreshCw className="h-4 w-4 mr-1 inline" />
          Réessayer
        </button>
      </div>
    );
  }

  // Vérifier si les données sont disponibles
  if (!summary && allVulnerabilities.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-yellow-500 mb-4">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Aucune donnée disponible</h2>
        <p className="text-gray-500 dark:text-gray-400">Impossible de charger les données du tableau de bord.</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          <RefreshCw className="h-4 w-4 mr-1 inline" />
          Réessayer
        </button>
      </div>
    );
  }

  // Modifions également la façon dont nous affichons les cartes pour forcer l'affichage des valeurs
  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Résumé des Vulnérabilités</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Période: <strong>7 jours</strong>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            Dernière mise à jour: <strong>{getFormattedLastUpdated()}</strong>
          </span>
          <button 
            onClick={() => {
              handleRefresh();
              // Ajouter un délai pour recalculer les statistiques après le rafraîchissement
              setTimeout(() => {
                if (allVulnerabilities.length > 0) {
                  console.log('Recalculating stats after refresh');
                  const highRiskVulns = allVulnerabilities.filter(v => {
                    const cvssScore = Number(v.cvss_score) || 0;
                    const isKev = v.is_kev; 
                    const hasPoc = v.has_poc; 
                    
                    return cvssScore >= 9 || (isKev && cvssScore >= 7) || (hasPoc && cvssScore >= 7);
                  });
                  
                  const exploitableVulns = allVulnerabilities.filter(v => {
                    const hasPoc = v.has_poc;
                    const hasTemplate = v.has_template;
                    
                    return hasPoc || hasTemplate;
                  });
                  
                  setRiskStats({
                    high_risk_count: highRiskVulns.length,
                    has_poc_count: exploitableVulns.length,
                    exploit_percent: allVulnerabilities.length > 0 
                      ? Math.round((exploitableVulns.length / allVulnerabilities.length) * 100) 
                      : 0
                  });
                }
              }, 2000);
            }}
            className="btn-secondary flex items-center text-sm"
            disabled={isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isPending ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Vulnérabilités" 
          value={summary?.total || 0} 
          icon={<AlertTriangle className="h-6 w-6 text-primary-500" />}
          trend={0}
          href="/vi/vulnerabilities"
        />
        <StatCard 
          title="Critiques" 
          value={summary?.critical || 0} 
          icon={<ShieldAlert className="h-6 w-6 text-red-500" />}
          trend={0}
          href="/vi/critical"
        />
        <StatCard 
          title="Haut Risque" 
          value={riskStats.high_risk_count} 
          icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
          trend={0}
          href="/vi/high-risk"
          badge={`Score > 12 ou CVSS ≥ 9`}
        />
        <StatCard 
          title="Avec Exploit" 
          value={riskStats.has_poc_count} 
          icon={<ShieldCheck className="h-6 w-6 text-purple-500" />}
          trend={0}
          href="/vi/with-exploit"
          badge={`${riskStats.exploit_percent}% du total`}
        />
      </div>

      {/* Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Vulnérabilités Critiques">
          {allVulnerabilities.filter(v => v.severity === 'CRITICAL').length > 0 ? (
            <>
              <VulnerabilityTable 
                vulnerabilities={allVulnerabilities
                  .filter(v => v.severity === 'CRITICAL')
                  .slice(0, 5)} 
                onViewDetails={setSelectedVulnerability}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <div className="mt-4 text-right">
                <a 
                  href="/dashboard/vi/critical" 
                  className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center justify-end"
                >
                  Voir toutes les vulnérabilités critiques
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Aucune vulnérabilité critique trouvée</p>
            </div>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Vulnérabilités par criticité">
            {allVulnerabilities.length > 0 ? (
              <StatusDistributionChart 
                data={[
                  { name: 'CRITICAL', value: allVulnerabilities.filter(v => v.severity === 'CRITICAL').length },
                  { name: 'HIGH', value: allVulnerabilities.filter(v => v.severity === 'HIGH').length },
                  { name: 'MEDIUM', value: allVulnerabilities.filter(v => v.severity === 'MEDIUM').length },
                  { name: 'LOW', value: allVulnerabilities.filter(v => v.severity === 'LOW').length },
                  { name: 'UNKNOWN', value: allVulnerabilities.filter(v => !v.severity || v.severity === 'UNKNOWN').length }
                ]} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
              </div>
            )}
          </ChartCard>
          <ChartCard title="Répartition par statut">
            {allVulnerabilities.length > 0 ? (
              <StatusDistributionChart 
                data={[
                  { name: 'OPEN', value: allVulnerabilities.filter(v => v.status === 'OPEN').length },
                  { name: 'IN_PROGRESS', value: allVulnerabilities.filter(v => v.status === 'IN_PROGRESS').length },
                  { name: 'CLOSED', value: allVulnerabilities.filter(v => v.status === 'CLOSED').length }
                ]} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* More charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top CVEs détectées">
          <BarChart data={vendorChartData} />
        </ChartCard>
        <ChartCard title="Distribution des scores CVSS">
          {allVulnerabilities.length > 0 ? (
            <BarChart data={cvssDistributionData} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Nouveaux graphiques avancés */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Analyses Avancées</h2>
        <AdvancedCharts vulnerabilities={allVulnerabilities} />
      </div>

      {/* Modal for vulnerability details */}
      {selectedVulnerability && (
        <VulnerabilityDetail 
          vulnerability={selectedVulnerability} 
          onClose={() => setSelectedVulnerability(null)}
        />
      )}

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {hasLoadedAll ? (
            `Toutes les vulnérabilités chargées (${allVulnerabilities.length} au total)`
          ) : (
            `Page ${currentPage} sur ${totalPages} • ${allVulnerabilities.length} vulnérabilités chargées sur ${dashboardData?.total_count || 0}`
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setCurrentPage(1);
              setHasLoadedAll(false);
              fetchData(1, false);
            }}
            disabled={currentPage === 1 || isLoadingMore}
            className="btn-secondary flex items-center text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Première page
          </button>
          <button
            onClick={handleLoadMore}
            disabled={currentPage >= totalPages || isLoadingMore || hasLoadedAll}
            className="btn-secondary flex items-center text-sm"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Charger plus
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardVI;
