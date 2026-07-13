import { Criticidade, TransmissionSpan } from '../types';

export interface PriorityBreakdown {
  viScore: number;
  crScore: number;
  grScore: number;
  recScore: number;
  urgScore: number;
  total: number;
  criticidade: Criticidade;
}

/**
 * Priority Score calculation exact to FLORA specifications:
 * 0.35 * VI (normalized to 100)
 * + 0.25 * CR (normalized to 100)
 * + 0.20 * GR 30d (normalized to 100 max 50%)
 * + 0.10 * Recurrence (normalized to 100)
 * + 0.10 * Urgency (normalized to 100)
 */
export function calculatePriorityScore(
  vi: number,
  cr: number,
  gr30d: number,
  recurrence: number,
  urgency: number
): PriorityBreakdown {
  const viScore = Math.min(100, Math.max(0, vi * 100)) * 0.35;
  const crScore = Math.min(100, Math.max(0, cr * 100)) * 0.25;
  // Normalize GR30d where 50% growth = 100 score
  const grNorm = Math.min(100, Math.max(0, (gr30d / 50) * 100));
  const grScore = grNorm * 0.20;
  const recScore = Math.min(100, Math.max(0, recurrence * 100)) * 0.10;
  const urgScore = Math.min(100, Math.max(0, urgency * 100)) * 0.10;

  const total = Math.round(viScore + crScore + grScore + recScore + urgScore);

  let criticidade: Criticidade = 'Normal';
  if (total >= 80) criticidade = 'Critica';
  else if (total >= 60) criticidade = 'Alta';
  else if (total >= 40) criticidade = 'Atencao';

  return {
    viScore: Math.round(viScore * 10) / 10,
    crScore: Math.round(crScore * 10) / 10,
    grScore: Math.round(grScore * 10) / 10,
    recScore: Math.round(recScore * 10) / 10,
    urgScore: Math.round(urgScore * 10) / 10,
    total,
    criticidade
  };
}

export function getRecommendedAction(priorityScore: number, clearanceRisk: number): string {
  if (clearanceRisk >= 0.85 || priorityScore >= 88) {
    return 'Roçada emergencial em até 48 horas';
  } else if (priorityScore >= 80 || clearanceRisk >= 0.70) {
    return 'Roçada prioritária em até 7 dias';
  } else if (priorityScore >= 60) {
    return 'Programar roçada nos próximos 15 dias';
  } else if (priorityScore >= 40) {
    return 'Inspecionar e monitorar crescimento (30 dias)';
  }
  return 'Monitoramento padrão por satélite';
}
