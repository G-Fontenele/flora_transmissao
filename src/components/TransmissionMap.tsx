import React, { useState, useMemo } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize2, AlertCircle } from 'lucide-react';
import { TransmissionSpan } from '../types';
import { useApp } from '../context/AppContext';

export type MapLayer = 'priority' | 'vi' | 'gr' | 'cr' | 'last_mowed';

interface TransmissionMapProps {
  layer?: MapLayer;
  onLayerChange?: (newLayer: MapLayer) => void;
  height?: string;
}

export const TransmissionMap: React.FC<TransmissionMapProps> = ({
  layer = 'priority',
  onLayerChange,
  height = 'h-[620px]'
}) => {
  const { spans, selectedSpan, setSelectedSpan, filterLine, filterRegion } = useApp();
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<MapLayer>(layer);

  const currentLayer = onLayerChange ? layer : activeLayer;
  const handleLayerSwitch = (l: MapLayer) => {
    if (onLayerChange) onLayerChange(l);
    else setActiveLayer(l);
  };

  // Filter spans for display
  const filteredSpans = useMemo(() => {
    return spans.filter(s => {
      const matchLine = filterLine === 'all' || s.lineName === filterLine;
      const matchReg = filterRegion === 'all' || s.region === filterRegion;
      return matchLine && matchReg;
    });
  }, [spans, filterLine, filterRegion]);

  // Map coordinates normalization into SVG viewport [1000 x 600]
  const renderedLines = useMemo(() => {
    // Group spans by line
    const byLine: { [key: string]: TransmissionSpan[] } = {};
    filteredSpans.forEach(s => {
      if (!byLine[s.lineName]) byLine[s.lineName] = [];
      byLine[s.lineName].push(s);
    });

    const linesArray = Object.entries(byLine).map(([lineName, lineSpans], lineIndex) => {
      // Sort towers sequentially by id/number
      const sorted = [...lineSpans].sort((a, b) => {
        const numA = parseInt(a.startTower.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.startTower.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      // Map latitude/longitude to X,Y coordinate layout for clear visual separation
      const yOffset = 140 + lineIndex * 160;
      const xStart = 80;
      const xStep = Math.min(80, 840 / Math.max(1, sorted.length));

      const points = sorted.map((s, idx) => {
        const x1 = xStart + idx * xStep;
        const y1 = yOffset + Math.sin(idx * 0.8) * 35;
        const x2 = xStart + (idx + 1) * xStep;
        const y2 = yOffset + Math.sin((idx + 1) * 0.8) * 35;

        return {
          span: s,
          x1,
          y1,
          x2,
          y2,
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2
        };
      });

      return { lineName, points, yOffset };
    });

    return linesArray;
  }, [filteredSpans]);

  const getSpanColor = (span: TransmissionSpan, l: MapLayer): string => {
    if (l === 'priority') {
      if (span.status === 'Critica') return '#ef4444'; // red
      if (span.status === 'Alta') return '#f97316';    // orange
      if (span.status === 'Atencao') return '#f59e0b'; // yellow
      return '#10b981';                                // green
    }
    if (l === 'vi') {
      if (span.vegetationIndex >= 0.8) return '#ef4444';
      if (span.vegetationIndex >= 0.65) return '#f97316';
      if (span.vegetationIndex >= 0.5) return '#f59e0b';
      return '#10b981';
    }
    if (l === 'gr') {
      if (span.growth30d >= 30) return '#ef4444';
      if (span.growth30d >= 20) return '#f97316';
      if (span.growth30d >= 12) return '#f59e0b';
      return '#10b981';
    }
    if (l === 'cr') {
      if (span.clearanceRisk >= 0.8) return '#ef4444';
      if (span.clearanceRisk >= 0.65) return '#f97316';
      if (span.clearanceRisk >= 0.5) return '#f59e0b';
      return '#10b981';
    }
    if (l === 'last_mowed') {
      // If mowed recently (2026), green; if older (2025), red/orange
      if (span.lastMowingDate.includes('2026-04') || span.lastMowingDate.includes('2026-03')) return '#10b981';
      if (span.lastMowingDate.includes('2026')) return '#06b6d4';
      return '#f97316';
    }
    return '#10b981';
  };

  return (
    <div className={`bg-industrial-800 border border-industrial-600 rounded-lg relative overflow-hidden flex flex-col ${height}`}>
      {/* Top Controls Overlay */}
      <div className="p-3 bg-industrial-900/90 border-b border-industrial-700 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-flora-cyan" />
          <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
            CAMADAS DO MAPA OPERACIONAL
          </span>
        </div>

        {/* Layer Selector */}
        <div className="flex bg-industrial-950 p-1 rounded border border-industrial-700 text-xs font-mono">
          <button
            onClick={() => handleLayerSwitch('priority')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentLayer === 'priority' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Priority Score
          </button>
          <button
            onClick={() => handleLayerSwitch('vi')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentLayer === 'vi' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Vegetation Index
          </button>
          <button
            onClick={() => handleLayerSwitch('gr')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentLayer === 'gr' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Growth Rate (30d)
          </button>
          <button
            onClick={() => handleLayerSwitch('cr')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentLayer === 'cr' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Clearance Risk
          </button>
          <button
            onClick={() => handleLayerSwitch('last_mowed')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentLayer === 'last_mowed' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Última Roçada
          </button>
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
            className="p-1.5 rounded bg-industrial-800 border border-industrial-600 text-gray-300 hover:bg-industrial-700"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.25))}
            className="p-1.5 rounded bg-industrial-800 border border-industrial-600 text-gray-300 hover:bg-industrial-700"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 rounded bg-industrial-800 border border-industrial-600 text-gray-300 hover:bg-industrial-700"
            title="Centralizar Grid"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="flex-1 relative bg-industrial-950 overflow-hidden cursor-grab active:cursor-grabbing select-none">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #344356 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* SVG Network Grid */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center'
          }}
        >
          <defs>
            <filter id="glow-danger" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="row-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {renderedLines.map((lineData) => (
            <g key={lineData.lineName} className="line-group">
              {/* Line Label */}
              <text
                x={80}
                y={lineData.yOffset - 45}
                className="fill-gray-400 font-mono text-[13px] font-bold tracking-wider uppercase"
              >
                ⚡ {lineData.lineName}
              </text>
              <line
                x1={80}
                y1={lineData.yOffset - 35}
                x2={920}
                y2={lineData.yOffset - 35}
                stroke="#232d3b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Spans and Right-of-Way Polygons */}
              {lineData.points.map((pt) => {
                const color = getSpanColor(pt.span, currentLayer);
                const isSelected = selectedSpan?.id === pt.span.id;
                const isCritical = pt.span.status === 'Critica';

                // Right of way simplified polygon around the span
                const rowTop = `${pt.x1},${pt.y1 - 22} ${pt.x2},${pt.y2 - 22} ${pt.x2},${pt.y2 + 22} ${pt.x1},${pt.y1 + 22}`;

                return (
                  <g
                    key={pt.span.id}
                    onClick={() => setSelectedSpan(pt.span)}
                    className="cursor-pointer group"
                  >
                    {/* Right-of-way corridor polygon */}
                    <polygon
                      points={rowTop}
                      fill={isCritical ? 'rgba(239, 68, 68, 0.12)' : 'url(#row-bg)'}
                      stroke={isSelected ? '#06b6d4' : isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(82, 101, 126, 0.2)'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all group-hover:fill-industrial-600/40"
                    />

                    {/* Critical Hotspot Pulse */}
                    {isCritical && (
                      <circle
                        cx={pt.midX}
                        cy={pt.midY}
                        r="14"
                        fill="rgba(239, 68, 68, 0.25)"
                        filter="url(#glow-danger)"
                        className="animate-ping"
                      />
                    )}

                    {/* Span Conductor Line */}
                    <line
                      x1={pt.x1}
                      y1={pt.y1}
                      x2={pt.x2}
                      y2={pt.y2}
                      stroke={color}
                      strokeWidth={isSelected ? 5 : isCritical ? 4 : 3}
                      strokeLinecap="round"
                      className="transition-all"
                    />

                    {/* Tower 1 */}
                    <rect
                      x={pt.x1 - 4}
                      y={pt.y1 - 10}
                      width="8"
                      height="20"
                      fill="#8498b3"
                      rx="1"
                      className="group-hover:fill-white transition-colors"
                    />
                    <text
                      x={pt.x1}
                      y={pt.y1 + 26}
                      textAnchor="middle"
                      className="fill-gray-500 font-mono text-[9px] group-hover:fill-gray-200 transition-colors"
                    >
                      {pt.span.startTower.replace('Torre ', 'T')}
                    </text>

                    {/* Tower 2 on last segment */}
                    {pt === lineData.points[lineData.points.length - 1] && (
                      <>
                        <rect
                          x={pt.x2 - 4}
                          y={pt.y2 - 10}
                          width="8"
                          height="20"
                          fill="#8498b3"
                          rx="1"
                        />
                        <text
                          x={pt.x2}
                          y={pt.y2 + 26}
                          textAnchor="middle"
                          className="fill-gray-500 font-mono text-[9px]"
                        >
                          {pt.span.endTower.replace('Torre ', 'T')}
                        </text>
                      </>
                    )}

                    {/* Priority Score / Metric badge on span midpoint */}
                    <g transform={`translate(${pt.midX - 14}, ${pt.midY - 26})`}>
                      <rect
                        width="28"
                        height="14"
                        rx="3"
                        fill="#0b0f14"
                        stroke={color}
                        strokeWidth="1.5"
                      />
                      <text
                        x="14"
                        y="10"
                        textAnchor="middle"
                        className="fill-white font-mono text-[9px] font-bold"
                      >
                        {currentLayer === 'priority' ? pt.span.priorityScore :
                         currentLayer === 'vi' ? (pt.span.vegetationIndex * 100).toFixed(0) :
                         currentLayer === 'gr' ? `+${pt.span.growth30d}%` :
                         (pt.span.clearanceRisk * 100).toFixed(0)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-3 left-3 bg-industrial-900/90 border border-industrial-700 rounded p-2.5 flex items-center gap-4 font-mono text-xs shadow-lg z-10">
          <span className="text-gray-400 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-flora-cyan" />
            LEGENDA DE CRITICIDADE:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-flora-green inline-block" />
            <span className="text-gray-300">Normal (&lt;40)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-flora-yellow inline-block" />
            <span className="text-gray-300">Atenção (40-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-flora-orange inline-block" />
            <span className="text-gray-300">Alta (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-flora-red inline-block animate-pulse" />
            <span className="text-flora-red font-bold">Crítica (≥80)</span>
          </div>
          <span className="text-gray-500 text-[10px] pl-2 border-l border-industrial-700">
            Clique em qualquer vão para inspecionar
          </span>
        </div>
      </div>
    </div>
  );
};
