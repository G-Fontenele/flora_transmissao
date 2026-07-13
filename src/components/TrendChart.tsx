import React from 'react';
import { MOCK_TREND_DATA } from '../data/mockData';

interface TrendChartProps {
  type?: 'vi' | 'km' | 'conformidade';
}

export const TrendChart: React.FC<TrendChartProps> = ({ type = 'vi' }) => {
  const data = MOCK_TREND_DATA;

  // Chart configuration depending on type
  const isVi = type === 'vi';
  const isKm = type === 'km';

  const rawValues = data.map(d => isVi ? d.viMedio : isKm ? d.kmCriticos : d.conformidade);
  const dataMax = Math.max(...rawValues);
  const dataMin = Math.min(...rawValues);

  const maxVal = isVi ? 1.0 : isKm ? Math.max(1200, Math.ceil((dataMax * 1.15) / 100) * 100) : 100;
  const minVal = isVi ? 0.0 : isKm ? 0 : Math.min(50, Math.floor(dataMin / 10) * 10);
  const range = (maxVal - minVal) || 1;

  // SVG coordinates [700 x 220]
  const points = data.map((d, index) => {
    const val = isVi ? d.viMedio : isKm ? d.kmCriticos : d.conformidade;
    const x = 50 + index * (600 / (Math.max(1, data.length - 1)));
    const y = 200 - ((val - minVal) / range) * 160;
    return { x, y, val, month: d.month };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;

  const strokeColor = isVi ? '#06b6d4' : isKm ? '#ef4444' : '#10b981';
  const fillColor = isVi ? 'rgba(6, 182, 212, 0.15)' : isKm ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';

  return (
    <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 font-mono select-none overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-industrial-700 pb-2">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          {isVi
            ? 'EVOLUÇÃO HISTÓRICA DO VEGETATION INDEX (VI) MÉDIO (6 MESES)'
            : isKm
            ? 'EXTENSÃO COM RISCO DE APROXIMAÇÃO CRÍTICO (KM / MÊS)'
            : 'PERCENTUAL DA MALHA EM CONFORMIDADE COM A FAIXA (%)'}
        </span>
        <span className="text-[11px] text-flora-cyan bg-industrial-900 px-2 py-0.5 rounded border border-industrial-700">
          Telemetria Satélite & Campo
        </span>
      </div>

      <div className="aspect-[16/5] w-full relative">
        <svg viewBox="0 0 700 230" className="w-full h-full overflow-hidden">
          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((frac, i) => {
            const y = 200 - frac * 160;
            const labelVal = isVi ? (minVal + frac * range).toFixed(2) : Math.round(minVal + frac * range);
            return (
              <g key={i}>
                <line x1="45" y1={y} x2="660" y2={y} stroke="#232d3b" strokeWidth="1" strokeDasharray="3 3" />
                <text x="38" y={y + 4} textAnchor="end" className="fill-gray-500 text-[10px]">
                  {labelVal}{!isVi && (isKm ? 'km' : '%')}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path d={areaD} fill={fillColor} />

          {/* Line curve */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />

          {/* Points & Values */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#0b0f14"
                stroke={strokeColor}
                strokeWidth="2.5"
                className="group-hover:r-7 transition-all"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                className="fill-white font-bold text-[11px] group-hover:fill-flora-cyan transition-colors"
              >
                {isVi ? pt.val.toFixed(2) : `${pt.val}${isKm ? 'km' : '%'}`}
              </text>
              <text
                x={pt.x}
                y="218"
                textAnchor="middle"
                className={`text-[10px] ${idx === points.length - 1 ? 'fill-flora-cyan font-bold' : 'fill-gray-400'}`}
              >
                {pt.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
