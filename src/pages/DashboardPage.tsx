import React from 'react';
import {
  AlertTriangle,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  BarChart3,
  ChevronRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { FilterBar } from '../components/FilterBar';
import { RankingTable } from '../components/RankingTable';
import { EventsTable } from '../components/EventsTable';
import { TrendChart } from '../components/TrendChart';

export const DashboardPage: React.FC = () => {
  const { spans, events, setActivePage } = useApp();

  // Calculate 8 Essential Executive KPIs
  const criticalSpansCount = spans.filter(s => s.status === 'Critica' || s.status === 'Alta').length;
  const criticalKmTotal = Math.round(
    spans.filter(s => s.status === 'Critica' || s.status === 'Alta').reduce((acc, s) => acc + s.lengthKm, 0) * 10
  ) / 10;
  const openEventsCount = events.filter(e => e.status === 'Aberto' || e.status === 'Em analise').length;
  const avgVi = Math.round((spans.reduce((acc, s) => acc + s.vegetationIndex, 0) / spans.length) * 100) / 100;
  const avgGr30 = Math.round(spans.reduce((acc, s) => acc + s.growth30d, 0) / spans.length);
  const pendingCost = Math.round(
    spans.filter(s => s.status === 'Critica' || s.status === 'Alta').reduce((acc, s) => acc + s.estimatedCost, 0)
  );
  const estimatedSavings = Math.round(pendingCost * 0.28); // 28% savings from priority grouping vs ad-hoc
  const compliancePercent = Math.round(
    (spans.filter(s => s.status === 'Normal' || s.status === 'Atencao').length / spans.length) * 100
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Executivo FLORA"
        subtitle="Centro de Monitoramento Operacional de Vegetação e Faixas de Servidão"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActivePage('otimizador')}
              className="px-3.5 py-2 rounded bg-flora-cyan text-black font-mono font-bold text-xs hover:bg-flora-cyan/90 transition-colors flex items-center gap-1.5 shadow-md glow-cyan"
            >
              <Activity className="w-4 h-4" />
              Executar Otimizador
            </button>
            <button
              onClick={() => setActivePage('mapa')}
              className="px-3.5 py-2 rounded bg-industrial-800 border border-industrial-500 text-gray-200 font-mono font-bold text-xs hover:bg-industrial-700 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-flora-cyan" />
              Abrir Mapa de Risco
            </button>
          </div>
        }
      />

      <FilterBar />

      {/* 8 KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Trechos Críticos / Altos"
          value={`${criticalSpansCount} vãos`}
          subtitle={`De um total de ${spans.length} vãos monitorados`}
          trend="↑ 4 vãos nesta quinzena"
          trendType="negative"
          icon={AlertTriangle}
          color="red"
        />
        <KpiCard
          title="Extensão Crítica (km)"
          value={`${criticalKmTotal} km`}
          subtitle="Faixa com risco imediato de aproximação"
          trend="Ação requerida em até 7 dias"
          trendType="negative"
          icon={ShieldAlert}
          color="orange"
        />
        <KpiCard
          title="Eventos Abertos"
          value={openEventsCount}
          subtitle={`Total de ${events.length} ocorrências registradas`}
          trend="12 em análise pelas equipes"
          trendType="neutral"
          icon={Activity}
          color="yellow"
        />
        <KpiCard
          title="Conformidade da Malha"
          value={`${compliancePercent}%`}
          subtitle="Vãos em estado Normal ou Atenção"
          trend="+4.2% em relação ao mês anterior"
          trendType="positive"
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Índice Médio Vegetação (VI)"
          value={avgVi.toFixed(2)}
          subtitle="Escala normalizada NDVI de 0.00 a 1.00"
          trend="↓ -0.05 após roçadas em Junho"
          trendType="positive"
          icon={BarChart3}
          color="cyan"
        />
        <KpiCard
          title="Crescimento Médio (30d)"
          value={`+${avgGr30}%`}
          subtitle="Taxa acelerada na Região Serrana"
          trend="Monitoramento diário por satélite"
          trendType="neutral"
          icon={TrendingUp}
          color="yellow"
        />
        <KpiCard
          title="Custo Pendente Estimado"
          value={`R$ ${pendingCost.toLocaleString('pt-BR')}`}
          subtitle="Para roçada de 100% dos vãos críticos"
          trend="Orçamento disponível dentro do teto"
          trendType="neutral"
          icon={DollarSign}
          color="cyan"
        />
        <KpiCard
          title="Economia por Priorização"
          value={`R$ ${estimatedSavings.toLocaleString('pt-BR')}`}
          subtitle="Economia vs. roçada cíclica não-otimizada"
          trend="+28% de eficiência de alocação"
          trendType="positive"
          icon={TrendingDown}
          color="green"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart type="vi" />
        <TrendChart type="km" />
      </div>

      {/* Top Ranking & Recent Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-flora-red" />
              Trechos Mais Críticos da Malha (Top 6)
            </span>
            <button
              onClick={() => setActivePage('mapa')}
              className="text-xs font-mono text-flora-cyan hover:underline flex items-center gap-1"
            >
              Ver todos no mapa <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <RankingTable limit={6} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-flora-yellow" />
              Ocorrências e Eventos Recentes
            </span>
            <button
              onClick={() => setActivePage('eventos')}
              className="text-xs font-mono text-flora-cyan hover:underline flex items-center gap-1"
            >
              Central de Eventos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <EventsTable limit={6} />
        </div>
      </div>
    </div>
  );
};
