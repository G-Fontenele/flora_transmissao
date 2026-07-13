import React, { useState } from 'react';
import { CheckCircle2, XCircle, Eye, AlertCircle, TrendingDown, Camera, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditItem } from '../types';

export const AuditTable: React.FC = () => {
  const { audits } = useApp();
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-industrial-800 border border-industrial-600 p-4 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase">TOTAL DE AUDITORIAS EM CAMPO</span>
            <span className="text-2xl font-bold text-white mt-1 block">{audits.length} Ordens Fiscalizadas</span>
          </div>
          <Camera className="w-8 h-8 text-flora-cyan/40" />
        </div>

        <div className="bg-industrial-800 border border-industrial-600 p-4 rounded-lg flex items-center justify-between border-flora-green/30">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase">TAXA DE APROVAÇÃO TÉCNICA</span>
            <span className="text-2xl font-bold text-flora-green mt-1 block">
              {Math.round((audits.filter(a => a.validationStatus === 'Aprovado').length / audits.length) * 100)}%
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-flora-green/40" />
        </div>

        <div className="bg-industrial-800 border border-industrial-600 p-4 rounded-lg flex items-center justify-between border-flora-red/30">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase">RETRABALHO E PENDÊNCIAS</span>
            <span className="text-2xl font-bold text-flora-red mt-1 block">
              {audits.filter(a => a.validationStatus === 'Retrabalho').length} Ordem(ns)
            </span>
          </div>
          <XCircle className="w-8 h-8 text-flora-red/40" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-industrial-900 border-b border-industrial-600 text-[11px] text-gray-400 uppercase">
              <th className="py-3 px-3">Atividade ID</th>
              <th className="py-3 px-3">Linha / Vão Fiscalizado</th>
              <th className="py-3 px-3 text-center">Data Executada</th>
              <th className="py-3 px-3 text-right">Extensão</th>
              <th className="py-3 px-3 text-right">Custo Planejado</th>
              <th className="py-3 px-3 text-right">Custo Real</th>
              <th className="py-3 px-3 text-right">Variação (%)</th>
              <th className="py-3 px-3 text-center">VI Anterior vs. Novo</th>
              <th className="py-3 px-3">Fiscal Responsável</th>
              <th className="py-3 px-3 text-center">Validação de Campo</th>
              <th className="py-3 px-3 text-center">Evidência Fotográfica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-700/60">
            {audits.map((item) => {
              const varianceColor = item.varianceCost > 5 ? 'text-flora-red' : item.varianceCost < 0 ? 'text-flora-green' : 'text-gray-300';
              const viReduction = Math.round(((item.oldVegetationIndex - item.newVegetationIndex) / item.oldVegetationIndex) * 100);

              return (
                <tr key={item.id} className="hover:bg-industrial-700/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{item.activityId}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{item.spanName}</span>
                    <span className="text-[11px] text-gray-400 max-w-[200px] truncate block">{item.lineName}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-300">{item.executedDate}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-200">{item.executedKm} km</td>
                  <td className="py-3 px-3 text-right text-gray-400">R$ {item.plannedCost.toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-3 text-right font-bold text-white">R$ {item.actualCost.toLocaleString('pt-BR')}</td>
                  <td className={`py-3 px-3 text-right font-bold ${varianceColor}`}>
                    {item.varianceCost > 0 ? `+${item.varianceCost}%` : `${item.varianceCost}%`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-gray-400">{item.oldVegetationIndex.toFixed(2)}</span>
                    <span className="mx-1 text-gray-500">➔</span>
                    <span className="font-bold text-flora-green">{item.newVegetationIndex.toFixed(2)} (-{viReduction}%)</span>
                  </td>
                  <td className="py-3 px-3 text-gray-300 truncate max-w-[150px]" title={item.responsible}>
                    {item.responsible}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.validationStatus === 'Aprovado'
                          ? 'bg-flora-green/15 text-flora-green border border-flora-green/30'
                          : 'bg-flora-red/15 text-flora-red border border-flora-red/30 animate-pulse'
                      }`}
                    >
                      {item.validationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedAudit(item)}
                      className="p-1.5 rounded bg-industrial-900 border border-industrial-600 text-flora-cyan hover:bg-flora-cyan hover:text-black transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Antes/Depois
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Before / After Photo Evidence Inspector Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-800 border border-industrial-600 rounded-lg max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-industrial-700 pb-3">
              <div>
                <span className="text-xs text-flora-cyan uppercase font-bold tracking-wider">
                  EVIDÊNCIA FOTOGRÁFICA & INSPEÇÃO GEORREFERENCIADA
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedAudit.activityId} — {selectedAudit.spanName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-3 py-1 bg-industrial-700 text-gray-300 hover:text-white rounded transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Comparison Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-industrial-900 p-3 rounded border border-industrial-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-flora-orange">
                  <span>1. ANTES DA ROÇADA (VI: {selectedAudit.oldVegetationIndex.toFixed(2)})</span>
                  <span>Data Prevista: {selectedAudit.plannedDate}</span>
                </div>
                <div className="aspect-video bg-industrial-950 rounded overflow-hidden relative border border-industrial-700 flex items-center justify-center">
                  <img
                    src={selectedAudit.beforeImage}
                    alt="Antes da roçada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-gray-500 font-mono text-xs pointer-events-none">
                    [Registro Satélite/Drone: Faixa Densa e Vegetação Alta]
                  </span>
                </div>
              </div>

              <div className="bg-industrial-900 p-3 rounded border border-flora-green/30 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-flora-green">
                  <span>2. DEPOIS DA INTERVENÇÃO (VI: {selectedAudit.newVegetationIndex.toFixed(2)})</span>
                  <span>Executado: {selectedAudit.executedDate}</span>
                </div>
                <div className="aspect-video bg-industrial-950 rounded overflow-hidden relative border border-flora-green/40 flex items-center justify-center">
                  <img
                    src={selectedAudit.afterImage}
                    alt="Depois da roçada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-gray-500 font-mono text-xs pointer-events-none">
                    [Registro Validação: Faixa 100% Limpa de 50 Metros]
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Notes */}
            <div className="bg-industrial-900 p-4 rounded border border-industrial-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-flora-cyan shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">PARECER DO FISCAL DE CAMPO ({selectedAudit.responsible}):</span>
                <p className="text-gray-300 italic">{selectedAudit.notes || 'Nenhuma observação extra.'}</p>
                <div className="flex gap-4 pt-2 text-gray-400 text-xs">
                  <span>Custo Real: <strong className="text-white">R$ {selectedAudit.actualCost.toLocaleString('pt-BR')}</strong></span>
                  <span>Extensão: <strong className="text-white">{selectedAudit.executedKm} km</strong></span>
                  <span>Status: <strong className="text-white">{selectedAudit.validationStatus}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
