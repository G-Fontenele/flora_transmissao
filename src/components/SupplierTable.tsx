import React, { useState } from 'react';
import { Users, Star, AlertTriangle, CheckCircle, ShieldAlert, DollarSign, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupplierTable: React.FC = () => {
  const { teams, suppliers } = useApp();
  const [activeTab, setActiveTab] = useState<'teams' | 'suppliers'>('teams');

  // Summary Metrics
  const availTeams = teams.filter(t => t.availability === 'Disponível').length;
  const fieldTeams = teams.filter(t => t.availability === 'Em Campo').length;
  const avgCostKm = Math.round(teams.reduce((acc, t) => acc + t.costPerKm, 0) / teams.length);

  const bestSupplier = [...suppliers].sort((a, b) => b.rating - a.rating)[0];
  const mostDelayedSupplier = [...suppliers].sort((a, b) => b.delaysCount - a.delaysCount)[0];

  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 uppercase">EQUIPES DISPONÍVEIS</span>
          <div className="text-2xl font-bold text-flora-green my-1">{availTeams} / {teams.length}</div>
          <span className="text-[11px] text-gray-400">Prontas para alocação imediata</span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 uppercase">EQUIPES EM CAMPO</span>
          <div className="text-2xl font-bold text-flora-cyan my-1">{fieldTeams}</div>
          <span className="text-[11px] text-gray-400">Em execução de roçadas</span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 uppercase">CUSTO MÉDIO POR KM</span>
          <div className="text-2xl font-bold text-white my-1">R$ {avgCostKm.toLocaleString('pt-BR')}</div>
          <span className="text-[11px] text-gray-400">Tarifa média homologada</span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between border-flora-green/30">
          <span className="text-[10px] text-flora-green uppercase font-semibold">MELHOR FORNECEDOR</span>
          <div className="text-sm font-bold text-white my-1 truncate" title={bestSupplier?.name}>
            {bestSupplier?.name}
          </div>
          <span className="text-[11px] text-flora-green flex items-center gap-1 font-bold">
            <Star className="w-3 h-3 fill-flora-green" /> {bestSupplier?.rating} — Alta Eficiência
          </span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3.5 flex flex-col justify-between border-flora-red/30">
          <span className="text-[10px] text-flora-red uppercase font-semibold">MAIS ATRASOS REGISTRADOS</span>
          <div className="text-sm font-bold text-white my-1 truncate" title={mostDelayedSupplier?.name}>
            {mostDelayedSupplier?.name}
          </div>
          <span className="text-[11px] text-flora-red font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {mostDelayedSupplier?.delaysCount} atrasos climáticos/operacionais
          </span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-industrial-800 border border-industrial-600 rounded-lg p-1 max-w-xs font-mono text-xs">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 py-1.5 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'teams' ? 'bg-flora-cyan text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Equipes de Campo ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex-1 py-1.5 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'suppliers' ? 'bg-flora-cyan text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Fornecedores ({suppliers.length})
        </button>
      </div>

      {/* Teams Table */}
      {activeTab === 'teams' && (
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-industrial-900 border-b border-industrial-600 text-[11px] text-gray-400 uppercase">
                <th className="py-3 px-3">Equipe</th>
                <th className="py-3 px-3">Empresa Contratada</th>
                <th className="py-3 px-3">Região de Atuação</th>
                <th className="py-3 px-3 text-right">Produtividade</th>
                <th className="py-3 px-3 text-right">Custo / km</th>
                <th className="py-3 px-3 text-center">Disponibilidade</th>
                <th className="py-3 px-3 text-center">Avaliação (1-5)</th>
                <th className="py-3 px-3 text-right">Atividades Concl.</th>
                <th className="py-3 px-3 text-center">Atrasos</th>
                <th className="py-3 px-3 text-right">Retrabalho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-700/60">
              {teams.map((t) => (
                <tr key={t.id} className="hover:bg-industrial-700/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{t.name}</td>
                  <td className="py-3 px-3 text-gray-300">{t.company}</td>
                  <td className="py-3 px-3 text-gray-400">{t.region}</td>
                  <td className="py-3 px-3 text-right font-bold text-flora-yellow">{t.productivityKmDay.toFixed(1)} km/dia</td>
                  <td className="py-3 px-3 text-right font-bold text-white">R$ {t.costPerKm.toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        t.availability === 'Disponível'
                          ? 'bg-flora-green/15 text-flora-green border border-flora-green/30'
                          : t.availability === 'Em Campo'
                          ? 'bg-flora-cyan/15 text-flora-cyan border border-flora-cyan/30'
                          : 'bg-flora-orange/15 text-flora-orange border border-flora-orange/30'
                      }`}
                    >
                      {t.availability.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-flora-green flex items-center justify-center gap-1 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-flora-green" /> {t.rating}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-200">{t.completedActivities}</td>
                  <td className={`py-3 px-3 text-center font-bold ${t.delays > 0 ? 'text-flora-red' : 'text-gray-400'}`}>
                    {t.delays}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-300">{t.reworkRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg overflow-x-auto shadow-lg">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-industrial-900 border-b border-industrial-600 text-[11px] text-gray-400 uppercase">
                <th className="py-3 px-4">Fornecedor / Empresa</th>
                <th className="py-3 px-4 text-center">Equipes Ativas</th>
                <th className="py-3 px-4 text-right">Custo Médio/km</th>
                <th className="py-3 px-4 text-center">Avaliação Média</th>
                <th className="py-3 px-4 text-right">Atividades Totais</th>
                <th className="py-3 px-4 text-center">Total Atrasos</th>
                <th className="py-3 px-4 text-center">Status Contratual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-700/60">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-industrial-700/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white text-sm">{s.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-flora-cyan">{s.activeTeams} equipes</td>
                  <td className="py-3 px-4 text-right font-bold text-white">R$ {s.avgCostKm.toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-4 text-center font-bold text-flora-green">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-flora-green" /> {s.rating}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-200">{s.totalActivities} ordens</td>
                  <td className={`py-3 px-4 text-center font-bold ${s.delaysCount > 3 ? 'text-flora-red' : 'text-gray-300'}`}>
                    {s.delaysCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-flora-green/15 text-flora-green border border-flora-green/30 px-2.5 py-0.5 rounded text-[11px] font-bold">
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
