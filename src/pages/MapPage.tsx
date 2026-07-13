import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FilterBar } from '../components/FilterBar';
import { TransmissionMap, MapLayer } from '../components/TransmissionMap';
import { SpanDetailPanel } from '../components/SpanDetailPanel';
import { useApp } from '../context/AppContext';
import { Layers, AlertCircle } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { selectedSpan, setSelectedSpan } = useApp();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('priority');

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Mapa Operacional de Risco SIN (Satelital & Vetorial)"
        subtitle="Visualização georreferenciada da malha SIN — 1.840 Linhas de Transmissão (≥ 230 kV) e 922 Subestações"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-gray-300 bg-industrial-800 px-3 py-1.5 rounded border border-industrial-600">
            <AlertCircle className="w-4 h-4 text-flora-cyan" />
            <span>Selecione qualquer vão para inspecionar e criar ordens</span>
          </div>
        }
      />

      <FilterBar />

      <TransmissionMap layer={activeLayer} onLayerChange={setActiveLayer} height="h-[680px]" />

      <SpanDetailPanel
        span={selectedSpan}
        onClose={() => setSelectedSpan(null)}
      />
    </div>
  );
};
