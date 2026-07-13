import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { OptimizationPanel } from '../components/OptimizationPanel';
import { Zap } from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Otimizador de Roçada Multicritério"
        subtitle="Módulo heurístico para simulação e planejamento automático balanceando criticidade, custo, equipes e distâncias"
      />

      <OptimizationPanel />
    </div>
  );
};
