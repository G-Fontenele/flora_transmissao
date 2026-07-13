import React, { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSMISSION_LINES, REGIONS } from '../data/mockData';

interface FilterBarProps {
  customFilters?: ReactNode;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  customFilters,
  onSearchChange,
  searchPlaceholder = 'Buscar por torre, ID ou linha...'
}) => {
  const { filterLine, setFilterLine, filterRegion, setFilterRegion } = useApp();

  return (
    <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3 mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-mono text-gray-400 border-r border-industrial-700 pr-3">
        <Filter className="w-4 h-4 text-flora-cyan" />
        <span>FILTROS</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 font-mono">Linha:</label>
        <select
          value={filterLine}
          onChange={(e) => setFilterLine(e.target.value)}
          className="bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-flora-cyan font-mono max-w-[200px] truncate"
        >
          <option value="all">Todas as Linhas de Transmissão</option>
          {TRANSMISSION_LINES.map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 font-mono">Região:</label>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-flora-cyan font-mono"
        >
          <option value="all">Todas as Regiões</option>
          {REGIONS.map(reg => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>
      </div>

      {customFilters}

      {onSearchChange && (
        <div className="ml-auto flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-flora-cyan font-mono"
          />
        </div>
      )}
    </div>
  );
};
