import React, { useState, useMemo } from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { VegetationEvent, Criticidade, EventStatus } from '../types';
import { RiskBadge } from './RiskBadge';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../context/AppContext';

interface EventsTableProps {
  limit?: number;
}

export const EventsTable: React.FC<EventsTableProps> = ({ limit }) => {
  const { events, spans, setSelectedSpan, updateEventStatus } = useApp();
  const [filterCriticidade, setFilterCriticidade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOverdue, setFilterOverdue] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => {
      if (filterCriticidade !== 'all' && e.criticidade !== filterCriticidade) return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (filterOverdue && e.recommendedDeadline >= today) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          e.id.toLowerCase().includes(s) ||
          e.lineName.toLowerCase().includes(s) ||
          e.startTower.toLowerCase().includes(s) ||
          e.endTower.toLowerCase().includes(s) ||
          e.responsible.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [events, filterCriticidade, filterStatus, filterOverdue, searchTerm]);

  const displayed = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  const handleInspectSpan = (spanId: string) => {
    const span = spans.find(s => s.id === spanId);
    if (span) setSelectedSpan(span);
  };

  const statusOptions: EventStatus[] = [
    'Aberto',
    'Em analise',
    'Planejado',
    'Em execucao',
    'Executado',
    'Validado',
    'Cancelado'
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Controls if not limited preview */}
      {!limit && (
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-gray-400">CRITICIDADE:</label>
              <select
                value={filterCriticidade}
                onChange={(e) => setFilterCriticidade(e.target.value)}
                className="bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1 text-gray-200 focus:outline-none focus:border-flora-cyan"
              >
                <option value="all">Todas</option>
                <option value="Critica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Atencao">Atenção</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-400">STATUS:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1 text-gray-200 focus:outline-none focus:border-flora-cyan"
              >
                <option value="all">Todos</option>
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-industrial-900 px-2.5 py-1 rounded border border-industrial-600 hover:border-flora-red/50">
              <input
                type="checkbox"
                checked={filterOverdue}
                onChange={(e) => setFilterOverdue(e.target.checked)}
                className="rounded bg-industrial-950 border-industrial-600 text-flora-red focus:ring-0"
              />
              <span className="text-flora-red font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                APENAS PRAZO VENCIDO
              </span>
            </label>
          </div>

          <div className="flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              placeholder="Buscar ID, linha, torre, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-gray-200 focus:outline-none focus:border-flora-cyan"
            />
          </div>
        </div>
      )}

      {/* Dense Table */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-industrial-900 border-b border-industrial-600 text-[11px] text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Linha de Transmissão</th>
              <th className="py-3 px-3">Vão / Torres</th>
              <th className="py-3 px-3">Região</th>
              <th className="py-3 px-3 text-center">Criticidade</th>
              <th className="py-3 px-3 text-right">VI</th>
              <th className="py-3 px-3 text-right">GR 30d</th>
              <th className="py-3 px-3 text-right">Clearance Risk</th>
              <th className="py-3 px-3 text-center">Detecção</th>
              <th className="py-3 px-3 text-center">Prazo Rec.</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Responsável</th>
              <th className="py-3 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-700/60">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-8 text-gray-500">
                  Nenhum evento de vegetação encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              displayed.map((evt) => {
                const isOverdue = evt.recommendedDeadline < todayStr && (evt.status === 'Aberto' || evt.status === 'Em analise');
                const rowBg = isOverdue
                  ? 'bg-red-950/20 hover:bg-red-950/30'
                  : evt.criticidade === 'Critica' && evt.status === 'Aberto'
                  ? 'bg-industrial-800/80 hover:bg-industrial-700/60'
                  : 'hover:bg-industrial-700/40';

                return (
                  <tr key={evt.id} className={`transition-colors ${rowBg}`}>
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                      {isOverdue && <span title="Prazo Vencido!"><AlertTriangle className="w-3.5 h-3.5 text-flora-red animate-pulse" /></span>}
                      {evt.id}
                    </td>
                    <td className="py-2.5 px-3 text-gray-300 max-w-[200px] truncate" title={evt.lineName}>
                      {evt.lineName}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">
                      {evt.startTower} ➔ {evt.endTower}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                      {evt.region}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <RiskBadge criticidade={evt.criticidade} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-200">
                      {evt.vegetationIndex.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-flora-yellow">
                      +{evt.growth30d}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-flora-orange">
                      {evt.clearanceRisk.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-400 whitespace-nowrap">
                      {evt.detectionDate}
                    </td>
                    <td className={`py-2.5 px-3 text-center whitespace-nowrap font-bold ${isOverdue ? 'text-flora-red underline' : 'text-gray-300'}`}>
                      {evt.recommendedDeadline}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <select
                        value={evt.status}
                        onChange={(e) => updateEventStatus(evt.id, e.target.value as EventStatus)}
                        className="bg-industrial-900 border border-industrial-600 rounded px-2 py-0.5 text-gray-200 text-[11px] focus:outline-none focus:border-flora-cyan font-mono cursor-pointer"
                      >
                        {statusOptions.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300 max-w-[150px] truncate" title={evt.responsible}>
                      {evt.responsible}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleInspectSpan(evt.spanId)}
                        className="p-1 rounded bg-industrial-700 hover:bg-flora-cyan hover:text-black text-gray-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                        title="Inspecionar Vão na Telemetria"
                      >
                        Inspecionar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
