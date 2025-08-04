import React, { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSeverityColor, getStatusColor } from '../../utils/helpers'; // Importation des fonctions de couleur

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

// Définir des couleurs spécifiques pour chaque statut/sévérité
// Ces couleurs ne sont plus nécessaires ici car nous utiliserons les fonctions importées
// const SEVERITY_COLORS: Record<string, string> = {
//   'CRITICAL': '#dc2626',
//   'HIGH': '#ea580c',
//   'MEDIUM': '#eab308',
//   'LOW': '#2563eb',
//   'UNKNOWN': '#6b7280',
//   'NONE': '#9ca3af',
//   'N/A': '#d1d5db',
//   'OPEN': '#dc2626',
//   'IN_PROGRESS': '#f59e0b',
//   'CLOSED': '#16a34a'
// };

// Couleurs de secours si le statut n'est pas dans la liste (peut être maintenu pour les cas non gérés par les helpers)
const FALLBACK_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
  // Filter out entries with zero value
  const filteredData = data.filter(item => item.value > 0);
  
  // Log data for debugging
  useEffect(() => {
    console.log('StatusDistributionChart received data:', data);
    console.log('Filtered data:', filteredData);
  }, [data]);
  
  // Fonction pour obtenir la couleur en fonction du nom (sévérité ou statut)
  const getColor = (name: string, index: number) => {
    // Déterminer si le nom correspond à une sévérité ou un statut
    const isSeverity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN', 'NONE', 'N/A'].includes(name.toUpperCase());
    const isStatus = ['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(name.toUpperCase());

    if (isSeverity) {
      return getSeverityColor(name);
    } else if (isStatus) {
      return getStatusColor(name);
    } else {
      // Fallback pour les noms non reconnus
      return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    }
  };
  
  // Préparer les données pour Chart.js
  const chartData = {
    labels: filteredData.map(item => item.name),
    datasets: [
      {
        data: filteredData.map(item => item.value),
        backgroundColor: filteredData.map((item, index) => getColor(item.name, index)),
        borderColor: filteredData.map((item, index) => getColor(item.name, index)),
        borderWidth: 1,
      },
    ],
  };
  
  // Options pour le graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1a2234' : '#ffffff',
        titleColor: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
        bodyColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };
  
  return (
    <div className="h-[200px] w-full">
      {filteredData.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          <div>
            <p className="text-center mb-2">Aucune donnée disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDistributionChart;
