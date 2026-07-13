export type Criticidade = 'Normal' | 'Atencao' | 'Alta' | 'Critica';

export type EventStatus = 'Aberto' | 'Em analise' | 'Planejado' | 'Em execucao' | 'Executado' | 'Validado' | 'Cancelado';

export type PageId = 
  | 'dashboard'
  | 'mapa'
  | 'eventos'
  | 'calendario'
  | 'otimizador'
  | 'equipes'
  | 'auditoria'
  | 'relatorios'
  | 'configuracoes';

export interface Substation {
  id: string;
  name: string;
  state: string;
  stateName: string;
  subsystem: string;
  lat: number;
  lon: number;
  voltageLevel: number;
}

export interface TransmissionLine {
  id: string;
  name: string;
  voltageKv: number;
  networkType: string;
  ownerAgent: string;
  lengthKm: number;
  subsystem: string;
  stateDe: string;
  statePara: string;
  substationDe: string;
  substationPara: string;
  latDe: number;
  lonDe: number;
  latPara: number;
  lonPara: number;
  operationDate: string;
  spans: TransmissionSpan[];
}

export interface TransmissionSpan {
  id: string;
  lineId?: string;
  lineName: string;
  startTower: string;
  endTower: string;
  region: string;
  lengthKm: number;
  latitude: number;
  longitude: number;
  latStart?: number;
  lonStart?: number;
  latEnd?: number;
  lonEnd?: number;
  state?: string;
  subsystem?: string;
  vegetationIndex: number;      // 0.00 to 1.00
  growth15d: number;            // percentage e.g. 8
  growth30d: number;            // percentage e.g. 18
  growth90d: number;            // percentage e.g. 42
  clearanceRisk: number;        // 0.00 to 1.00
  priorityScore: number;        // 0 to 100
  recurrenceScore: number;      // 0.00 to 1.00
  urgencyScore: number;         // 0.00 to 1.00
  lastInspectionDate: string;
  lastMowingDate: string;
  status: Criticidade;
  recommendedAction: string;
  estimatedCost: number;
  estimatedDurationHours: number;
}

export interface VegetationEvent {
  id: string;
  lineName: string;
  spanId: string;
  startTower: string;
  endTower: string;
  region: string;
  criticidade: Criticidade;
  vegetationIndex: number;
  growth30d: number;
  clearanceRisk: number;
  detectionDate: string;
  recommendedDeadline: string;
  status: EventStatus;
  responsible: string;
  action: string;
}

export interface ScheduleActivity {
  id: string;
  lineName: string;
  spansIncluded: string[]; // Span IDs or descriptions
  lengthKm: number;
  assignedTeam: string;
  estimatedCost: number;
  priorityScore: number;
  status: 'Programado' | 'Aprovado' | 'Em Execução' | 'Concluído' | 'Atrasado';
  justification: string;
  scheduledDate: string; // YYYY-MM-DD
  windowRecommended: string;
  durationHours: number;
  isLocked?: boolean;
}

export interface Team {
  id: string;
  name: string;
  company: string;
  region: string;
  productivityKmDay: number;
  costPerKm: number;
  availability: 'Disponível' | 'Em Campo' | 'Em Manutenção';
  rating: number; // 1 to 5
  completedActivities: number;
  delays: number;
  reworkRate: number; // percentage
}

export interface Supplier {
  id: string;
  name: string;
  activeTeams: number;
  avgCostKm: number;
  rating: number;
  totalActivities: number;
  delaysCount: number;
  status: 'Homologado' | 'Em Revisão' | 'Suspenso';
}

export interface AuditItem {
  id: string;
  activityId: string;
  lineName: string;
  spanName: string;
  plannedDate: string;
  executedDate: string;
  plannedCost: number;
  actualCost: number;
  varianceCost: number; // percentage
  beforeImage: string;
  afterImage: string;
  executedKm: number;
  responsible: string;
  oldVegetationIndex: number;
  newVegetationIndex: number;
  validationStatus: 'Aprovado' | 'Pendente' | 'Retrabalho';
  notes?: string;
}

export interface SystemSettings {
  viThreshold: number;
  grThreshold: number;
  crThreshold: number;
  priorityWeights: {
    vegetationIndex: number;
    clearanceRisk: number;
    growthRate30d: number;
    recurrence: number;
    urgency: number;
  };
  defaultProductivity: number;
  defaultCostKm: number;
  planningHorizonDays: number;
  analysisFrequencyDays: number;
}

export interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  prioritySpans: TransmissionSpan[];
  totalCost: number;
  totalKm: number;
  riskReductionPercent: number;
  remainingCriticalCount: number;
  selectedTeamCount: number;
}
