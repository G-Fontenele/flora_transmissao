import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'cyan';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  icon: Icon,
  color = 'cyan'
}) => {
  const colorClasses = {
    green: 'border-flora-green/30 text-flora-green bg-flora-green/10',
    yellow: 'border-flora-yellow/30 text-flora-yellow bg-flora-yellow/10',
    orange: 'border-flora-orange/30 text-flora-orange bg-flora-orange/10',
    red: 'border-flora-red/30 text-flora-red bg-flora-red/10',
    cyan: 'border-flora-cyan/30 text-flora-cyan bg-flora-cyan/10'
  };

  const trendColor = {
    positive: 'text-flora-green',
    negative: 'text-flora-red',
    neutral: 'text-gray-400'
  }[trendType];

  return (
    <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:border-industrial-400">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
            {value}
          </div>
          {subtitle && (
            <span className="text-xs text-gray-400 mt-1 block">
              {subtitle}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-md border ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className={`mt-3 pt-2 border-t border-industrial-700 flex items-center text-xs font-mono ${trendColor}`}>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
