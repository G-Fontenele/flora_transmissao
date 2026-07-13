import {
  TransmissionSpan,
  VegetationEvent,
  ScheduleActivity,
  Team,
  Supplier,
  AuditItem,
  SystemSettings
} from '../types';
import { calculatePriorityScore, getRecommendedAction } from '../services/priorityCalculator';

// 3 Main Transmission Lines
export const TRANSMISSION_LINES = [
  'LT 500 kV Serra Azul - Rio Norte',
  'LT 345 kV Chapada - Horizonte',
  'LT 230 kV Vale Verde - Subestacao Leste'
];

export const REGIONS = [
  'Região Serrana',
  'Região Norte',
  'Região Planalto',
  'Região Cerrado',
  'Região Vale Verde'
];

// Helper to generate 108 realistic spans across the 3 lines
function generateMockSpans(): TransmissionSpan[] {
  const spans: TransmissionSpan[] = [];
  
  // Line 1: LT 500 kV Serra Azul - Rio Norte (42 spans)
  for (let i = 101; i <= 142; i++) {
    const vi = Math.min(0.98, Math.max(0.15, (0.45 + Math.sin(i * 0.7) * 0.38 + (i % 5 === 0 ? 0.25 : 0))));
    const cr = Math.min(0.96, Math.max(0.10, vi * 0.92 + (i % 7 === 0 ? 0.20 : -0.05)));
    const gr30d = Math.round(Math.min(48, Math.max(2, vi * 32 + (i % 3 === 0 ? 14 : -4))));
    const gr15d = Math.round(gr30d * 0.48);
    const gr90d = Math.round(gr30d * 2.3);
    const recurrence = (i % 4 === 0) ? 0.85 : 0.25;
    const urgency = cr > 0.75 ? 0.90 : 0.30;
    const lengthKm = Math.round((4.2 + (i % 4) * 0.8) * 10) / 10;
    
    const breakdown = calculatePriorityScore(vi, cr, gr30d, recurrence, urgency);
    const action = getRecommendedAction(breakdown.total, cr);
    const cost = Math.round(lengthKm * 4800 * (1 + (vi - 0.5) * 0.6));

    spans.push({
      id: `SPAN-500-${i}`,
      lineName: 'LT 500 kV Serra Azul - Rio Norte',
      startTower: `Torre ${i}`,
      endTower: `Torre ${i + 1}`,
      region: i < 120 ? 'Região Serrana' : 'Região Norte',
      lengthKm,
      latitude: -22.350 + (i - 100) * 0.015,
      longitude: -44.200 + (i - 100) * 0.018,
      vegetationIndex: Math.round(vi * 100) / 100,
      growth15d: gr15d,
      growth30d: gr30d,
      growth90d: gr90d,
      clearanceRisk: Math.round(cr * 100) / 100,
      priorityScore: breakdown.total,
      recurrenceScore: recurrence,
      urgencyScore: urgency,
      lastInspectionDate: '2026-06-28',
      lastMowingDate: i % 3 === 0 ? '2025-11-15' : '2026-02-10',
      status: breakdown.criticidade,
      recommendedAction: action,
      estimatedCost: cost,
      estimatedDurationHours: Math.round(lengthKm * 8)
    });
  }

  // Line 2: LT 345 kV Chapada - Horizonte (36 spans)
  for (let i = 201; i <= 236; i++) {
    const vi = Math.min(0.94, Math.max(0.12, (0.38 + Math.cos(i * 0.5) * 0.35 + (i % 6 === 0 ? 0.30 : 0))));
    const cr = Math.min(0.92, Math.max(0.08, vi * 0.88 + (i % 8 === 0 ? 0.18 : -0.08)));
    const gr30d = Math.round(Math.min(42, Math.max(3, vi * 28 + (i % 4 === 0 ? 12 : -3))));
    const gr15d = Math.round(gr30d * 0.51);
    const gr90d = Math.round(gr30d * 2.4);
    const recurrence = (i % 5 === 0) ? 0.75 : 0.20;
    const urgency = cr > 0.70 ? 0.85 : 0.25;
    const lengthKm = Math.round((3.8 + (i % 5) * 0.7) * 10) / 10;
    
    const breakdown = calculatePriorityScore(vi, cr, gr30d, recurrence, urgency);
    const action = getRecommendedAction(breakdown.total, cr);
    const cost = Math.round(lengthKm * 4200 * (1 + (vi - 0.4) * 0.5));

    spans.push({
      id: `SPAN-345-${i}`,
      lineName: 'LT 345 kV Chapada - Horizonte',
      startTower: `Torre ${i}`,
      endTower: `Torre ${i + 1}`,
      region: i < 220 ? 'Região Planalto' : 'Região Cerrado',
      lengthKm,
      latitude: -19.820 + (i - 200) * 0.012,
      longitude: -47.150 + (i - 200) * 0.014,
      vegetationIndex: Math.round(vi * 100) / 100,
      growth15d: gr15d,
      growth30d: gr30d,
      growth90d: gr90d,
      clearanceRisk: Math.round(cr * 100) / 100,
      priorityScore: breakdown.total,
      recurrenceScore: recurrence,
      urgencyScore: urgency,
      lastInspectionDate: '2026-07-02',
      lastMowingDate: i % 4 === 0 ? '2025-10-20' : '2026-03-05',
      status: breakdown.criticidade,
      recommendedAction: action,
      estimatedCost: cost,
      estimatedDurationHours: Math.round(lengthKm * 7)
    });
  }

  // Line 3: LT 230 kV Vale Verde - Subestação Leste (30 spans)
  for (let i = 301; i <= 330; i++) {
    const vi = Math.min(0.91, Math.max(0.18, (0.35 + Math.sin(i * 0.9) * 0.32 + (i % 4 === 0 ? 0.28 : 0))));
    const cr = Math.min(0.89, Math.max(0.12, vi * 0.85 + (i % 5 === 0 ? 0.15 : -0.10)));
    const gr30d = Math.round(Math.min(38, Math.max(4, vi * 26 + (i % 3 === 0 ? 10 : -2))));
    const gr15d = Math.round(gr30d * 0.49);
    const gr90d = Math.round(gr30d * 2.2);
    const recurrence = (i % 3 === 0) ? 0.65 : 0.15;
    const urgency = cr > 0.68 ? 0.80 : 0.20;
    const lengthKm = Math.round((3.2 + (i % 3) * 0.6) * 10) / 10;
    
    const breakdown = calculatePriorityScore(vi, cr, gr30d, recurrence, urgency);
    const action = getRecommendedAction(breakdown.total, cr);
    const cost = Math.round(lengthKm * 3600 * (1 + (vi - 0.3) * 0.4));

    spans.push({
      id: `SPAN-230-${i}`,
      lineName: 'LT 230 kV Vale Verde - Subestação Leste',
      startTower: `Torre ${i}`,
      endTower: `Torre ${i + 1}`,
      region: 'Região Vale Verde',
      lengthKm,
      latitude: -21.150 + (i - 300) * 0.010,
      longitude: -46.400 + (i - 300) * 0.011,
      vegetationIndex: Math.round(vi * 100) / 100,
      growth15d: gr15d,
      growth30d: gr30d,
      growth90d: gr90d,
      clearanceRisk: Math.round(cr * 100) / 100,
      priorityScore: breakdown.total,
      recurrenceScore: recurrence,
      urgencyScore: urgency,
      lastInspectionDate: '2026-07-05',
      lastMowingDate: i % 2 === 0 ? '2026-01-18' : '2026-04-12',
      status: breakdown.criticidade,
      recommendedAction: action,
      estimatedCost: cost,
      estimatedDurationHours: Math.round(lengthKm * 6)
    });
  }

  return spans;
}

export const MOCK_SPANS = generateMockSpans();

export const MOCK_EVENTS: VegetationEvent[] = [
  {
    id: 'EVT-1082',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanId: 'SPAN-500-105',
    startTower: 'Torre 105',
    endTower: 'Torre 106',
    region: 'Região Serrana',
    criticidade: 'Critica',
    vegetationIndex: 0.89,
    growth30d: 28,
    clearanceRisk: 0.91,
    detectionDate: '2026-07-10',
    recommendedDeadline: '2026-07-15',
    status: 'Aberto',
    responsible: 'Eng. Ana Carolina',
    action: 'Roçada emergencial mecanizada com trator florestal'
  },
  {
    id: 'EVT-1081',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanId: 'SPAN-500-112',
    startTower: 'Torre 112',
    endTower: 'Torre 113',
    region: 'Região Serrana',
    criticidade: 'Critica',
    vegetationIndex: 0.86,
    growth30d: 32,
    clearanceRisk: 0.88,
    detectionDate: '2026-07-08',
    recommendedDeadline: '2026-07-16',
    status: 'Em analise',
    responsible: 'Eng. Marcos Silveira',
    action: 'Roçada em faixa central + poda lateral de eucaliptos'
  },
  {
    id: 'EVT-1080',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spanId: 'SPAN-345-206',
    startTower: 'Torre 206',
    endTower: 'Torre 207',
    region: 'Região Planalto',
    criticidade: 'Alta',
    vegetationIndex: 0.78,
    growth30d: 22,
    clearanceRisk: 0.76,
    detectionDate: '2026-07-06',
    recommendedDeadline: '2026-07-20',
    status: 'Planejado',
    responsible: 'Téc. Roberto Alves',
    action: 'Roçada seletiva e aplicação de herbicida autorizado'
  },
  {
    id: 'EVT-1079',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanId: 'SPAN-500-125',
    startTower: 'Torre 125',
    endTower: 'Torre 126',
    region: 'Região Norte',
    criticidade: 'Alta',
    vegetationIndex: 0.76,
    growth30d: 19,
    clearanceRisk: 0.73,
    detectionDate: '2026-07-04',
    recommendedDeadline: '2026-07-22',
    status: 'Em execucao',
    responsible: 'Gestora Cláudia Mendonça',
    action: 'Desbroca de capim colonião e limpeza de vão em encosta'
  },
  {
    id: 'EVT-1078',
    lineName: 'LT 230 kV Vale Verde - Subestação Leste',
    spanId: 'SPAN-230-312',
    startTower: 'Torre 312',
    endTower: 'Torre 313',
    region: 'Região Vale Verde',
    criticidade: 'Atencao',
    vegetationIndex: 0.64,
    growth30d: 16,
    clearanceRisk: 0.58,
    detectionDate: '2026-07-01',
    recommendedDeadline: '2026-08-01',
    status: 'Planejado',
    responsible: 'Inspetor Lucas Ferreira',
    action: 'Roçada manual por roçadeira costeira em área de pastagem'
  },
  {
    id: 'EVT-1077',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spanId: 'SPAN-345-218',
    startTower: 'Torre 218',
    endTower: 'Torre 219',
    region: 'Região Cerrado',
    criticidade: 'Critica',
    vegetationIndex: 0.88,
    growth30d: 34,
    clearanceRisk: 0.89,
    detectionDate: '2026-06-29',
    recommendedDeadline: '2026-07-14',
    status: 'Aberto',
    responsible: 'Eng. Marcos Silveira',
    action: 'Intervenção urgente: remoção de bambuzal invasor no vão central'
  },
  {
    id: 'EVT-1076',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanId: 'SPAN-500-138',
    startTower: 'Torre 138',
    endTower: 'Torre 139',
    region: 'Região Norte',
    criticidade: 'Alta',
    vegetationIndex: 0.74,
    growth30d: 18,
    clearanceRisk: 0.71,
    detectionDate: '2026-06-25',
    recommendedDeadline: '2026-07-18',
    status: 'Em execucao',
    responsible: 'Téc. Roberto Alves',
    action: 'Poda de ramagem densa próxima aos cabos pára-raios'
  },
  {
    id: 'EVT-1075',
    lineName: 'LT 230 kV Vale Verde - Subestação Leste',
    spanId: 'SPAN-230-304',
    startTower: 'Torre 304',
    endTower: 'Torre 305',
    region: 'Região Vale Verde',
    criticidade: 'Normal',
    vegetationIndex: 0.42,
    growth30d: 8,
    clearanceRisk: 0.35,
    detectionDate: '2026-06-20',
    recommendedDeadline: '2026-08-20',
    status: 'Executado',
    responsible: 'Inspetor Lucas Ferreira',
    action: 'Inspecionado sem necessidade de roçada imediata'
  },
  {
    id: 'EVT-1074',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spanId: 'SPAN-345-230',
    startTower: 'Torre 230',
    endTower: 'Torre 231',
    region: 'Região Cerrado',
    criticidade: 'Atencao',
    vegetationIndex: 0.68,
    growth30d: 14,
    clearanceRisk: 0.62,
    detectionDate: '2026-06-18',
    recommendedDeadline: '2026-07-28',
    status: 'Validado',
    responsible: 'Gestora Cláudia Mendonça',
    action: 'Roçada concluída e aprovada por sobrevoo de drone'
  },
  {
    id: 'EVT-1073',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanId: 'SPAN-500-115',
    startTower: 'Torre 115',
    endTower: 'Torre 116',
    region: 'Região Serrana',
    criticidade: 'Critica',
    vegetationIndex: 0.91,
    growth30d: 36,
    clearanceRisk: 0.94,
    detectionDate: '2026-06-15',
    recommendedDeadline: '2026-07-12',
    status: 'Aberto',
    responsible: 'Eng. Ana Carolina',
    action: 'Corte de árvores de grande porte com licença ambiental expedida'
  }
];

export const MOCK_SCHEDULE_ACTIVITIES: ScheduleActivity[] = [
  {
    id: 'SCH-801',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spansIncluded: ['Torre 105 - 106', 'Torre 106 - 107', 'Torre 107 - 108'],
    lengthKm: 13.8,
    assignedTeam: 'Equipe Alfa (EcoVerde Serviços)',
    estimatedCost: 74500,
    priorityScore: 92,
    status: 'Em Execução',
    justification: 'Índice de Vegetação > 0.85 em trecho montanhoso com alto risco de aproximação ao condutor.',
    scheduledDate: '2026-07-14',
    windowRecommended: 'Janela seca sem chuva prevista',
    durationHours: 32,
    isLocked: true
  },
  {
    id: 'SCH-802',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spansIncluded: ['Torre 112 - 113', 'Torre 113 - 114', 'Torre 115 - 116'],
    lengthKm: 14.2,
    assignedTeam: 'Equipe Beta (EcoVerde Serviços)',
    estimatedCost: 78000,
    priorityScore: 89,
    status: 'Aprovado',
    justification: 'Crescimento agudo em 30d (+32%) e reincidência de eucaliptos na faixa.',
    scheduledDate: '2026-07-16',
    windowRecommended: 'Janela matutina (vento < 15 km/h)',
    durationHours: 36,
    isLocked: true
  },
  {
    id: 'SCH-803',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spansIncluded: ['Torre 206 - 207', 'Torre 218 - 219'],
    lengthKm: 9.4,
    assignedTeam: 'Equipe Gama (BioRoçada Brasil)',
    estimatedCost: 46200,
    priorityScore: 85,
    status: 'Programado',
    justification: 'Mitigação preventiva em vão crítico na Região Cerrado.',
    scheduledDate: '2026-07-19',
    windowRecommended: 'Janela padrão diurna',
    durationHours: 24,
    isLocked: false
  },
  {
    id: 'SCH-804',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spansIncluded: ['Torre 125 - 126', 'Torre 126 - 127', 'Torre 127 - 128', 'Torre 128 - 129'],
    lengthKm: 18.5,
    assignedTeam: 'Equipe Delta (BioRoçada Brasil)',
    estimatedCost: 96000,
    priorityScore: 78,
    status: 'Em Execução',
    justification: 'Desbroca em encosta para manutenção de conformidade regulatória.',
    scheduledDate: '2026-07-13',
    windowRecommended: 'Janela sem precipitação',
    durationHours: 48,
    isLocked: true
  },
  {
    id: 'SCH-805',
    lineName: 'LT 230 kV Vale Verde - Subestação Leste',
    spansIncluded: ['Torre 312 - 313', 'Torre 314 - 315'],
    lengthKm: 7.2,
    assignedTeam: 'Equipe Épsilon (Floresta Limpa Ltda)',
    estimatedCost: 28800,
    priorityScore: 68,
    status: 'Programado',
    justification: 'Roçada periódica em área agrícola de transição.',
    scheduledDate: '2026-07-22',
    windowRecommended: 'Janela da tarde',
    durationHours: 16,
    isLocked: false
  },
  {
    id: 'SCH-806',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spansIncluded: ['Torre 230 - 231', 'Torre 231 - 232', 'Torre 232 - 233'],
    lengthKm: 13.5,
    assignedTeam: 'Equipe Zeta (Floresta Limpa Ltda)',
    estimatedCost: 54000,
    priorityScore: 64,
    status: 'Atrasado',
    justification: 'Atrasado por instabilidade climática nos últimos 4 dias no planalto.',
    scheduledDate: '2026-07-10',
    windowRecommended: 'Janela emergencial pós-chuva',
    durationHours: 30,
    isLocked: true
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'TEAM-1',
    name: 'Equipe Alfa (Pesada / Tratores)',
    company: 'EcoVerde Serviços Industriais',
    region: 'Região Serrana / Norte',
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
    region: 'Região Serrana',
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
    region: 'Região Planalto / Cerrado',
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
    region: 'Região Norte / Cerrado',
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
    region: 'Região Vale Verde',
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
    region: 'Região Planalto / Vale',
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

export const MOCK_AUDIT_ITEMS: AuditItem[] = [
  {
    id: 'AUD-901',
    activityId: 'SCH-788',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanName: 'Torre 108 - Torre 109',
    plannedDate: '2026-06-25',
    executedDate: '2026-06-26',
    plannedCost: 24500,
    actualCost: 24800,
    varianceCost: +1.2,
    beforeImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    executedKm: 4.8,
    responsible: 'Inspetor Lucas Ferreira',
    oldVegetationIndex: 0.84,
    newVegetationIndex: 0.14,
    validationStatus: 'Aprovado',
    notes: 'Faixa 100% limpa com largura regulamentar de 50 metros preservada.'
  },
  {
    id: 'AUD-902',
    activityId: 'SCH-789',
    lineName: 'LT 345 kV Chapada - Horizonte',
    spanName: 'Torre 210 - Torre 211',
    plannedDate: '2026-06-28',
    executedDate: '2026-06-28',
    plannedCost: 18400,
    actualCost: 18400,
    varianceCost: 0.0,
    beforeImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    executedKm: 4.2,
    responsible: 'Eng. Ana Carolina',
    oldVegetationIndex: 0.77,
    newVegetationIndex: 0.18,
    validationStatus: 'Aprovado',
    notes: 'Execução dentro do prazo. Sem pendências ambientais ou cercas danificadas.'
  },
  {
    id: 'AUD-903',
    activityId: 'SCH-790',
    lineName: 'LT 230 kV Vale Verde - Subestação Leste',
    spanName: 'Torre 308 - Torre 309',
    plannedDate: '2026-07-02',
    executedDate: '2026-07-04',
    plannedCost: 14200,
    actualCost: 16500,
    varianceCost: +16.2,
    beforeImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    executedKm: 3.6,
    responsible: 'Eng. Marcos Silveira',
    oldVegetationIndex: 0.69,
    newVegetationIndex: 0.38,
    validationStatus: 'Retrabalho',
    notes: 'Equipe deixou arbustos altos (>3,5m) próximos à base da torre 309. Solicitado retorno imediato.'
  },
  {
    id: 'AUD-904',
    activityId: 'SCH-792',
    lineName: 'LT 500 kV Serra Azul - Rio Norte',
    spanName: 'Torre 118 - Torre 119',
    plannedDate: '2026-07-05',
    executedDate: '2026-07-05',
    plannedCost: 26000,
    actualCost: 25200,
    varianceCost: -3.1,
    beforeImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    executedKm: 5.1,
    responsible: 'Téc. Roberto Alves',
    oldVegetationIndex: 0.81,
    newVegetationIndex: 0.12,
    validationStatus: 'Aprovado',
    notes: 'Ótima produtividade e desbroca perfeita da vegetação invasora.'
  }
];

export const MOCK_TREND_DATA = [
  { month: 'Fev/26', viMedio: 0.44, crescimentoPercent: +6.2, kmCriticos: 18.4, conformidade: 88.5 },
  { month: 'Mar/26', viMedio: 0.52, crescimentoPercent: +12.8, kmCriticos: 26.2, conformidade: 84.1 },
  { month: 'Abr/26', viMedio: 0.61, crescimentoPercent: +18.4, kmCriticos: 42.8, conformidade: 76.3 },
  { month: 'Mai/26', viMedio: 0.65, crescimentoPercent: +15.1, kmCriticos: 48.5, conformidade: 73.8 },
  { month: 'Jun/26', viMedio: 0.58, crescimentoPercent: -8.4, kmCriticos: 36.0, conformidade: 81.2 },
  { month: 'Jul/26 (Atual)', viMedio: 0.53, crescimentoPercent: -11.2, kmCriticos: 28.4, conformidade: 85.6 }
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
