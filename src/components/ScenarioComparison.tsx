import React from 'react';
import { Check, ShieldAlert, DollarSign, TrendingDown, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OptimizationScenario } from '../types';
import { RiskBadge } from './RiskBadge';

export const ScenarioComparison: React.FC = () => {
  const { spans, settings, selectedScenario, setSelectedScenario, runOptimization } = useApp();

  // If scenarios haven't been generated in context yet, generate initial right now with defaults
  const scenarios = React.useMemo(() => {
    return runOptimization({
      monthlyBudget: 450000,
      numTeams: 6,
      productivityKmDay: 3.6,
      costPerKm: 4800,
      planningHorizonDays: 30,
      weights: {
        criticidade: 9,
        crescimento: 8,
        riscoAproximacao: 9,
        proximidadeGeo: 7,
        custoEquipe: 6,
        disponibilidade: 8,
        janelaClimatica: 7,
        prazoRegulatorio: 8,
        reincidencia: 6,
        orcamento: 7
      }
    });
  }, [spans]);

  const activeScen = selectedScenario || scenarios[1];

  return (
    <div className="space-y-6">
      {/* 3 Scenario Cards Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {scenarios.map((scen, idx) => {
          const isSelected = activeScen?.id === scen.id;
          const cardBg = isSelected
            ? 'bg-industrial-800 border-flora-cyan shadow-xl glow-cyan'
            : 'bg-industrial-800/70 border-industrial-600 hover:border-industrial-400';

          const headerColor = idx === 0
            ? 'text-flora-green'
            : idx === 1
            ? 'text-flora-cyan'
            : 'text-flora-orange';

          return (
            <div
              key={scen.id}
              onClick={() => setSelectedScenario(scen)}
              className={`border rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${headerColor} text-sm uppercase tracking-tight`}>
                    {scen.name}
                  </span>
                  {isSelected && (
                    <span className="bg-flora-cyan text-black px-2 py-0.5 rounded font-bold text-[10px]">
                      SELECIONADO
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-[11px] mb-4 min-h-[48px]">
                  {scen.description}
                </p>

                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-2.5 bg-industrial-900 p-3 rounded border border-industrial-700">
                  <div>
                    <span className="text-[10px] text-gray-400 block">CUSTO TOTAL ESTIMADO</span>
                    <span className="text-white font-bold text-sm">R$ {scen.totalCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">KM DE FAIXA TRATADOS</span>
                    <span className="text-white font-bold text-sm">{scen.totalKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">REDUÇÃO DE RISCO</span>
                    <span className="text-flora-green font-bold text-sm">-{scen.riskReductionPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">CRÍTICOS REMANESCENTES</span>
                    <span className={`font-bold text-sm ${scen.remainingCriticalCount > 0 ? 'text-flora-red' : 'text-flora-green'}`}>
                      {scen.remainingCriticalCount} vão(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-industrial-700/80 flex items-center justify-between text-[11px] text-gray-400">
                <span>Vãos Priorizados: <strong className="text-white">{scen.prioritySpans.length}</strong></span>
                <span>Equipes: <strong className="text-white">{scen.selectedTeamCount}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Comparative Table */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg font-mono text-xs">
        <div className="p-3 bg-industrial-900 border-b border-industrial-600 font-bold text-gray-300 uppercase tracking-wider">
          COMPARATIVO TÉCNICO DETALHADO DOS 3 CENÁRIOS VS. PLANEJAMENTO MANUAL
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-industrial-900/60 border-b border-industrial-700 text-[11px] text-gray-400 uppercase">
              <th className="py-3 px-4">Indicador Operacional</th>
              <th className="py-3 px-4 text-center">Planejamento Manual / Atual</th>
              <th className="py-3 px-4 text-center text-flora-green">1. Conservador (Custo)</th>
              <th className="py-3 px-4 text-center text-flora-cyan font-bold">2. Balanceado (Recomendado)</th>
              <th className="py-3 px-4 text-center text-flora-orange">3. Risco Mínimo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-700/60">
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Vãos Programados / Tratados</td>
              <td className="py-3 px-4 text-center text-gray-400">18 vãos</td>
              <td className="py-3 px-4 text-center text-white font-semibold">{scenarios[0].prioritySpans.length} vãos</td>
              <td className="py-3 px-4 text-center text-flora-cyan font-bold">{scenarios[1].prioritySpans.length} vãos</td>
              <td className="py-3 px-4 text-center text-white font-semibold">{scenarios[2].prioritySpans.length} vãos</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Extensão Coberta (km)</td>
              <td className="py-3 px-4 text-center text-gray-400">76.4 km</td>
              <td className="py-3 px-4 text-center text-white font-semibold">{scenarios[0].totalKm} km</td>
              <td className="py-3 px-4 text-center text-flora-cyan font-bold">{scenarios[1].totalKm} km</td>
              <td className="py-3 px-4 text-center text-white font-semibold">{scenarios[2].totalKm} km</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Custo Total de Execução (R$)</td>
              <td className="py-3 px-4 text-center text-gray-400">R$ 382.500</td>
              <td className="py-3 px-4 text-center text-flora-green font-bold">R$ {scenarios[0].totalCost.toLocaleString('pt-BR')}</td>
              <td className="py-3 px-4 text-center text-white font-bold">R$ {scenarios[1].totalCost.toLocaleString('pt-BR')}</td>
              <td className="py-3 px-4 text-center text-flora-orange font-bold">R$ {scenarios[2].totalCost.toLocaleString('pt-BR')}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Redução Estimada de Risco Elétrico</td>
              <td className="py-3 px-4 text-center text-gray-400">-48%</td>
              <td className="py-3 px-4 text-center text-white font-semibold">-{scenarios[0].riskReductionPercent}%</td>
              <td className="py-3 px-4 text-center text-flora-cyan font-bold">-{scenarios[1].riskReductionPercent}%</td>
              <td className="py-3 px-4 text-center text-flora-green font-bold">-{scenarios[2].riskReductionPercent}%</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Trechos Críticos Remanescentes</td>
              <td className="py-3 px-4 text-center text-flora-red font-bold">14 vãos sem roçada</td>
              <td className="py-3 px-4 text-center text-flora-yellow font-semibold">{scenarios[0].remainingCriticalCount} vãos</td>
              <td className="py-3 px-4 text-center text-flora-cyan font-bold">{scenarios[1].remainingCriticalCount} vãos</td>
              <td className="py-3 px-4 text-center text-flora-green font-bold">0 vãos (100% resolvido)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-300">Deslocamento Média Entre Vãos</td>
              <td className="py-3 px-4 text-center text-gray-400">28.4 km / ordem</td>
              <td className="py-3 px-4 text-center text-flora-green font-bold">12.1 km / ordem</td>
              <td className="py-3 px-4 text-center text-white font-semibold">18.5 km / ordem</td>
              <td className="py-3 px-4 text-center text-flora-orange">34.2 km / ordem</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
