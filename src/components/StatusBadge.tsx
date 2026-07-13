import React from 'react';
import { EventStatus } from '../types';

interface StatusBadgeProps {
  status: EventStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let style = 'bg-gray-800 text-gray-300 border-gray-600';

  if (status === 'Aberto') {
    style = 'bg-flora-red/10 text-flora-red border-flora-red/30';
  } else if (status === 'Em analise') {
    style = 'bg-flora-yellow/10 text-flora-yellow border-flora-yellow/30';
  } else if (status === 'Planejado' || status === 'Programado') {
    style = 'bg-flora-cyan/10 text-flora-cyan border-flora-cyan/30';
  } else if (status === 'Em execucao' || status === 'Em Execução') {
    style = 'bg-flora-orange/10 text-flora-orange border-flora-orange/30';
  } else if (status === 'Executado' || status === 'Concluído' || status === 'Validado' || status === 'Aprovado') {
    style = 'bg-flora-green/10 text-flora-green border-flora-green/30';
  } else if (status === 'Cancelado' || status === 'Atrasado' || status === 'Retrabalho') {
    style = 'bg-red-950/40 text-red-400 border-red-800/50';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-mono tracking-tight ${style}`}>
      {status.toUpperCase()}
    </span>
  );
};
