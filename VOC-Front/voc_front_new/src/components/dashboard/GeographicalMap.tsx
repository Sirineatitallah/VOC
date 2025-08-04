import React, { useState, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
// Supprimer d3-scale et d3-scale-chromatic car nous allons définir nos propres couleurs
// import { scaleSequential } from 'd3-scale';
// import { interpolateRdYlGn } from 'd3-scale-chromatic';

interface GeographicalMapProps {
  data: { name: string; value: number }[];
  width: number; // Ajouter explicitement la prop width
  height: number; // Ajouter explicitement la prop height
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Définir les couleurs pour chaque niveau de risque comme dans l'image de référence
const RISK_COLORS = {
  NO_DATA: "#D6D6DA", // Gris clair
  MAXIMAL: "#C00000", // Rouge foncé
  FORT: "#FF6600",   // Orange
  NOTABLE: "#FFFF00", // Jaune
  MODERE: "#92D050",  // Vert clair
  FAIBLE: "#00B050",  // Vert foncé
};

// Définir les seuils pour les niveaux de risque (ces valeurs sont arbitraires, ajuster au besoin)
// Basé sur l'image de référence: rang 1 à 20, rang 21 à 50, etc.
// Je vais utiliser des seuils pour les valeurs réelles de vulnérabilités
const getRiskColor = (value: number): string => {
  if (value === 0) return RISK_COLORS.NO_DATA;
  if (value >= 10000) return RISK_COLORS.MAXIMAL; // >10000 vulnérabilités
  if (value >= 5000) return RISK_COLORS.FORT;     // 5000-9999 vulnérabilités
  if (value >= 1000) return RISK_COLORS.NOTABLE;  // 1000-4999 vulnérabilités
  if (value >= 100) return RISK_COLORS.MODERE;   // 100-999 vulnérabilités
  if (value >= 1) return RISK_COLORS.FAIBLE;     // 1-99 vulnérabilités
  return RISK_COLORS.NO_DATA;
};


const GeographicalMap: React.FC<GeographicalMapProps> = ({ data, width, height }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // const maxVal = Math.max(...data.map(d => d.value)); // Plus nécessaire avec les couleurs fixes
  // Inverser le domaine pour que les valeurs plus élevées soient rouges (risque élevé)
  // const colorScale = scaleSequential(interpolateRdYlGn).domain([maxVal, 0]); // Plus nécessaire

  useEffect(() => {
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      console.log('Map Container Dimensions:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    }
  }, [width, height]);

  // Convertir les données en un format facile à consulter par code pays
  const dataMap: { [key: string]: number } = {};
  data.forEach(d => {
    dataMap[d.name] = d.value;
  });

  return (
    <div ref={mapContainerRef} style={{ position: 'relative', width: width, height: height }}>
      {hoveredCountry && (() => {
        console.log(`Tooltip is rendering for: ${hoveredCountry}, value: ${dataMap[hoveredCountry] || 0}, at pos: (${tooltipPos.x}, ${tooltipPos.y})`);
        return (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x + 10, // Décalage pour ne pas masquer le curseur
            top: tooltipPos.y + 10,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            zIndex: 10000,
            whiteSpace: 'nowrap',
            pointerEvents: 'none', // Empêche le tooltip de bloquer les événements de la carte
            border: '2px solid red', // Temporaire: pour la visibilité du débogage
          }}>
            {hoveredCountry}: {dataMap[hoveredCountry] || 0} vulnérabilités
          </div>
        );
      })()}

      <ComposableMap projection="geoEqualEarth" width={width} height={height}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const value = dataMap[countryName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getRiskColor(value)} // Utiliser notre fonction de couleur personnalisée
                  stroke="#EAEAEC"
                  strokeWidth={0.5}
                  onMouseEnter={(event) => {
                    console.log(`Hovering country: ${countryName}, Raw Mouse X: ${event.clientX}, Raw Mouse Y: ${event.clientY}`);
                    if (mapContainerRef.current) {
                      const rect = mapContainerRef.current.getBoundingClientRect();
                      setTooltipPos({
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                      });
                      console.log(`Calculated Tooltip Pos (relative to map): (${event.clientX - rect.left}, ${event.clientY - rect.top})`);
                    }
                    setHoveredCountry(countryName);
                  }}
                  onMouseLeave={() => {
                    console.log(`Leaving country: ${hoveredCountry}`);
                    setHoveredCountry(null);
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#606C88", cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 10000,
      }}>
        <h4 className="font-semibold mb-2">Légende des Risques</h4>
        <div className="flex flex-col space-y-1 text-sm">
          {[ 
            { label: 'Pas de données sur la période', color: RISK_COLORS.NO_DATA },
            { label: 'Pays à risque maximal (> 10000 vulnérabilités)', color: RISK_COLORS.MAXIMAL },
            { label: 'Pays à risque fort (5000-9999 vulnérabilités)', color: RISK_COLORS.FORT },
            { label: 'Pays à risque notable (1000-4999 vulnérabilités)', color: RISK_COLORS.NOTABLE },
            { label: 'Pays à risque modéré (100-999 vulnérabilités)', color: RISK_COLORS.MODERE },
            { label: 'Pays à risque faible (1-99 vulnérabilités)', color: RISK_COLORS.FAIBLE },
          ].map((item, index) => (
            <div key={index} className="flex items-center">
              <span
                style={{ backgroundColor: item.color }}
                className="w-4 h-4 rounded-sm mr-2 border border-gray-300"
              ></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeographicalMap; 