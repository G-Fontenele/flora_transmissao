import transmissionLinesData from './transmissionLines.json';
import substationsData from './substations.json';
import {
  TransmissionSpan,
  VegetationEvent,
  ScheduleActivity,
  Team,
  Supplier,
  AuditItem,
  SystemSettings,
  Substation,
  TransmissionLine
} from '../types';

export const MOCK_SUBSTATIONS: Substation[] = substationsData as unknown as Substation[];
export const MOCK_TRANSMISSION_LINES: TransmissionLine[] = transmissionLinesData as unknown as TransmissionLine[];

export const TRANSMISSION_LINES: string[] = Array.from(new Set(MOCK_TRANSMISSION_LINES.map(l => l.name)));
export const REGIONS: string[] = Array.from(new Set(MOCK_TRANSMISSION_LINES.map(l => `Região ${l.subsystem} (${l.stateDe})`)));

export const MOCK_SPANS: TransmissionSpan[] = MOCK_TRANSMISSION_LINES.flatMap(l => l.spans as unknown as TransmissionSpan[]);

// Pick sample critical and high spans to populate realistic events, activities, and audits
const criticalSample = MOCK_SPANS.filter(s => s.status === 'Critica').slice(0, 15);
const highSample = MOCK_SPANS.filter(s => s.status === 'Alta').slice(0, 15);
const samplePool = [...criticalSample, ...highSample];

// Fallback sample if empty (safety check)
const safePool: TransmissionSpan[] = samplePool.length >= 10 ? samplePool : MOCK_SPANS.slice(0, 15);

export const MOCK_EVENTS: VegetationEvent[] = safePool.slice(0, 10).map((span, idx) => {
  const statuses: VegetationEvent['status'][] = ['Aberto', 'Em analise', 'Planejado', 'Em execucao', 'Executado', 'Validado'];
  const responsaveis = ['Eng. Ana Carolina', 'Eng. Marcos Silveira', 'Téc. Roberto Alves', 'Gestora Cláudia Mendonça', 'Inspetor Lucas Ferreira'];
  return {
    id: `EVT-${1080 + idx}`,
    lineName: span.lineName,
    spanId: span.id,
    startTower: span.startTower,
    endTower: span.endTower,
    region: span.region,
    criticidade: span.status,
    vegetationIndex: span.vegetationIndex,
    growth30d: span.growth30d,
    clearanceRisk: span.clearanceRisk,
    detectionDate: `2026-07-${Math.max(1, 12 - idx).toString().padStart(2, '0')}`,
    recommendedDeadline: `2026-07-${Math.min(30, 15 + idx).toString().padStart(2, '0')}`,
    status: statuses[idx % statuses.length],
    responsible: responsaveis[idx % responsaveis.length],
    action: span.recommendedAction
  };
});

export const MOCK_SCHEDULE_ACTIVITIES: ScheduleActivity[] = safePool.slice(3, 9).map((span, idx) => {
  const statuses: ScheduleActivity['status'][] = ['Em Execução', 'Aprovado', 'Programado', 'Atrasado'];
  const teams = [
    'Equipe Alfa (EcoVerde Serviços)',
    'Equipe Beta (EcoVerde Serviços)',
    'Equipe Gama (BioRoçada Brasil)',
    'Equipe Delta (BioRoçada Brasil)',
    'Equipe Épsilon (Floresta Limpa Ltda)',
    'Equipe Zeta (Floresta Limpa Ltda)'
  ];
  return {
    id: `SCH-${801 + idx}`,
    lineName: span.lineName,
    spansIncluded: [`${span.startTower} - ${span.endTower}`],
    lengthKm: span.lengthKm,
    assignedTeam: teams[idx % teams.length],
    estimatedCost: span.estimatedCost,
    priorityScore: span.priorityScore,
    status: statuses[idx % statuses.length],
    justification: `Índice de Vegetação de ${span.vegetationIndex} (${span.status}) com risco de aproximação ${span.clearanceRisk}.`,
    scheduledDate: `2026-07-${14 + idx}`,
    windowRecommended: idx % 2 === 0 ? 'Janela seca sem chuva prevista' : 'Janela matutina (vento < 15 km/h)',
    durationHours: span.estimatedDurationHours,
    isLocked: idx % 2 === 0
  };
});

export const MOCK_TEAMS: Team[] = [
  {
    id: 'TEAM-1',
    name: 'Equipe Alfa (Pesada / Tratores)',
    company: 'EcoVerde Serviços Industriais',
    region: 'Norte / Sudeste / Sul',
    productivityKmDay: 3.8,
    costPerKm: 5400,
    availability: 'Em Campo',
    rating: 4.8,
    completedActivities: 42,
    delays: 1,
    reworkRate: 2.1
  },
  {
    id: 'TEAM-2',
    name: 'Equipe Beta (Poda em Altura)',
    company: 'EcoVerde Serviços Industriais',
    region: 'Sudeste / Centro-Oeste',
    productivityKmDay: 3.2,
    costPerKm: 5800,
    availability: 'Disponível',
    rating: 4.9,
    completedActivities: 38,
    delays: 0,
    reworkRate: 1.5
  },
  {
    id: 'TEAM-3',
    name: 'Equipe Gama (Roçada Mecanizada)',
    company: 'BioRoçada Brasil',
    region: 'Nordeste / Norte',
    productivityKmDay: 4.2,
    costPerKm: 4600,
    availability: 'Disponível',
    rating: 4.5,
    completedActivities: 55,
    delays: 3,
    reworkRate: 3.8
  },
  {
    id: 'TEAM-4',
    name: 'Equipe Delta (Limpeza e Herbicida)',
    company: 'BioRoçada Brasil',
    region: 'Norte / Centro-Oeste',
    productivityKmDay: 4.0,
    costPerKm: 4800,
    availability: 'Em Campo',
    rating: 4.4,
    completedActivities: 48,
    delays: 4,
    reworkRate: 4.2
  },
  {
    id: 'TEAM-5',
    name: 'Equipe Épsilon (Roçada Costeira)',
    company: 'Floresta Limpa Ltda',
    region: 'Sul / Sudeste',
    productivityKmDay: 3.5,
    costPerKm: 3900,
    availability: 'Disponível',
    rating: 4.7,
    completedActivities: 34,
    delays: 1,
    reworkRate: 2.5
  },
  {
    id: 'TEAM-6',
    name: 'Equipe Zeta (Manutenção de Faixa)',
    company: 'Floresta Limpa Ltda',
    region: 'Nordeste / Sudeste',
    productivityKmDay: 3.6,
    costPerKm: 4100,
    availability: 'Em Manutenção',
    rating: 4.3,
    completedActivities: 29,
    delays: 2,
    reworkRate: 3.1
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-1',
    name: 'EcoVerde Serviços Industriais',
    activeTeams: 2,
    avgCostKm: 5600,
    rating: 4.85,
    totalActivities: 80,
    delaysCount: 1,
    status: 'Homologado'
  },
  {
    id: 'SUP-2',
    name: 'BioRoçada Brasil',
    activeTeams: 2,
    avgCostKm: 4700,
    rating: 4.45,
    totalActivities: 103,
    delaysCount: 7,
    status: 'Homologado'
  },
  {
    id: 'SUP-3',
    name: 'Floresta Limpa Ltda',
    activeTeams: 2,
    avgCostKm: 4000,
    rating: 4.50,
    totalActivities: 63,
    delaysCount: 3,
    status: 'Homologado'
  }
];

export const MOCK_AUDIT_ITEMS: AuditItem[] = safePool.slice(0, 4).map((span, idx) => {
  const statuses: AuditItem['validationStatus'][] = ['Aprovado', 'Aprovado', 'Retrabalho', 'Aprovado'];
  const responsaveis = ['Inspetor Lucas Ferreira', 'Eng. Ana Carolina', 'Eng. Marcos Silveira', 'Téc. Roberto Alves'];
  const beforeImgs = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
  ];
  const afterImgs = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  ];
  return {
    id: `AUD-${901 + idx}`,
    activityId: `SCH-${801 + idx}`,
    lineName: span.lineName,
    spanName: `${span.startTower} - ${span.endTower}`,
    plannedDate: '2026-06-25',
    executedDate: '2026-06-26',
    plannedCost: span.estimatedCost,
    actualCost: idx === 2 ? Math.round(span.estimatedCost * 1.15) : span.estimatedCost,
    varianceCost: idx === 2 ? +15.0 : 0.0,
    beforeImage: beforeImgs[idx],
    afterImage: afterImgs[idx],
    executedKm: span.lengthKm,
    responsible: responsaveis[idx],
    oldVegetationIndex: span.vegetationIndex,
    newVegetationIndex: idx === 2 ? 0.38 : 0.14,
    validationStatus: statuses[idx],
    notes: idx === 2 ? 'Equipe deixou arbustos altos (>3,5m) próximos à base da torre. Solicitado retorno imediato.' : 'Faixa 100% limpa com largura regulamentar preservada e sem pendências ambientais.'
  };
});

export const MOCK_TREND_DATA = [
  { month: 'Fev/26', viMedio: 0.44, crescimentoPercent: +6.2, kmCriticos: 480.4, conformidade: 88.5 },
  { month: 'Mar/26', viMedio: 0.52, crescimentoPercent: +12.8, kmCriticos: 620.2, conformidade: 84.1 },
  { month: 'Abr/26', viMedio: 0.61, crescimentoPercent: +18.4, kmCriticos: 920.8, conformidade: 76.3 },
  { month: 'Mai/26', viMedio: 0.65, crescimentoPercent: +15.1, kmCriticos: 1140.5, conformidade: 73.8 },
  { month: 'Jun/26', viMedio: 0.58, crescimentoPercent: -8.4, kmCriticos: 836.0, conformidade: 81.2 },
  { month: 'Jul/26 (Atual)', viMedio: 0.53, crescimentoPercent: -11.2, kmCriticos: 712.4, conformidade: 85.6 }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  viThreshold: 0.75,
  grThreshold: 15,
  crThreshold: 0.70,
  priorityWeights: {
    vegetationIndex: 35,
    clearanceRisk: 25,
    growthRate30d: 20,
    recurrence: 10,
    urgency: 10
  },
  defaultProductivity: 3.6,
  defaultCostKm: 4800,
  planningHorizonDays: 30,
  analysisFrequencyDays: 15
};
