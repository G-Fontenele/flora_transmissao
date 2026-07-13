import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TransmissionSpan,
  VegetationEvent,
  ScheduleActivity,
  Team,
  Supplier,
  AuditItem,
  SystemSettings,
  Substation,
  TransmissionLine,
  PageId,
  OptimizationScenario
} from '../types';
import {
  MOCK_SPANS,
  MOCK_EVENTS,
  MOCK_SCHEDULE_ACTIVITIES,
  MOCK_TEAMS,
  MOCK_SUPPLIERS,
  MOCK_AUDIT_ITEMS,
  DEFAULT_SETTINGS,
  MOCK_SUBSTATIONS,
  MOCK_TRANSMISSION_LINES
} from '../data/mockData';
import { generateEventsFromSpans } from '../services/eventEngine';
import { runOptimizationScenarios, OptimizationInputs } from '../services/optimizerEngine';

interface AppContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  spans: TransmissionSpan[];
  substations: Substation[];
  transmissionLines: TransmissionLine[];
  events: VegetationEvent[];
  activities: ScheduleActivity[];
  teams: Team[];
  suppliers: Supplier[];
  audits: AuditItem[];
  settings: SystemSettings;
  selectedSpan: TransmissionSpan | null;
  setSelectedSpan: (span: TransmissionSpan | null) => void;
  createEventForSpan: (spanId: string, actionText?: string) => void;
  addSpanToSchedule: (spanId: string, teamName?: string, dateStr?: string) => void;
  updateEventStatus: (eventId: string, newStatus: VegetationEvent['status']) => void;
  toggleActivityLock: (activityId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  runOptimization: (inputs: OptimizationInputs) => OptimizationScenario[];
  selectedScenario: OptimizationScenario | null;
  setSelectedScenario: (scenario: OptimizationScenario | null) => void;
  applyScenarioToSchedule: (scenario: OptimizationScenario) => void;
  filterLine: string;
  setFilterLine: (line: string) => void;
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  filterSubsystem?: string;
  setFilterSubsystem?: (subsystem: string) => void;
  filterState?: string;
  setFilterState?: (state: string) => void;
  filterVoltage?: string;
  setFilterVoltage?: (voltage: string) => void;
  searchText?: string;
  setSearchText?: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [spans, setSpans] = useState<TransmissionSpan[]>(MOCK_SPANS);
  const [substations] = useState<Substation[]>(MOCK_SUBSTATIONS);
  const [transmissionLines] = useState<TransmissionLine[]>(MOCK_TRANSMISSION_LINES);
  const [events, setEvents] = useState<VegetationEvent[]>(MOCK_EVENTS);
  const [activities, setActivities] = useState<ScheduleActivity[]>(MOCK_SCHEDULE_ACTIVITIES);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [audits] = useState<AuditItem[]>(MOCK_AUDIT_ITEMS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [selectedSpan, setSelectedSpan] = useState<TransmissionSpan | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<OptimizationScenario | null>(null);

  // Global filters
  const [filterLine, setFilterLine] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterSubsystem, setFilterSubsystem] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterVoltage, setFilterVoltage] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Ensure automatic event generation when spans/settings change
  useEffect(() => {
    const autoEvents = generateEventsFromSpans(spans, events);
    if (autoEvents.length !== events.length) {
      setEvents(autoEvents);
    }
  }, [spans]);

  const createEventForSpan = (spanId: string, actionText?: string) => {
    const span = spans.find(s => s.id === spanId);
    if (!span) return;

    const newEvt: VegetationEvent = {
      id: `EVT-${1000 + events.length + Math.floor(Math.random() * 90) + 10}`,
      lineName: span.lineName,
      spanId: span.id,
      startTower: span.startTower,
      endTower: span.endTower,
      region: span.region,
      criticidade: span.status,
      vegetationIndex: span.vegetationIndex,
      growth30d: span.growth30d,
      clearanceRisk: span.clearanceRisk,
      detectionDate: new Date().toISOString().split('T')[0],
      recommendedDeadline: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      status: 'Aberto',
      responsible: 'Eng. Marcos Silveira (Operação)',
      action: actionText || span.recommendedAction
    };

    setEvents(prev => [newEvt, ...prev]);
  };

  const addSpanToSchedule = (spanId: string, teamName?: string, dateStr?: string) => {
    const span = spans.find(s => s.id === spanId);
    if (!span) return;

    const newAct: ScheduleActivity = {
      id: `SCH-${800 + activities.length + 1}`,
      lineName: span.lineName,
      spansIncluded: [`${span.startTower} - ${span.endTower}`],
      lengthKm: span.lengthKm,
      assignedTeam: teamName || teams[0].name,
      estimatedCost: span.estimatedCost,
      priorityScore: span.priorityScore,
      status: 'Programado',
      justification: `Agendado via inspeção operacional no mapa. VI: ${span.vegetationIndex}`,
      scheduledDate: dateStr || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      windowRecommended: 'Janela diurna padrão',
      durationHours: span.estimatedDurationHours,
      isLocked: false
    };

    setActivities(prev => [newAct, ...prev]);
  };

  const updateEventStatus = (eventId: string, newStatus: VegetationEvent['status']) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
  };

  const toggleActivityLock = (activityId: string) => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, isLocked: !a.isLocked } : a));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const runOptimization = (inputs: OptimizationInputs): OptimizationScenario[] => {
    const results = runOptimizationScenarios(spans, inputs);
    setSelectedScenario(results[1]); // Default select balanced
    return results;
  };

  const applyScenarioToSchedule = (scenario: OptimizationScenario) => {
    const newScheduled: ScheduleActivity[] = scenario.prioritySpans.map((span, idx) => ({
      id: `SCH-OPT-${900 + idx}`,
      lineName: span.lineName,
      spansIncluded: [`${span.startTower} - ${span.endTower}`],
      lengthKm: span.lengthKm,
      assignedTeam: teams[idx % teams.length].name,
      estimatedCost: span.estimatedCost,
      priorityScore: span.priorityScore,
      status: 'Programado',
      justification: `Gerado via Otimizador de Roçada: ${scenario.name}`,
      scheduledDate: new Date(Date.now() + 86400000 * (idx + 1) * 2).toISOString().split('T')[0],
      windowRecommended: 'Janela climática favorável calculada',
      durationHours: span.estimatedDurationHours,
      isLocked: true
    }));

    setActivities(prev => [...newScheduled, ...prev.filter(a => a.isLocked)]);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        spans,
        events,
        activities,
        teams,
        suppliers,
        audits,
        settings,
        selectedSpan,
        setSelectedSpan,
        createEventForSpan,
        addSpanToSchedule,
        updateEventStatus,
        toggleActivityLock,
        updateSettings,
        runOptimization,
        selectedScenario,
        setSelectedScenario,
        applyScenarioToSchedule,
        filterLine,
        setFilterLine,
        filterRegion,
        setFilterRegion,
        substations,
        transmissionLines,
        filterSubsystem,
        setFilterSubsystem,
        filterState,
        setFilterState,
        filterVoltage,
        setFilterVoltage,
        searchText,
        setSearchText
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
