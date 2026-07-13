import React from 'react';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Calendar,
  Zap,
  Users,
  CheckSquare,
  FileText,
  Settings,
  Shield,
  Activity,
  Radio,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { PageId } from './types';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { EventsPage } from './pages/EventsPage';
import { CalendarPage } from './pages/CalendarPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { TeamsPage } from './pages/TeamsPage';
import { AuditPage } from './pages/AuditPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const NavigationSidebar: React.FC<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}> = ({ mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { activePage, setActivePage, events, activities, transmissionLines = [], substations = [] } = useApp();

  const openEventsCount = events.filter(e => e.status === 'Aberto').length;
  const overdueCount = activities.filter(a => a.status === 'Atrasado').length;

  const navItems: { id: PageId; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
    { id: 'mapa', label: 'Mapa de Risco', icon: Map },
    {
      id: 'eventos',
      label: 'Eventos de Vegetação',
      icon: AlertTriangle,
      badge: openEventsCount,
      badgeColor: 'bg-flora-red text-white animate-pulse'
    },
    {
      id: 'calendario',
      label: 'Calendário de Roçada',
      icon: Calendar,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-flora-yellow text-black'
    },
    { id: 'otimizador', label: 'Otimizador de Roçada', icon: Zap },
    { id: 'equipes', label: 'Equipes & Fornecedores', icon: Users },
    { id: 'auditoria', label: 'Auditoria de Execução', icon: CheckSquare },
    { id: 'relatorios', label: 'Relatórios Operacionais', icon: FileText },
    { id: 'configuracoes', label: 'Configurações do Sistema', icon: Settings }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 bg-industrial-900 border-r border-industrial-700 flex flex-col justify-between transition-all duration-300 ease-in-out
    lg:static lg:translate-x-0
    ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
    ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Logo & Product Brand */}
          <div className={`p-4 border-b border-industrial-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 flex-shrink-0 rounded bg-gradient-to-br from-flora-cyan to-flora-green flex items-center justify-center shadow-lg glow-cyan">
                <Activity className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              {!isCollapsed && (
                <div className="transition-opacity duration-200">
                  <span className="text-base font-bold tracking-wider text-white flex items-center gap-1 font-mono">
                    FLORA
                    <span className="text-flora-cyan text-[10px] font-mono bg-industrial-800 px-1.5 py-0.5 rounded border border-industrial-600">
                      TRANSMISSION
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    Centro Operacional v1.0
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Expandir Menu Lateral' : 'Colapsar Menu Lateral'}
                className="hidden lg:flex p-1.5 rounded hover:bg-industrial-800 text-gray-400 hover:text-white transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-flora-cyan" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1 font-mono text-xs flex-1">
            {!isCollapsed && (
              <span className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest block transition-opacity">
                MÓDULOS DE GESTÃO
              </span>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-3 py-2.5'} rounded transition-all group relative ${
                    isActive
                      ? 'bg-industrial-700/80 text-white border-l-4 border-flora-cyan font-bold shadow-md'
                      : 'text-gray-400 hover:bg-industrial-800 hover:text-gray-200'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'text-flora-cyan scale-110' : 'text-gray-400 group-hover:text-gray-300'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flora-red animate-pulse shadow-sm" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Telemetry Status Footer */}
          <div className={`p-3 border-t border-industrial-700 bg-industrial-950/60 font-mono text-[11px] text-gray-400 transition-all ${isCollapsed ? 'text-center' : 'space-y-2'}`}>
            {isCollapsed ? (
              <div title={`Telemetria Ativa SIN (${transmissionLines.length || 1840} LTs)`} className="flex justify-center py-1">
                <Radio className="w-4 h-4 text-flora-green animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-flora-green font-bold">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    TELEMETRIA ATIVA
                  </span>
                  <span className="text-[10px] bg-industrial-900 px-1.5 py-0.5 rounded border border-industrial-700 text-gray-300">
                    Standalone
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Malha SIN:</span>
                    <span className="text-gray-300">{transmissionLines.length || 1840} LTs ({substations.length || 922} SEs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Varredura Satélite:</span>
                    <span className="text-gray-300">Hoje, 14:32</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-industrial-800 text-[9px] text-gray-600 flex justify-between items-center">
                  <span>Zero PI System/Tag dep.</span>
                  <Shield className="w-3 h-3 text-flora-cyan" />
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const MainContent: React.FC<{
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}> = ({ setMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { activePage } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-industrial-900 overflow-x-hidden transition-all duration-300">
      {/* Top Bar */}
      <header className="h-14 bg-industrial-800 border-b border-industrial-700 flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded bg-industrial-700 text-gray-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir Menu Lateral' : 'Colapsar Menu Lateral'}
            className="hidden lg:flex p-1.5 rounded bg-industrial-900 border border-industrial-700 text-gray-400 hover:text-white hover:border-flora-cyan transition-colors items-center gap-1.5"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-flora-cyan" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
          </button>
          <span className="font-mono text-xs text-gray-400 hidden sm:inline">
            SISTEMA DE GESTÃO DE FAIXAS DE SERVIDÃO — <strong className="text-white">SETOR ELÉTRICO NACIONAL (SIN)</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-industrial-900 px-2.5 py-1 rounded border border-industrial-700">
            <span className="w-2 h-2 rounded-full bg-flora-green inline-block animate-ping" />
            <span className="text-gray-300">GRID STATUS: <strong className="text-flora-green">OPERACIONAL</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-industrial-900 px-3 py-1 rounded border border-industrial-700 text-gray-400">
            <span>Rede:</span>
            <strong className="text-white">800 kV | 500 kV | 345 kV | 230 kV</strong>
          </div>
        </div>
      </header>

      {/* Dynamic Page Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1700px] w-full mx-auto">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'mapa' && <MapPage />}
        {activePage === 'eventos' && <EventsPage />}
        {activePage === 'calendario' && <CalendarPage />}
        {activePage === 'otimizador' && <OptimizerPage />}
        {activePage === 'equipes' && <TeamsPage />}
        {activePage === 'auditoria' && <AuditPage />}
        {activePage === 'relatorios' && <ReportsPage />}
        {activePage === 'configuracoes' && <SettingsPage />}
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 bg-industrial-950 border-t border-industrial-800 text-center text-xs font-mono text-gray-500">
        FLORA Transmission — Plataforma Standalone de Gestão de Vegetação para Linhas de Transmissão © 2026. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-industrial-900 text-gray-200">
        <NavigationSidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <MainContent
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>
    </AppProvider>
  );
};

export default App;
