import React, { useState } from 'react';
import { X, AlertTriangle, CalendarPlus, CheckCircle2, ShieldAlert, Activity, TrendingUp } from 'lucide-react';
import { TransmissionSpan } from '../types';
import { RiskBadge } from './RiskBadge';
import { useApp } from '../context/AppContext';

interface SpanDetailPanelProps {
  span: TransmissionSpan | null;
  onClose: () => void;
}

export const SpanDetailPanel: React.FC<SpanDetailPanelProps> = ({ span, onClose }) => {
  const { createEventForSpan, addSpanToSchedule } = useApp();
  const [eventCreated, setEventCreated] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  if (!span) return null;

  const handleCreateEvent = () => {
    createEventForSpan(span.id);
    setEventCreated(true);
    setTimeout(() => setEventCreated(false), 3000);
  };

  const handleAddSchedule = () => {
    addSpanToSchedule(span.id);
    setScheduled(true);
    setTimeout(() => setScheduled(false), 3000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-industrial-800 border-l border-industrial-600 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-industrial-600 flex items-center justify-between bg-industrial-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-flora-cyan uppercase font-semibold">
              INSPEÇÃO DO VÃO
            </span>
            <RiskBadge criticidade={span.status} size="sm" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1">
            {span.startTower} ➔ {span.endTower}
          </h2>
          <p className="text-xs text-gray-400 truncate max-w-[320px]">
            {span.lineName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded bg-industrial-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 bg-industrial-900 p-3 rounded border border-industrial-700 font-mono text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">EXTENSÃO / COMPRIMENTO</span>
            <span className="text-white font-bold text-sm">{span.lengthKm} km</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">REGIÃO GEOGRÁFICA</span>
            <span className="text-white font-bold text-sm">{span.region}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">ÚLTIMA INSPEÇÃO</span>
            <span className="text-gray-300">{span.lastInspectionDate}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">ÚLTIMA ROÇADA</span>
            <span className="text-gray-300">{span.lastMowingDate}</span>
          </div>
        </div>

        {/* Priority Score Breakdown */}
        <div className="bg-industrial-900/80 p-4 rounded border border-industrial-600">
          <div className="flex items-center justify-between mb-3 border-b border-industrial-700 pb-2">
            <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-flora-cyan" />
              PRIORITY SCORE OPERACIONAL
            </span>
            <span className="text-2xl font-mono font-bold text-white bg-industrial-700 px-2.5 py-0.5 rounded border border-industrial-500">
              {span.priorityScore}/100
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Vegetation Index (VI) — [Peso 35%]</span>
                <span className="text-white font-bold">{(span.vegetationIndex * 100).toFixed(0)} / 100</span>
              </div>
              <div className="w-full bg-industrial-950 h-1.5 rounded overflow-hidden">
                <div className="bg-flora-cyan h-full" style={{ width: `${span.vegetationIndex * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Clearance Risk (CR) — [Peso 25%]</span>
                <span className="text-white font-bold">{(span.clearanceRisk * 100).toFixed(0)} / 100</span>
              </div>
              <div className="w-full bg-industrial-950 h-1.5 rounded overflow-hidden">
                <div className="bg-flora-orange h-full" style={{ width: `${span.clearanceRisk * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Growth Rate 30d — [Peso 20%]</span>
                <span className="text-white font-bold">+{span.growth30d}%</span>
              </div>
              <div className="w-full bg-industrial-950 h-1.5 rounded overflow-hidden">
                <div className="bg-flora-yellow h-full" style={{ width: `${Math.min(100, span.growth30d * 2)}%` }} />
              </div>
            </div>

            <div className="flex justify-between pt-1 text-[11px] text-gray-400 border-t border-industrial-700/60">
              <span>Reincidência (10%): {(span.recurrenceScore * 100).toFixed(0)} pts</span>
              <span>Urgência (10%): {(span.urgencyScore * 100).toFixed(0)} pts</span>
            </div>
          </div>
        </div>

        {/* Growth Rate comparison table */}
        <div className="bg-industrial-900 p-3 rounded border border-industrial-700">
          <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 mb-2.5">
            <TrendingUp className="w-4 h-4 text-flora-yellow" />
            TAXA DE CRESCIMENTO OBSERVADO (SATELLITE)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="bg-industrial-800 p-2 rounded">
              <span className="text-[10px] text-gray-400 block">GR 15 DIAS</span>
              <span className="text-flora-yellow font-bold">+{span.growth15d}%</span>
            </div>
            <div className="bg-industrial-800 p-2 rounded border border-flora-yellow/30">
              <span className="text-[10px] text-gray-400 block">GR 30 DIAS</span>
              <span className="text-flora-yellow font-bold text-sm">+{span.growth30d}%</span>
            </div>
            <div className="bg-industrial-800 p-2 rounded">
              <span className="text-[10px] text-gray-400 block">GR 90 DIAS</span>
              <span className="text-flora-orange font-bold">+{span.growth90d}%</span>
            </div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-industrial-900 p-3.5 rounded border border-flora-cyan/40">
          <span className="text-xs font-mono text-flora-cyan font-bold block mb-1">
            AÇÃO RECOMENDADA PELO FLORA
          </span>
          <p className="text-xs text-gray-200 font-medium leading-relaxed">
            {span.recommendedAction}
          </p>
          <div className="mt-2.5 pt-2 border-t border-industrial-700 flex justify-between font-mono text-xs text-gray-400">
            <span>Custo Est.: <strong className="text-white">R$ {span.estimatedCost.toLocaleString('pt-BR')}</strong></span>
            <span>Duração: <strong className="text-white">{span.estimatedDurationHours}h</strong></span>
          </div>
        </div>

        {/* Formula calculation note */}
        <div className="p-3 bg-industrial-950/60 rounded border border-industrial-700 text-[11px] font-mono text-gray-400 space-y-1">
          <span className="text-gray-300 font-semibold block flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-flora-cyan" />
            FÓRMULA DE CÁLCULO TRANSPARENTE:
          </span>
          <p>
            PS = 0,35×VI + 0,25×CR + 0,20×GR30 + 0,10×REINC + 0,10×PRAZO.
          </p>
          <p className="text-gray-500 text-[10px]">
            * Cálculo autônomo sobre telemetria e sensoriamento de vegetação sem dependência externa.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-industrial-600 bg-industrial-900 flex flex-col gap-2.5">
        <button
          onClick={handleCreateEvent}
          disabled={eventCreated}
          className={`w-full py-2.5 px-4 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            eventCreated
              ? 'bg-flora-green text-black'
              : 'bg-flora-red text-white hover:bg-flora-red/90 glow-red'
          }`}
        >
          {eventCreated ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              EVENTO OPERACIONAL CRIADO!
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              CRIAR EVENTO DE VEGETAÇÃO
            </>
          )}
        </button>

        <button
          onClick={handleAddSchedule}
          disabled={scheduled}
          className={`w-full py-2.5 px-4 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            scheduled
              ? 'bg-flora-green/20 border-flora-green text-flora-green'
              : 'bg-industrial-800 border-industrial-500 text-gray-200 hover:bg-industrial-700 hover:text-white'
          }`}
        >
          {scheduled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              ADICIONADO AO CALENDÁRIO!
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4 text-flora-cyan" />
              ADICIONAR AO CALENDÁRIO DE ROÇADA
            </>
          )}
        </button>
      </div>
    </div>
  );
};
