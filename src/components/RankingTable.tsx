import React, { useMemo } from 'react';
import { AlertCircle, ChevronRight, Activity } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { useApp } from '../context/AppContext';

interface RankingTableProps {
  limit?: number;
}

export const RankingTable: React.FC<RankingTableProps> = ({ limit = 8 }) => {
  const { spans, setSelectedSpan, filterLine, filterRegion } = useApp();

  const rankedSpans = useMemo(() => {
    return spans
      .filter(s => {
        const matchLine = filterLine === 'all' || s.lineName === filterLine;
        const matchReg = filterRegion === 'all' || s.region === filterRegion;
        return matchLine && matchReg;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);
  }, [spans, filterLine, filterRegion, limit]);

  return (
    <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-hidden shadow-lg">
      <div className="p-3 bg-industrial-900 border-b border-industrial-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-flora-red" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            RANKING OPERACIONAL DOS VÃOS MAIS CRÍTICOS (PRIORITY SCORE)
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-400 bg-industrial-950 px-2 py-0.5 rounded border border-industrial-700">
          Top {limit} Trechos
        </span>
      </div>

      <table className="w-full text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="bg-industrial-900/60 border-b border-industrial-700 text-[10px] text-gray-400 uppercase">
            <th className="py-2.5 px-3 text-center w-12">Pos.</th>
            <th className="py-2.5 px-3">Linha / Vão</th>
            <th className="py-2.5 px-3">Região</th>
            <th className="py-2.5 px-3 text-right">Extensão</th>
            <th className="py-2.5 px-3 text-right">VI</th>
            <th className="py-2.5 px-3 text-right">GR 30d</th>
            <th className="py-2.5 px-3 text-right">Risk (CR)</th>
            <th className="py-2.5 px-3 text-center">Priority</th>
            <th className="py-2.5 px-3 text-center">Criticidade</th>
            <th className="py-2.5 px-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-industrial-700/60">
          {rankedSpans.map((span, index) => {
            return (
              <tr
                key={span.id}
                onClick={() => setSelectedSpan(span)}
                className="hover:bg-industrial-700/50 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3 text-center font-bold text-gray-400">
                  #{index + 1}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{span.startTower} ➔ {span.endTower}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate block max-w-[200px]">
                    {span.lineName}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-300 whitespace-nowrap">
                  {span.region}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  {span.lengthKm} km
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-gray-200">
                  {span.vegetationIndex.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-flora-yellow">
                  +{span.growth30d}%
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-flora-orange">
                  {span.clearanceRisk.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="bg-industrial-900 border border-flora-red/40 px-2 py-0.5 rounded font-bold text-flora-red">
                    {span.priorityScore}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <RiskBadge criticidade={span.status} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpan(span);
                    }}
                    className="p-1 rounded bg-industrial-700 text-gray-300 hover:text-white hover:bg-flora-cyan hover:text-black inline-flex items-center gap-1 text-[11px]"
                  >
                    Inspecionar
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
