import React, { useState, useMemo } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize2, AlertCircle, MapPin, Zap } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TransmissionSpan, Substation, TransmissionLine } from '../types';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSTATIONS, MOCK_TRANSMISSION_LINES } from '../data/mockData';

export type MapLayer = 'priority' | 'vi' | 'gr' | 'cr' | 'last_mowed' | 'voltage';

interface TransmissionMapProps {
  layer?: MapLayer;
  onLayerChange?: (newLayer: MapLayer) => void;
  height?: string;
}

// Helper component to center and zoom map when filters change
const MapController: React.FC<{ bounds: L.LatLngBoundsExpression | null }> = ({ bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true });
      } catch (e) {
        // Fallback center Brazil
        map.setView([-14.235, -51.925], 5);
      }
    }
  }, [bounds, map]);
  return null;
};

export const TransmissionMap: React.FC<TransmissionMapProps> = ({
  layer = 'priority',
  onLayerChange,
  height = 'h-[620px]'
}) => {
  const { spans, selectedSpan, setSelectedSpan, filterLine, filterRegion, filterSubsystem, filterState, filterVoltage, searchText } = useApp();
  const [activeLayer, setActiveLayer] = useState<MapLayer>(layer);
  const [selectedSE, setSelectedSE] = useState<Substation | null>(null);

  const currentLayer = onLayerChange ? layer : activeLayer;
  const handleLayerSwitch = (l: MapLayer) => {
    if (onLayerChange) onLayerChange(l);
    else setActiveLayer(l);
  };

  // Filter lines based on all global filters
  const filteredLines = useMemo(() => {
    return MOCK_TRANSMISSION_LINES.filter(l => {
      if (filterLine && filterLine !== 'all' && l.name !== filterLine && l.id !== filterLine) return false;
      if (filterSubsystem && filterSubsystem !== 'all' && l.subsystem !== filterSubsystem) return false;
      if (filterState && filterState !== 'all' && l.stateDe !== filterState && l.statePara !== filterState) return false;
      if (filterVoltage && filterVoltage !== 'all' && l.voltageKv.toString() !== filterVoltage) return false;
      if (filterRegion && filterRegion !== 'all' && !l.subsystem.includes(filterRegion)) return false;
      if (searchText && searchText.trim() !== '') {
        const q = searchText.toLowerCase().trim();
        const matchName = l.name.toLowerCase().includes(q);
        const matchSE = l.substationDe.toLowerCase().includes(q) || l.substationPara.toLowerCase().includes(q);
        const matchAgent = l.ownerAgent.toLowerCase().includes(q);
        if (!matchName && !matchSE && !matchAgent) return false;
      }
      return true;
    });
  }, [filterLine, filterSubsystem, filterState, filterVoltage, filterRegion, searchText]);

  // Filter substations to those connected to filtered lines or matching search
  const filteredSubstations = useMemo(() => {
    const seNames = new Set<string>();
    filteredLines.forEach(l => {
      seNames.add(l.substationDe.toUpperCase());
      seNames.add(l.substationPara.toUpperCase());
    });
    return MOCK_SUBSTATIONS.filter(s => seNames.has(s.name.toUpperCase()) || seNames.has(s.id.toUpperCase()));
  }, [filteredLines]);

  // Calculate bounds to auto-fit map
  const mapBounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (filteredLines.length === 0) return [[-33.7, -73.9], [5.2, -34.7]]; // Brazil bounds
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    let count = 0;
    filteredLines.forEach(l => {
      if (l.latDe < minLat) minLat = l.latDe;
      if (l.latDe > maxLat) maxLat = l.latDe;
      if (l.lonDe < minLon) minLon = l.lonDe;
      if (l.lonDe > maxLon) maxLon = l.lonDe;
      if (l.latPara < minLat) minLat = l.latPara;
      if (l.latPara > maxLat) maxLat = l.latPara;
      if (l.lonPara < minLon) minLon = l.lonPara;
      if (l.lonPara > maxLon) maxLon = l.lonPara;
      count += 2;
    });
    if (count === 0 || minLat === maxLat) return [[-33.7, -73.9], [5.2, -34.7]];
    return [[minLat - 0.5, minLon - 0.5], [maxLat + 0.5, maxLon + 0.5]];
  }, [filteredLines]);

  // Color logic for spans/lines
  const getSpanColor = (span: TransmissionSpan, l: MapLayer, voltageKv?: number): string => {
    if (l === 'voltage') {
      const kv = voltageKv || 230;
      if (kv >= 765) return '#a855f7'; // Purple (765/800 kV)
      if (kv >= 500) return '#00E5FF'; // Cyan (500/525 kV)
      if (kv >= 345) return '#FFB800'; // Yellow (345/440 kV)
      return '#00D26A';                // Green (230 kV)
    }
    if (l === 'priority') {
      if (span.status === 'Critica') return '#FF2E2E';
      if (span.status === 'Alta') return '#FF6B00';
      if (span.status === 'Atencao') return '#FFB800';
      return '#00D26A';
    }
    if (l === 'vi') {
      if (span.vegetationIndex >= 0.8) return '#FF2E2E';
      if (span.vegetationIndex >= 0.65) return '#FF6B00';
      if (span.vegetationIndex >= 0.5) return '#FFB800';
      return '#00D26A';
    }
    if (l === 'gr') {
      if (span.growth30d >= 30) return '#FF2E2E';
      if (span.growth30d >= 20) return '#FF6B00';
      if (span.growth30d >= 12) return '#FFB800';
      return '#00D26A';
    }
    if (l === 'cr') {
      if (span.clearanceRisk >= 0.8) return '#FF2E2E';
      if (span.clearanceRisk >= 0.65) return '#FF6B00';
      if (span.clearanceRisk >= 0.5) return '#FFB800';
      return '#00D26A';
    }
    if (l === 'last_mowed') {
      if (span.lastMowingDate.includes('2026-04') || span.lastMowingDate.includes('2026-03')) return '#00D26A';
      if (span.lastMowingDate.includes('2026')) return '#00E5FF';
      return '#FF6B00';
    }
    return '#00D26A';
  };

  const getVoltageBadgeColor = (kv: number) => {
    if (kv >= 765) return 'bg-purple-900/40 text-purple-300 border-purple-500';
    if (kv >= 500) return 'bg-cyan-900/40 text-cyan-300 border-cyan-500';
    if (kv >= 345) return 'bg-yellow-900/40 text-yellow-300 border-yellow-500';
    return 'bg-emerald-900/40 text-emerald-300 border-emerald-500';
  };

  return (
    <div className={`bg-industrial-800 border border-industrial-600 rounded-lg relative overflow-hidden flex flex-col ${height}`}>
      {/* Top Controls Overlay */}
      <div className="p-3 bg-industrial-900/95 border-b border-industrial-700 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-flora-cyan" />
          <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
            SIN — SISTEMA INTERLIGADO NACIONAL ({filteredLines.length} LTs ATIVAS)
          </span>
        </div>

        {/* Layer Selector */}
        <div className="flex bg-industrial-950 p-1 rounded border border-industrial-700 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => handleLayerSwitch('priority')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentLayer === 'priority'
                ? 'bg-flora-cyan text-industrial-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            PRIORIDADE (ANEEL)
          </button>
          <button
            onClick={() => handleLayerSwitch('voltage')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentLayer === 'voltage'
                ? 'bg-flora-cyan text-industrial-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TENSÃO (kV)
          </button>
          <button
            onClick={() => handleLayerSwitch('vi')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentLayer === 'vi'
                ? 'bg-flora-cyan text-industrial-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            VEGETAÇÃO (VI)
          </button>
          <button
            onClick={() => handleLayerSwitch('cr')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentLayer === 'cr'
                ? 'bg-flora-cyan text-industrial-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RISCO CATENÁRIA (CR)
          </button>
          <button
            onClick={() => handleLayerSwitch('gr')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentLayer === 'gr'
                ? 'bg-flora-cyan text-industrial-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CRESCIMENTO 30D
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative z-10">
        <MapContainer
          center={[-14.235, -51.925]}
          zoom={5}
          className="w-full h-full"
          attributionControl={true}
          zoomControl={true}
        >
          {/* CartoDB Dark Matter Base Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | ONS & SIN Data'
          />

          <MapController bounds={mapBounds} />

          {/* Render Transmission Line Spans */}
          {filteredLines.map((line) => {
            return line.spans.map((span) => {
              const lat1 = span.latStart ?? line.latDe;
              const lon1 = span.lonStart ?? line.lonDe;
              const lat2 = span.latEnd ?? line.latPara;
              const lon2 = span.lonEnd ?? line.lonPara;
              
              if (lat1 === lat2 && lon1 === lon2) return null;

              const color = getSpanColor(span, currentLayer, line.voltageKv);
              const isSelected = selectedSpan?.id === span.id;
              
              return (
                <Polyline
                  key={span.id}
                  positions={[[lat1, lon1], [lat2, lon2]]}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    weight: isSelected ? 5 : line.voltageKv >= 500 ? 3.5 : 2.5,
                    opacity: isSelected ? 1 : 0.85,
                    dashArray: isSelected ? '4, 4' : undefined
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedSpan(span);
                    }
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-mono">
                      <div className="font-bold text-flora-cyan mb-1">{span.lineName}</div>
                      <div className="text-gray-300 text-xs">Vão: <span className="text-white font-semibold">{span.startTower} ➔ {span.endTower}</span></div>
                      <div className="text-gray-300 text-xs">Tensão: <span className="text-white font-semibold">{line.voltageKv} kV</span> | Comprimento: <span className="text-white font-semibold">{span.lengthKm} km</span></div>
                      <div className="text-gray-300 text-xs">Prioridade: <span className="text-amber-400 font-bold">{span.priorityScore}/100</span> ({span.status})</div>
                      <div className="text-gray-400 text-[10px] mt-1 italic">Clique no vão para abrir a inspeção técnica completa</div>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            });
          })}

          {/* Render Substation Markers (Visible when zoomed or filtered <= 200 SEs) */}
          {filteredSubstations.length <= 400 && filteredSubstations.map((se) => (
            <CircleMarker
              key={se.id}
              center={[se.lat, se.lon]}
              radius={se.voltageLevel >= 500 ? 5 : 3.5}
              pathOptions={{
                color: se.voltageLevel >= 500 ? '#00E5FF' : '#FFB800',
                fillColor: '#0a0e14',
                fillOpacity: 1,
                weight: 2
              }}
              eventHandlers={{
                click: () => {
                  setSelectedSE(se);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <div className="font-mono text-xs font-bold text-gray-200">
                  SE {se.name} ({se.voltageLevel} kV) - {se.state}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Substation Info Overlay / Modal when SE is clicked */}
      {selectedSE && (
        <div className="absolute top-16 left-4 z-30 bg-industrial-900 border border-industrial-600 rounded-lg p-4 shadow-2xl max-w-sm animate-fade-in font-mono">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">SUBESTAÇÃO {selectedSE.name}</h4>
                <span className="text-[10px] text-gray-400">ID ONS: {selectedSE.id}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedSE(null)}
              className="text-gray-400 hover:text-white text-sm font-bold px-1.5 py-0.5 rounded hover:bg-industrial-800"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-industrial-700 pt-2.5 mb-3">
            <div>
              <span className="text-gray-400 text-[11px] block">Nível de Tensão</span>
              <span className="text-white font-bold">{selectedSE.voltageLevel} kV</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Subsistema</span>
              <span className="text-white font-bold">{selectedSE.subsystem}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Estado (UF)</span>
              <span className="text-white font-bold">{selectedSE.stateName} ({selectedSE.state})</span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] block">Coordenadas</span>
              <span className="text-gray-300 font-mono text-[10px]">{selectedSE.lat.toFixed(2)}, {selectedSE.lon.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-industrial-700 pt-2">
            Ponto terminal de interconexão da rede básica do Sistema Interligado Nacional (SIN).
          </div>
        </div>
      )}

      {/* Bottom Legend Overlay */}
      <div className="p-2.5 bg-industrial-900/95 border-t border-industrial-700 flex flex-wrap items-center justify-between text-xs font-mono z-20 gap-3">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Legenda de Cores:</span>
          
          {currentLayer === 'voltage' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">765 / 800 kV (Extra-Alta)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                <span className="text-gray-300 text-[11px]">500 / 525 kV (Tronco SIN)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">345 / 440 kV</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">230 kV</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse"></span>
                <span className="text-gray-300 text-[11px]">Crítico / Emergência (Score ≥ 80)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">Risco Alto (Score 60-79)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">Atenção (Score 40-59)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-gray-300 text-[11px]">Conformidade Normal (Score &lt; 40)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-flora-cyan" />
          <span>Clique em qualquer vão ou subestação para inspecionar</span>
        </div>
      </div>
    </div>
  );
};
