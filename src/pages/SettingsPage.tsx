import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Settings, Save, CheckCircle2, RotateCcw, Sliders, ShieldAlert, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_SETTINGS } from '../data/mockData';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="Configurações e Parametrização Operacional do Sistema"
        subtitle="Calibragem dos limiares de alerta automático, pesos do motor de criticidade e parâmetros operacionais padrão"
        actions={
          <div className="flex gap-2.5">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-industrial-800 border border-industrial-600 text-gray-300 hover:text-white rounded font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão de Fábrica
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-5 py-2 rounded font-bold transition-all flex items-center gap-2 shadow-lg ${
                saved
                  ? 'bg-flora-green text-black'
                  : 'bg-flora-cyan text-black hover:bg-flora-cyan/90 glow-cyan'
              }`}
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'PARAMETRIZAÇÃO SALVA COM SUCESSO!' : 'Salvar Alterações'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Limiares de Alarme Automático */}
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-5 space-y-4 shadow-lg">
          <div className="border-b border-industrial-700 pb-2.5 flex items-center gap-2 font-bold text-white uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-flora-red" />
            1. LIMIARES DE ALERTA OPERACIONAL E GERAÇÃO AUTOMÁTICA DE EVENTOS
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold">
                <span>Limiar do Vegetation Index (VI) para Alerta:</span>
                <span className="text-flora-cyan font-bold">{localSettings.viThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.95}
                step={0.05}
                value={localSettings.viThreshold}
                onChange={(e) => setLocalSettings({ ...localSettings, viThreshold: Number(e.target.value) })}
                className="w-full accent-flora-cyan cursor-pointer bg-industrial-900 rounded h-2"
              />
              <span className="text-[10px] text-gray-500">
                Padrão recomendado: &gt; 0,75 dispara criação de evento automático
              </span>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold">
                <span>Limiar do Clearance Risk (Risco Elétrico):</span>
                <span className="text-flora-orange font-bold">{localSettings.crThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.90}
                step={0.05}
                value={localSettings.crThreshold}
                onChange={(e) => setLocalSettings({ ...localSettings, crThreshold: Number(e.target.value) })}
                className="w-full accent-flora-orange cursor-pointer bg-industrial-900 rounded h-2"
              />
              <span className="text-[10px] text-gray-500">
                Padrão recomendado: &gt; 0,70 indica proximidade crítica com os cabos de alta tensão
              </span>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold">
                <span>Limiar de Taxa de Crescimento Agudo em 30d (%):</span>
                <span className="text-flora-yellow font-bold">+{localSettings.grThreshold}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                step={1}
                value={localSettings.grThreshold}
                onChange={(e) => setLocalSettings({ ...localSettings, grThreshold: Number(e.target.value) })}
                className="w-full accent-flora-yellow cursor-pointer bg-industrial-900 rounded h-2"
              />
              <span className="text-[10px] text-gray-500">
                Padrão recomendado: &gt; +15% de crescimento mensal exige inspeção em campo
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Parâmetros de Custo & Produtividade */}
        <div className="bg-industrial-800 border border-industrial-600 rounded-lg p-5 space-y-4 shadow-lg">
          <div className="border-b border-industrial-700 pb-2.5 flex items-center gap-2 font-bold text-white uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-flora-green" />
            2. PARÂMETROS OPERACIONAIS PADRÃO PARA PLANEJAMENTO
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-gray-400 block text-[11px] mb-1">Produtividade Padrão (km/dia):</label>
              <input
                type="number"
                step="0.2"
                value={localSettings.defaultProductivity}
                onChange={(e) => setLocalSettings({ ...localSettings, defaultProductivity: Number(e.target.value) })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block text-[11px] mb-1">Custo Padrão por km (R$):</label>
              <input
                type="number"
                step="100"
                value={localSettings.defaultCostKm}
                onChange={(e) => setLocalSettings({ ...localSettings, defaultCostKm: Number(e.target.value) })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block text-[11px] mb-1">Horizonte de Planejamento (Dias):</label>
              <input
                type="number"
                value={localSettings.planningHorizonDays}
                onChange={(e) => setLocalSettings({ ...localSettings, planningHorizonDays: Number(e.target.value) })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 block text-[11px] mb-1">Frequência Satelital (Dias):</label>
              <input
                type="number"
                value={localSettings.analysisFrequencyDays}
                onChange={(e) => setLocalSettings({ ...localSettings, analysisFrequencyDays: Number(e.target.value) })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-3 py-1.5 text-white font-bold focus:border-flora-cyan outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-industrial-900/80 rounded border border-industrial-700 text-[11px] text-gray-400 space-y-1 mt-3">
            <span className="text-gray-300 font-bold block">Critérios de Criticidade Multi-Nível:</span>
            <p>• <strong>0 a 39 pontos:</strong> Normal (Verde) — Monitoramento quinzenal por satélite.</p>
            <p>• <strong>40 a 59 pontos:</strong> Atenção (Amarelo) — Programação de roçada preventiva.</p>
            <p>• <strong>60 a 79 pontos:</strong> Alta (Laranja) — Alocação prioritária em até 15 dias.</p>
            <p>• <strong>80 a 100 pontos:</strong> Crítica (Vermelho) — Intervenção emergencial em até 72 horas.</p>
          </div>
        </div>

        {/* Box 3: Calibragem de Pesos do Priority Score */}
        <div className="lg:col-span-2 bg-industrial-800 border border-industrial-600 rounded-lg p-5 space-y-4 shadow-lg">
          <div className="border-b border-industrial-700 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-flora-cyan" />
              3. PESOS DA FÓRMULA DO PRIORITY SCORE TOTAL (DEVE SOMAR 100%)
            </div>
            <span className="text-xs font-bold text-flora-cyan bg-industrial-900 px-2.5 py-0.5 rounded border border-industrial-700">
              Soma atual: {Object.values(localSettings.priorityWeights).reduce((a, b) => a + b, 0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold text-[11px]">
                <span>Vegetation Index:</span>
                <span className="text-flora-cyan font-bold">{localSettings.priorityWeights.vegetationIndex}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={localSettings.priorityWeights.vegetationIndex}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  priorityWeights: { ...localSettings.priorityWeights, vegetationIndex: Number(e.target.value) }
                })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold text-[11px]">
                <span>Clearance Risk:</span>
                <span className="text-flora-orange font-bold">{localSettings.priorityWeights.clearanceRisk}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={localSettings.priorityWeights.clearanceRisk}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  priorityWeights: { ...localSettings.priorityWeights, clearanceRisk: Number(e.target.value) }
                })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold text-[11px]">
                <span>Growth Rate 30d:</span>
                <span className="text-flora-yellow font-bold">{localSettings.priorityWeights.growthRate30d}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={localSettings.priorityWeights.growthRate30d}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  priorityWeights: { ...localSettings.priorityWeights, growthRate30d: Number(e.target.value) }
                })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold text-[11px]">
                <span>Reincidência:</span>
                <span className="text-gray-300 font-bold">{localSettings.priorityWeights.recurrence}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={localSettings.priorityWeights.recurrence}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  priorityWeights: { ...localSettings.priorityWeights, recurrence: Number(e.target.value) }
                })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1 font-semibold text-[11px]">
                <span>Urgência/Prazo:</span>
                <span className="text-gray-300 font-bold">{localSettings.priorityWeights.urgency}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={localSettings.priorityWeights.urgency}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  priorityWeights: { ...localSettings.priorityWeights, urgency: Number(e.target.value) }
                })}
                className="w-full bg-industrial-900 border border-industrial-600 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
