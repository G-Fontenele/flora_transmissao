import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { FilterBar } from '../components/FilterBar';
import { Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarPage: React.FC = () => {
  const { activities } = useApp();

  const lockedCount = activities.filter(a => a.isLocked).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário Automatizado de Roçada"
        subtitle="Agrupamento geográfico de ordens, alocação de equipes e janelas climáticas ideais"
        actions={
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="bg-flora-green/15 text-flora-green border border-flora-green/30 px-3 py-1.5 rounded font-bold">
              {lockedCount} Ordem(ns) Aprovadas/Travadas
            </span>
          </div>
        }
      />

      <FilterBar />

      <ScheduleCalendar />
    </div>
  );
};
