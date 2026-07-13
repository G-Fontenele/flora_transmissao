import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { SupplierTable } from '../components/SupplierTable';
import { Users, Plus } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Equipes e Fornecedores Homologados"
        subtitle="Controle de capacidade produtiva, avaliações de desempenho em campo, atrasos e custos por km"
        actions={
          <button
            onClick={() => alert('Modal simulado de homologação de novo fornecedor ou cadastro de equipe abria aqui no centro operacional.')}
            className="px-4 py-2 bg-flora-cyan text-black font-mono font-bold text-xs rounded hover:bg-flora-cyan/90 transition-colors flex items-center gap-1.5 shadow glow-cyan"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Equipe
          </button>
        }
      />

      <SupplierTable />
    </div>
  );
};
