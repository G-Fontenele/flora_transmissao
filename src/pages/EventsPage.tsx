import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EventsTable } from '../components/EventsTable';
import { SpanDetailPanel } from '../components/SpanDetailPanel';
import { useApp } from '../context/AppContext';
import { Activity, PlusCircle } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { events, selectedSpan, setSelectedSpan, spans, createEventForSpan } = useApp();

  const openCount = events.filter(e => e.status === 'Aberto').length;
  const analysisCount = events.filter(e => e.status === 'Em analise').length;

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Eventos Operacionais de Vegetação"
        subtitle="Controle integral de ocorrências, alertas automáticos e prazos regulatórios"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-2 font-mono text-xs">
              <span className="bg-flora-red/15 border border-flora-red/40 text-flora-red px-3 py-1.5 rounded font-bold">
                {openCount} Abertos
              </span>
              <span className="bg-flora-yellow/15 border border-flora-yellow/40 text-flora-yellow px-3 py-1.5 rounded font-bold">
                {analysisCount} Em Análise
              </span>
            </div>
            <button
              onClick={() => {
                // Quick create event for top critical span
                const topCritical = spans.find(s => s.status === 'Critica');
                if (topCritical) createEventForSpan(topCritical.id);
              }}
              className="px-4 py-2 bg-flora-cyan text-black font-mono font-bold text-xs rounded hover:bg-flora-cyan/90 transition-colors flex items-center gap-1.5 shadow glow-cyan"
            >
              <PlusCircle className="w-4 h-4" />
              Gerar Evento Rápido
            </button>
          </div>
        }
      />

      <EventsTable />

      <SpanDetailPanel
        span={selectedSpan}
        onClose={() => setSelectedSpan(null)}
      />
    </div>
  );
};
