import React, { useState } from 'react';
import { Sliders, Zap, DollarSign, Users, Calendar, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OptimizationInputs, OptimizationWeights } from '../services/optimizerEngine';
import { ScenarioComparison } from './ScenarioComparison';

export const OptimizationPanel: React.FC = () => {
  const { runOptimization, selectedScenario, setSelectedScenario, applyScenarioToSchedule, spans } = useApp();
  const [hasRun, setHasRun] = useState(false);
  const [applied, setApplied] = useState(false);

  // Operational parameters
  const [budget, setBudget] = useState<number>(450000);
  const [teams, setTeams] = useState<number>(6);
  const [productivity, setProductivity] = useState<number>(3.6);
  const [costKm, setCostKm] = useState<number>(4800);
  const [horizon, setHorizon] = useState<number>(30);

  // Multicriteria weights (1 to 10)
  const [weights, setWeights] = useState<OptimizationWeights>({
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
  });

  const handleWeightChange = (key: keyof OptimizationWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleExecuteOptimization = () => {
    const inputs: OptimizationInputs = {
      monthlyBudget: budget,
      numTeams: teams,
      productivityKmDay: productivity,
      costPerKm: costKm,
      planningHorizonDays: horizon,
      weights
    };
    runOptimization(inputs);
    setHasRun(true);
    setApplied(false);
  };

  const handleApplyScenario = () => {
    if (!selectedScenario) return;
    applyScenarioToSchedule(selectedScenario);
    setApplied(true);
    setTimeout(() => setApplied(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-flora-cyan via-transparent to-flora-green"
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 font-mono text-xs">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-flora-cyan font-bold uppercase">
              <Zap className="w-4 h-4" />
              SIMULADOR E MOTOR HEURÍSTICO FLORA DE ALOCAÇÃO ÓTIMA
            </div>
            <h2 className="text-lg font-bold text-white font-sans tracking-tight">
              Otimização Multicritério do Calendário de Roçadas e Inspeções
            </h2>
            <p className="text-gray-400">
              Ajuste restrições orçamentárias, capacidade operacional e pesos de risco da vegetação para gerar e comparar simultaneamente 3 cenários operacionais estratégicos.
            </p>
          </div>

          <button
            onClick={handleExecuteOptimization}
            className="px-6 py-3.5 bg-flora-cyan text-black font-bold font-mono rounded-lg hover:bg-flora-cyan/90 transition-all shadow-lg glow-cyan flex items-center justify-center gap-2.5 text-sm shrink-0"
          >
            <Play className="w-4 h-4 fill-black" />
            CALCULAR E SIMULAR 3 CENÁRIOS
          </button>
        </div>
      </div>

      {/* Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Left Col: Operational Restraints Inputs */}
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-4 shadow-lg">
          <div className="border-b border-industrial-700 pb-2.5 flex items-center gap-2 font-bold text-white uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-flora-cyan" />
            1. RESTRIÇÕES OPERACIONAIS & ORÇAMENTO
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold">
                <span>Orçamento Mensal Disponível:</span>
                <span className="text-flora-cyan font-bold">R$ {budget.toLocaleString('pt-BR')}</span>
              </div>
              <input
                type="range"
                min={150000}
                max={1200000}
                step={25000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-flora-cyan cursor-pointer bg-industrial-900 rounded h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>R$ 150k</span>
                <span>R$ 600k</span>
                <span>R$ 1.2M</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block text-[11px] mb-1">Equipes Ativas (Campos):</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="number"
                    value={teams}
                    onChange={(e) => setTeams(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-industrial-900 border border-industrial-600 rounded pl-9 pr-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block text-[11px] mb-1">Produtividade (km/dia):</label>
                <input
                  type="number"
                  step="0.2"
                  value={productivity}
                  onChange={(e) => setProductivity(Math.max(0.5, Number(e.target.value)))}
                  className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block text-[11px] mb-1">Custo Médio/km (R$):</label>
                <input
                  type="number"
                  step="100"
                  value={costKm}
                  onChange={(e) => setCostKm(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block text-[11px] mb-1">Horizonte (Dias):</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="number"
                    value={horizon}
                    onChange={(e) => setHorizon(Math.max(7, Number(e.target.value)))}
                    className="w-full bg-industrial-900 border border-industrial-600 rounded pl-9 pr-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-industrial-900/80 rounded border border-industrial-700 text-[11px] text-gray-400 space-y-1">
              <span className="text-gray-300 font-bold block">Capacidade Teórica de Execução:</span>
              <p>
                • {teams} equipes × {productivity} km/dia × {horizon} dias = <strong className="text-white">{(teams * productivity * horizon).toFixed(0)} km máximos</strong> cobertos no ciclo.
              </p>
            </div>
          </div>
        </div>

        {/* Middle & Right Cols: 10 Weights Sliders */}
        <div className="lg:col-span-2 bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-4 shadow-lg">
          <div className="border-b border-industrial-700 pb-2.5 flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-flora-yellow" />
              2. CALIBRAR PESOS DOS 10 CRITÉRIOS DE PRIORIZAÇÃO (1 a 10)
            </span>
            <button
              onClick={() => setWeights({
                criticidade: 9, crescimento: 8, riscoAproximacao: 9, proximidadeGeo: 7,
                custoEquipe: 6, disponibilidade: 8, janelaClimatica: 7, prazoRegulatorio: 8,
                reincidencia: 6, orcamento: 7
              })}
              className="text-[11px] text-flora-cyan hover:underline"
            >
              Restaurar Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            {[
              { key: 'criticidade', label: '1. Criticidade da Vegetação (VI/Priority Score)', color: 'accent-flora-red' },
              { key: 'crescimento', label: '2. Taxa de Crescimento Observado (30d)', color: 'accent-flora-yellow' },
              { key: 'riscoAproximacao', label: '3. Risco Elétrico de Aproximação (Clearance)', color: 'accent-flora-orange' },
              { key: 'proximidadeGeo', label: '4. Proximidade Geográfica & Deslocamento', color: 'accent-flora-cyan' },
              { key: 'custoEquipe', label: '5. Otimização de Custo / Tarifas de Equipe', color: 'accent-flora-green' },
              { key: 'disponibilidade', label: '6. Disponibilidade Operacional da Equipe', color: 'accent-flora-cyan' },
              { key: 'janelaClimatica', label: '7. Janela Climática Favorable (Chuva/Vento)', color: 'accent-flora-yellow' },
              { key: 'prazoRegulatorio', label: '8. Prazo Regulatório ANEEL & ONS', color: 'accent-flora-red' },
              { key: 'reincidencia', label: '9. Histórico de Reincidência no Vão', color: 'accent-flora-orange' },
              { key: 'orcamento', label: '10. Respeito Rigoroso ao Teto Orçamentário', color: 'accent-flora-green' }
            ].map(item => (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-gray-300 text-[11px]">
                  <span>{item.label}</span>
                  <span className="font-bold text-white bg-industrial-900 px-1.5 py-0.5 rounded border border-industrial-700">
                    {weights[item.key as keyof OptimizationWeights]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={weights[item.key as keyof OptimizationWeights]}
                  onChange={(e) => handleWeightChange(item.key as keyof OptimizationWeights, Number(e.target.value))}
                  className={`w-full ${item.color} cursor-pointer bg-industrial-900 rounded h-2`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenarios Comparison Section */}
      {hasRun && (
        <div className="space-y-4 pt-4 border-t border-industrial-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Comparativo de Cenários Gerados pelo Otimizador
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Selecione o cenário desejado abaixo e clique em aplicar para aprovar e transferir automaticamente as ordens para o Calendário Operacional.
              </p>
            </div>

            {selectedScenario && (
              <button
                onClick={handleApplyScenario}
                disabled={applied}
                className={`px-5 py-2.5 rounded font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                  applied
                    ? 'bg-flora-green text-black'
                    : 'bg-flora-green text-black hover:bg-flora-green/90 glow-green'
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    CENÁRIO APLICADO COM SUCESSO!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    APLICAR E AGENDAR: {selectedScenario.name.split('(')[0]}
                  </>
                )}
              </button>
            )}
          </div>

          <ScenarioComparison />
        </div>
      )}
    </div>
  );
};
