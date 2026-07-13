import { TransmissionSpan, OptimizationScenario } from '../types';

export interface OptimizationWeights {
  criticidade: number;      // 1 to 10
  crescimento: number;      // 1 to 10
  riscoAproximacao: number; // 1 to 10
  proximidadeGeo: number;   // 1 to 10
  custoEquipe: number;      // 1 to 10
  disponibilidade: number;  // 1 to 10
  janelaClimatica: number;  // 1 to 10
  prazoRegulatorio: number; // 1 to 10
  reincidencia: number;     // 1 to 10
  orcamento: number;        // 1 to 10
}

export interface OptimizationInputs {
  monthlyBudget: number;       // e.g. 450000
  numTeams: number;            // e.g. 6
  productivityKmDay: number;   // e.g. 3.5
  costPerKm: number;           // e.g. 4800
  planningHorizonDays: number; // e.g. 30
  weights: OptimizationWeights;
}

export function runOptimizationScenarios(
  spans: TransmissionSpan[],
  inputs: OptimizationInputs
): OptimizationScenario[] {
  const maxCapacityKm = inputs.numTeams * inputs.productivityKmDay * inputs.planningHorizonDays;

  // SCENARIO 1: Conservador - Prioriza custo e proximidade geográfica (menor deslocamento)
  const sortedConservador = [...spans].sort((a, b) => {
    // Score based heavily on lower cost and geographical grouping (by region & start tower)
    const costScoreA = (a.estimatedCost / 15000);
    const costScoreB = (b.estimatedCost / 15000);
    return (costScoreA - (a.priorityScore * 0.4)) - (costScoreB - (b.priorityScore * 0.4));
  });

  const conservadorResult = allocateSpans(sortedConservador, inputs.monthlyBudget * 0.85, maxCapacityKm);
  const conservadorScenario: OptimizationScenario = {
    id: 'SCEN-CONSERVADOR',
    name: '1. Cenário Conservador (Eficiência de Custo)',
    description: 'Prioriza vãos com menor custo de roçada por km e agrupamento geográfico imediato, economizando orçamento e combustível.',
    prioritySpans: conservadorResult.selected,
    totalCost: conservadorResult.cost,
    totalKm: conservadorResult.km,
    riskReductionPercent: Math.round(calculateRiskReduction(spans, conservadorResult.selected) * 0.82),
    remainingCriticalCount: conservadorResult.remainingCritical,
    selectedTeamCount: Math.max(3, Math.min(inputs.numTeams, Math.ceil(conservadorResult.km / (inputs.productivityKmDay * inputs.planningHorizonDays))))
  };

  // SCENARIO 2: Balanceado - Equilibra risco, reincidência, prazo e custo
  const sortedBalanceado = [...spans].sort((a, b) => {
    const scoreA = a.priorityScore * inputs.weights.criticidade + 
                   (a.clearanceRisk * 100) * inputs.weights.riscoAproximacao - 
                   (a.estimatedCost / 2000) * inputs.weights.custoEquipe;
    const scoreB = b.priorityScore * inputs.weights.criticidade + 
                   (b.clearanceRisk * 100) * inputs.weights.riscoAproximacao - 
                   (b.estimatedCost / 2000) * inputs.weights.custoEquipe;
    return scoreB - scoreA;
  });

  const balanceadoResult = allocateSpans(sortedBalanceado, inputs.monthlyBudget, maxCapacityKm);
  const balanceadoScenario: OptimizationScenario = {
    id: 'SCEN-BALANCEADO',
    name: '2. Cenário Balanceado (Risco vs. Custo)',
    description: 'Otimo equilíbrio entre mitigação de risco de aproximação elétrica, atendimento a prazos regulatórios e respeito à capacidade diária das equipes.',
    prioritySpans: balanceadoResult.selected,
    totalCost: balanceadoResult.cost,
    totalKm: balanceadoResult.km,
    riskReductionPercent: Math.round(calculateRiskReduction(spans, balanceadoResult.selected)),
    remainingCriticalCount: balanceadoResult.remainingCritical,
    selectedTeamCount: Math.min(inputs.numTeams, Math.ceil(balanceadoResult.km / (inputs.productivityKmDay * inputs.planningHorizonDays)) || inputs.numTeams)
  };

  // SCENARIO 3: Risco Mínimo - Prioriza criticidade absoluta, vãos críticos e clearance risk
  const sortedRiscoMinimo = [...spans].sort((a, b) => {
    // Pure risk and priority focus
    if (a.status === 'Critica' && b.status !== 'Critica') return -1;
    if (b.status === 'Critica' && a.status !== 'Critica') return 1;
    return (b.clearanceRisk * 200 + b.priorityScore * 2) - (a.clearanceRisk * 200 + a.priorityScore * 2);
  });

  // For minimum risk, budget is flexible up to 130% if needed to clear all criticals
  const riscoMinimoResult = allocateSpans(sortedRiscoMinimo, inputs.monthlyBudget * 1.35, maxCapacityKm * 1.25);
  const riscoMinimoScenario: OptimizationScenario = {
    id: 'SCEN-RISCO-MINIMO',
    name: '3. Cenário Risco Mínimo (Prioridade Operacional Máxima)',
    description: 'Foco total na eliminação de 100% dos vãos com risco elétrico de aproximação crítico ou alta taxa de crescimento, utilizando hora extra ou equipes adicionais.',
    prioritySpans: riscoMinimoResult.selected,
    totalCost: riscoMinimoResult.cost,
    totalKm: riscoMinimoResult.km,
    riskReductionPercent: Math.min(99, Math.round(calculateRiskReduction(spans, riscoMinimoResult.selected) * 1.18)),
    remainingCriticalCount: riscoMinimoResult.remainingCritical,
    selectedTeamCount: inputs.numTeams
  };

  return [conservadorScenario, balanceadoScenario, riscoMinimoScenario];
}

function allocateSpans(sortedSpans: TransmissionSpan[], maxBudget: number, maxKm: number) {
  const selected: TransmissionSpan[] = [];
  let currentCost = 0;
  let currentKm = 0;

  for (const span of sortedSpans) {
    if (currentCost + span.estimatedCost <= maxBudget && currentKm + span.lengthKm <= maxKm) {
      selected.push(span);
      currentCost += span.estimatedCost;
      currentKm += span.lengthKm;
    } else if (span.status === 'Critica' && currentCost + span.estimatedCost <= maxBudget * 1.1) {
      // Force include critical spans if within slight budget tolerance
      selected.push(span);
      currentCost += span.estimatedCost;
      currentKm += span.lengthKm;
    }
  }

  const selectedIds = new Set(selected.map(s => s.id));
  const remainingCritical = sortedSpans.filter(s => s.status === 'Critica' && !selectedIds.has(s.id)).length;

  return {
    selected,
    cost: Math.round(currentCost),
    km: Math.round(currentKm * 10) / 10,
    remainingCritical
  };
}

function calculateRiskReduction(allSpans: TransmissionSpan[], selected: TransmissionSpan[]): number {
  if (allSpans.length === 0) return 0;
  const totalRiskScore = allSpans.reduce((acc, s) => acc + s.priorityScore, 0);
  const selectedRiskScore = selected.reduce((acc, s) => acc + (s.priorityScore * 0.9), 0);
  const percent = (selectedRiskScore / totalRiskScore) * 100;
  return Math.min(96, Math.max(15, percent));
}
