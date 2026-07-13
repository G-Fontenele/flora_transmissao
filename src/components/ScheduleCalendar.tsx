import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Lock, Unlock, AlertCircle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { ScheduleActivity } from '../types';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../context/AppContext';

export const ScheduleCalendar: React.FC = () => {
  const { activities, toggleActivityLock, filterLine } = useApp();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('week');
  const [showConflicts, setShowConflicts] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');

  const filteredActivities = useMemo(() => {
    return activities.filter(a => filterLine === 'all' || a.lineName === filterLine);
  }, [activities, filterLine]);

  // Group by date or by week
  const groupedByDate = useMemo(() => {
    const map: { [date: string]: ScheduleActivity[] } = {};
    filteredActivities.forEach(act => {
      if (!map[act.scheduledDate]) map[act.scheduledDate] = [];
      map[act.scheduledDate].push(act);
    });
    return map;
  }, [filteredActivities]);

  // Check conflicts (same team scheduled on same date or overlapping days)
  const conflictsCount = useMemo(() => {
    let conflicts = 0;
    Object.values(groupedByDate).forEach(acts => {
      const teamsInDay = new Set<string>();
      acts.forEach(a => {
        if (teamsInDay.has(a.assignedTeam)) conflicts++;
        teamsInDay.add(a.assignedTeam);
      });
    });
    return conflicts;
  }, [groupedByDate]);

  const handleQuickReschedule = (actId: string) => {
    if (!rescheduleDate) return;
    // simulated reschedule in local state
    activities.forEach(a => {
      if (a.id === actId && !a.isLocked) {
        a.scheduledDate = rescheduleDate;
      }
    });
    setSelectedActivity(null);
    setRescheduleDate('');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar Controls */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-flora-cyan" />
          <span className="font-bold text-white tracking-wider uppercase">
            CALENDÁRIO OPERACIONAL DE ROÇADA MECANIZADA E PODA
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex bg-industrial-900 p-1 rounded border border-industrial-700">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'month' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mês (Visão 30d)
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'week' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Semana (Agrupada)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'list' ? 'bg-flora-cyan text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Lista de Ordens
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 transition-colors font-bold ${
              showConflicts || conflictsCount > 0
                ? 'bg-flora-red/15 border-flora-red/50 text-flora-red animate-pulse'
                : 'bg-industrial-900 border-industrial-600 text-gray-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Conflitos & Atrasos ({conflictsCount + activities.filter(a => a.status === 'Atrasado').length})
          </button>

          <button
            onClick={() => {
              activities.forEach(a => { if (a.status === 'Aprovado' || a.status === 'Em Execução') a.isLocked = true; });
            }}
            className="px-3 py-1.5 rounded bg-industrial-900 border border-flora-green/40 text-flora-green hover:bg-flora-green/10 flex items-center gap-1.5 font-bold transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Travar Ordens Aprovadas
          </button>
        </div>
      </div>

      {/* Conflicts Banner */}
      {(showConflicts || conflictsCount > 0) && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-3 text-xs font-mono">
          <AlertCircle className="w-5 h-5 text-flora-red shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">
              DIAGNÓSTICO DE CONFLITOS DE ALOCAÇÃO DE EQUIPES E ATRASOS CLIMÁTICOS:
            </span>
            <p className="text-gray-300">
              {conflictsCount > 0
                ? `Foram identificados ${conflictsCount} conflito(s) de agendamento onde a mesma equipe foi alocada para vãos distantes no mesmo dia.`
                : 'Nenhum conflito direto de equipe na mesma data.'}
            </p>
            {activities.filter(a => a.status === 'Atrasado').length > 0 && (
              <p className="text-flora-yellow font-semibold">
                ⚠️ Existem {activities.filter(a => a.status === 'Atrasado').length} atividade(s) com status "Atrasado" que requerem reagendamento prioritário ou alocação de equipe reserva!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Week / Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedByDate)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateStr, acts]) => (
              <div
                key={dateStr}
                className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between space-y-3 shadow-md hover:border-industrial-400 transition-all"
              >
                <div className="border-b border-industrial-700 pb-2 flex items-center justify-between font-mono">
                  <span className="text-sm font-bold text-flora-cyan flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {dateStr}
                  </span>
                  <span className="text-[10px] bg-industrial-900 px-2 py-0.5 rounded text-gray-400 border border-industrial-700">
                    {acts.length} Ordem(ns)
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 font-mono text-xs">
                  {acts.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className={`p-2.5 rounded border transition-all cursor-pointer ${
                        act.status === 'Atrasado'
                          ? 'bg-red-950/30 border-flora-red/50 text-flora-red'
                          : act.isLocked
                          ? 'bg-industrial-900 border-flora-green/30 text-gray-200'
                          : 'bg-industrial-900/60 border-industrial-700 text-gray-300 hover:border-flora-cyan'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white flex items-center gap-1">
                          {act.id}
                          {act.isLocked && <span title="Ordem Travada/Aprovada"><Lock className="w-3 h-3 text-flora-green" /></span>}
                        </span>
                        <StatusBadge status={act.status} />
                      </div>

                      <span className="text-[11px] text-gray-400 block truncate" title={act.lineName}>
                        {act.lineName}
                      </span>
                      <div className="text-[11px] font-semibold text-gray-200 mt-1">
                        Vãos: {act.spansIncluded.join(', ')} ({act.lengthKm} km)
                      </div>

                      <div className="mt-2 pt-2 border-t border-industrial-700/60 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="truncate max-w-[150px]" title={act.assignedTeam}>
                          {act.assignedTeam.split('(')[0]}
                        </span>
                        <span className="font-bold text-flora-cyan">R$ {act.estimatedCost.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-industrial-700 flex justify-between font-mono text-[11px] text-gray-400">
                  <span>Km do Dia: <strong className="text-white">{acts.reduce((acc, a) => acc + a.lengthKm, 0).toFixed(1)} km</strong></span>
                  <span>Custo Total: <strong className="text-white">R$ {acts.reduce((acc, a) => acc + a.estimatedCost, 0).toLocaleString('pt-BR')}</strong></span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Month / List View */}
      {(viewMode === 'month' || viewMode === 'list') && (
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-industrial-900 border-b border-industrial-600 text-[11px] text-gray-400 uppercase">
                <th className="py-3 px-3">Ordem ID</th>
                <th className="py-3 px-3">Data Prevista</th>
                <th className="py-3 px-3">Linha de Transmissão</th>
                <th className="py-3 px-3">Trechos / Vãos</th>
                <th className="py-3 px-3 text-right">Extensão</th>
                <th className="py-3 px-3">Equipe Alocada</th>
                <th className="py-3 px-3 text-right">Custo Est. (R$)</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3">Janela Climática Rec.</th>
                <th className="py-3 px-3 text-center">Travamento</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-700/60">
              {filteredActivities.map((act) => (
                <tr
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className={`hover:bg-industrial-700/40 transition-colors cursor-pointer ${
                    act.status === 'Atrasado' ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-white">{act.id}</td>
                  <td className="py-2.5 px-3 text-flora-cyan font-bold whitespace-nowrap">{act.scheduledDate}</td>
                  <td className="py-2.5 px-3 text-gray-300 max-w-[200px] truncate">{act.lineName}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{act.spansIncluded.join(', ')}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-200">{act.lengthKm} km</td>
                  <td className="py-2.5 px-3 text-gray-300 max-w-[180px] truncate">{act.assignedTeam}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    R$ {act.estimatedCost.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-industrial-900 border border-industrial-600 px-2 py-0.5 rounded font-bold text-flora-orange">
                      {act.priorityScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px]">{act.windowRecommended}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActivityLock(act.id);
                      }}
                      className="p-1 rounded bg-industrial-900 hover:bg-industrial-700 transition-colors"
                      title={act.isLocked ? 'Desbloquear ordem' : 'Travar ordem (Aprovada)'}
                    >
                      {act.isLocked ? (
                        <Lock className="w-4 h-4 text-flora-green" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={act.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Detail / Quick Reschedule Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-800 border border-industrial-600 rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-industrial-700 pb-3">
              <div>
                <span className="text-[10px] text-flora-cyan uppercase font-bold block">
                  DETALHE DA ORDEM DE ROÇADA
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedActivity.id}</h3>
              </div>
              <StatusBadge status={selectedActivity.status} />
            </div>

            <div className="space-y-2.5 bg-industrial-900 p-3.5 rounded border border-industrial-700">
              <div>
                <span className="text-gray-400 block text-[10px]">LINHA & TRECHOS</span>
                <span className="text-white font-bold">{selectedActivity.lineName}</span>
                <span className="text-gray-300 block mt-0.5">{selectedActivity.spansIncluded.join(', ')} ({selectedActivity.lengthKm} km)</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">EQUIPE ALOCADA</span>
                <span className="text-white font-semibold">{selectedActivity.assignedTeam}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">JUSTIFICATIVA TÉCNICA</span>
                <p className="text-gray-300 italic">{selectedActivity.justification}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-industrial-700">
                <div>
                  <span className="text-gray-400 block text-[10px]">CUSTO ESTIMADO</span>
                  <span className="text-flora-cyan font-bold text-sm">R$ {selectedActivity.estimatedCost.toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DURAÇÃO PREVISTA</span>
                  <span className="text-white font-bold text-sm">{selectedActivity.durationHours}h operacionais</span>
                </div>
              </div>
            </div>

            {/* Reschedule input if not locked */}
            {!selectedActivity.isLocked ? (
              <div className="bg-industrial-900/60 p-3 rounded border border-industrial-700 space-y-2">
                <label className="block font-bold text-gray-300">
                  REAGENDAR OU ADJUSTAR DATA DA ORDEM:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={rescheduleDate || selectedActivity.scheduledDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="flex-1 bg-industrial-950 border border-industrial-600 rounded px-3 py-1.5 text-white focus:outline-none focus:border-flora-cyan font-mono text-xs"
                  />
                  <button
                    onClick={() => handleQuickReschedule(selectedActivity.id)}
                    className="px-3 py-1.5 bg-flora-cyan text-black font-bold rounded hover:bg-flora-cyan/90 transition-colors"
                  >
                    Salvar Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-flora-green/10 border border-flora-green/30 rounded text-flora-green font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Ordem travada! Para reagendar, destrave a atividade na tabela/card.
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-industrial-700">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-industrial-700 text-white rounded hover:bg-industrial-600 transition-colors font-bold"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
