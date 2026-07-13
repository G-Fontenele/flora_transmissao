import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FileText, Download, CheckCircle2, BarChart2, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrendChart } from '../components/TrendChart';

export const ReportsPage: React.FC = () => {
  const { spans, events, activities, teams, audits } = useApp();
  const [exported, setExported] = useState<'pdf' | 'csv' | null>(null);

  const handleExport = (type: 'pdf' | 'csv') => {
    setExported(type);
    setTimeout(() => setExported(null), 3500);
  };

  const totalCostPlanned = audits.reduce((acc, a) => acc + a.plannedCost, 0);
  const totalCostActual = audits.reduce((acc, a) => acc + a.actualCost, 0);
  const reincidentSpans = spans.filter(s => s.recurrenceScore > 0.6).length;

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="Relatórios Executivos e Operacionais"
        subtitle="Consolidado analítico de risco, cumprimento de plano, custos e eficiência de fornecedores"
        actions={
          <div className="flex gap-2.5">
            <button
              onClick={() => handleExport('csv')}
              disabled={exported !== null}
              className={`px-4 py-2 rounded font-bold transition-all flex items-center gap-2 border ${
                exported === 'csv'
                  ? 'bg-flora-green/20 border-flora-green text-flora-green'
                  : 'bg-industrial-800 border-industrial-500 text-gray-200 hover:bg-industrial-700 hover:text-white'
              }`}
            >
              {exported === 'csv' ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4 text-flora-cyan" />}
              {exported === 'csv' ? 'ARQUIVO CSV GERADO!' : 'Exportar Dados (CSV)'}
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={exported !== null}
              className={`px-4 py-2 rounded font-bold transition-all flex items-center gap-2 shadow-lg ${
                exported === 'pdf'
                  ? 'bg-flora-green text-black'
                  : 'bg-flora-cyan text-black hover:bg-flora-cyan/90 glow-cyan'
              }`}
            >
              {exported === 'pdf' ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {exported === 'pdf' ? 'RELATÓRIO PDF EXPORTADO!' : 'Exportar Relatório PDF'}
            </button>
          </div>
        }
      />

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Custo Planejado vs. Realizado</span>
          <div className="text-lg font-bold text-white flex items-baseline gap-2">
            R$ {totalCostActual.toLocaleString('pt-BR')}
            <span className="text-xs font-normal text-gray-400">(vs. R$ {totalCostPlanned.toLocaleString('pt-BR')})</span>
          </div>
          <span className="text-[11px] text-flora-green block font-semibold">
            Variação contratual controlada ({((totalCostActual - totalCostPlanned) / totalCostPlanned * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Trechos com Reincidência Crítica</span>
          <div className="text-2xl font-bold text-flora-orange">{reincidentSpans} Vãos</div>
          <span className="text-[11px] text-gray-400 block">
            Requer substituição de herbicida ou poda de eucaliptos
          </span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Cumprimento do Plano de Roçada</span>
          <div className="text-2xl font-bold text-flora-green">94.2%</div>
          <span className="text-[11px] text-gray-400 block">
            {activities.filter(a => a.status === 'Concluído' || a.status === 'Em Execução').length} de {activities.length} ordens no cronograma
          </span>
        </div>

        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Redução Média de VI Pós-Roçada</span>
          <div className="text-2xl font-bold text-flora-cyan">-78.5%</div>
          <span className="text-[11px] text-gray-400 block">
            Índice caindo de 0.81 para 0.17 em média nos vãos auditados
          </span>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart type="vi" />
        <TrendChart type="conformidade" />
      </div>

      {/* Reports Directory Grid */}
      <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-5 space-y-4">
        <div className="border-b border-industrial-700 pb-2 font-bold text-white uppercase text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-flora-cyan" />
          Módulos de Relatório Prontos para Extração Executiva
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '1. Evolução do Risco e VI por Linha',
              desc: 'Série histórica comparativa entre as linhas de 500 kV, 345 kV e 230 kV ao longo dos últimos 180 dias de sobrevoo por satélite.',
              tag: 'Série Temporal / Mensal'
            },
            {
              title: '2. Km Críticos e Risco de Aproximação',
              desc: 'Mapeamento pormenorizado em quilômetros de faixa com copa de vegetação a menos de 4.5 metros dos cabos condutores.',
              tag: 'Conformidade Regulatória'
            },
            {
              title: '3. Auditoria de Custo Planejado vs. Realizado',
              desc: 'Análise contábil de desvios por fornecedor contratado, justificando aditivos e quilometragem extra em encostas.',
              tag: 'Gestão Orçamentária'
            },
            {
              title: '4. Economia Ponderada por Priorização',
              desc: 'Demonstração de ROI do FLORA provando redução de até 28% no custo global ao substituir roçadas cíclicas cegas por priorização.',
              tag: 'ROI / Executivo'
            },
            {
              title: '5. Produtividade & SLA de Equipes',
              desc: 'Ranking de eficiência de avanço diário (km/dia), índice de pontualidade na entrega e taxa de aprovação no primeiro sobrevoo.',
              tag: 'Fornecedores & P&M'
            },
            {
              title: '6. Trechos Reincidentes e Espécies Invasoras',
              desc: 'Identificação de hotspots de rápida regeneração (bambuzais, capim colonião e eucaliptos não autorizados) com plano de erradicação.',
              tag: 'Inteligência Botânica'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-industrial-900 p-4 rounded border border-industrial-700 flex flex-col justify-between hover:border-flora-cyan/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-bold text-white text-xs">{item.title}</span>
                  <span className="text-[10px] bg-industrial-950 px-2 py-0.5 rounded text-flora-cyan border border-industrial-700 whitespace-nowrap">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full py-1.5 rounded bg-industrial-800 border border-industrial-600 text-gray-300 hover:text-white hover:border-flora-cyan transition-colors text-center text-[11px] font-bold"
              >
                Gerar Relatório Completo ➔
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
