import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { AuditTable } from '../components/AuditTable';
import { CheckSquare } from 'lucide-react';

export const AuditPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria e Fiscalização Pós-Roçada"
        subtitle="Verificação visual por satélite/drone, comparativo de índices (antes vs. depois) e controle de desvio de custos"
      />

      <AuditTable />
    </div>
  );
};
