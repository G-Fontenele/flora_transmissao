import React from 'react';
import { Criticidade } from '../types';

interface RiskBadgeProps {
  criticidade: Criticidade;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  criticidade,
  size = 'md',
  showDot = true
}) => {
  const styles = {
    Normal: 'bg-flora-green/10 text-flora-green border-flora-green/30',
    Atencao: 'bg-flora-yellow/10 text-flora-yellow border-flora-yellow/30',
    Alta: 'bg-flora-orange/10 text-flora-orange border-flora-orange/30',
    Critica: 'bg-flora-red/15 text-flora-red border-flora-red/40 font-semibold animate-pulse'
  }[criticidade];

  const dotColor = {
    Normal: 'bg-flora-green',
    Atencao: 'bg-flora-yellow',
    Alta: 'bg-flora-orange',
    Critica: 'bg-flora-red'
  }[criticidade];

  const sizeClass = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-mono tracking-wide ${styles} ${sizeClass}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {criticidade.toUpperCase()}
    </span>
  );
};
