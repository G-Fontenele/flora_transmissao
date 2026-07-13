import React, { ReactNode } from 'react';
import { Filter, Search, Zap, Globe, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FilterBarProps {
  customFilters?: ReactNode;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

const SUBSYSTEMS = ['Norte', 'Nordeste', 'Sudeste/Centro-Oeste', 'Sul'];
const VOLTAGES = ['800', '765', '600', '525', '500', '440', '345', '230'];
const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  customFilters,
  onSearchChange,
  searchPlaceholder = 'Buscar linha, subestação ou agente no SIN...'
}) => {
  const {
    filterSubsystem = 'all',
    setFilterSubsystem,
    filterState = 'all',
    setFilterState,
    filterVoltage = 'all',
    setFilterVoltage,
    searchText = '',
    setSearchText,
    transmissionLines = []
  } = useApp();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (setSearchText) setSearchText(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-3 mb-6 flex flex-wrap items-center justify-between gap-3 font-mono">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300 border-r border-industrial-700 pr-3">
          <Filter className="w-4 h-4 text-flora-cyan" />
          <span className="font-bold">FILTROS SIN</span>
        </div>

        {/* Subsystem Filter */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-gray-400" />
          <label className="text-xs text-gray-400">Subsistema:</label>
          <select
            value={filterSubsystem}
            onChange={(e) => setFilterSubsystem && setFilterSubsystem(e.target.value)}
            className="bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-flora-cyan"
          >
            <option value="all">Todos os Subsistemas</option>
            {SUBSYSTEMS.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <label className="text-xs text-gray-400">Estado:</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState && setFilterState(e.target.value)}
            className="bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-flora-cyan max-h-48"
          >
            <option value="all">Todos os Estados (UF)</option>
            {STATES.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>

        {/* Voltage Filter */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <label className="text-xs text-gray-400">Tensão:</label>
          <select
            value={filterVoltage}
            onChange={(e) => setFilterVoltage && setFilterVoltage(e.target.value)}
            className="bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-flora-cyan"
          >
            <option value="all">Qualquer Tensão</option>
            {VOLTAGES.map(kv => (
              <option key={kv} value={kv}>{kv} kV</option>
            ))}
          </select>
        </div>

        {customFilters}
      </div>

      {/* Global Search Input */}
      <div className="flex-1 min-w-[240px] max-w-sm relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchText || ''}
          onChange={handleSearchInput}
          placeholder={searchPlaceholder}
          className="w-full bg-industrial-900 border border-industrial-600 text-xs text-gray-200 rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-flora-cyan transition-colors"
        />
      </div>
    </div>
  );
};
