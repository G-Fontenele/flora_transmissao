# FLORA Transmission 🌿⚡
### Plataforma Standalone e Inteligente de Gestão de Vegetação para Linhas de Transmissão

[![Status: Operacional](https://img.shields.io/badge/Status-OPERACIONAL-00E5FF?style=for-the-badge&logo=react&logoColor=black)](https://github.com/G-Fontenele/flora_tr)
[![Stack: React + TypeScript + Tailwind](https://img.shields.io/badge/Stack-React_18_%7C_TypeScript_%7C_Tailwind-0A0E14?style=for-the-badge)](https://github.com/G-Fontenele/flora_tr)
[![Zero PI System](https://img.shields.io/badge/Architecture-Standalone_Client--Side-00D26A?style=for-the-badge)](https://github.com/G-Fontenele/flora_tr)

---

## 📌 1. Visão Geral do Sistema

O **FLORA Transmission** é uma aplicação web de missão crítica e alta fidelidade operacional para gestão preditiva, otimização multicritério e auditoria de roçadas mecanizadas e podas em **faixas de servidão de linhas de transmissão de energia elétrica** (500 kV, 345 kV e 230 kV).

Diferente de sistemas legados dependentes de historiadores industriais pesados ou arquiteturas engessadas, o **FLORA Transmission foi projetado como uma plataforma 100% Standalone**, sem dependência do **PI System (OSIsoft/AVEVA)** ou servidores externos. Toda a inteligência analítica, processamento de fórmulas, simulações heurísticas e projeções cartográficas rodam de forma nativa no cliente através do nosso **Motor Operacional TypeScript Client-Side**.

---

## ⚡ 2. A Menor Unidade Operacional: O Vão (`Span`)

Na operação de linhas de transmissão, o controle de vegetação não é feito por quilômetro contínuo genérico ou por município, mas estritamente pela menor unidade física da malha: **o vão entre duas torres de transmissão (`Span`)**.

Cada vão monitorado possui telemetria autônoma e atributos cartográficos próprios:
* **Identificação:** Torre Inicial ➔ Torre Final (ex: `T-001 ➔ T-002`)
* **Extensão Geográfica:** Comprimento de faixa em quilômetros (`lengthKm`)
* **Vegetation Index (VI):** Índice cartográfico/satelital normalizado de `0.00` a `1.00` (derivado de satélite/LiDAR/drone).
* **Clearance Risk (CR):** Indicador crítico de aproximação elétrica entre o topo da copa da vegetação e a catenária dos cabos condutores de alta tensão.
* **Growth Rate 30d (%):** Taxa de expansão vertical e horizontal da vegetação observada nas últimas 4 semanas.
* **Recurrence Score:** Histórico de reincidência de espécies invasoras ou de rápido crescimento no vão.
* **Status de Criticidade:** `Normal` (Verde), `Atenção` (Amarelo), `Alta` (Laranja) ou `Crítica` (Vermelho).

---

## 🧮 3. Motor de Priorização e Fórmula Ponderada (`Priority Score`)

O **FLORA Transmission** calcula dinamicamente o `Priority Score` de cada vão através de uma fórmula ponderada multicritério (cuja calibração de pesos de 0 a 100% pode ser alterada em tempo real no módulo de Configurações):

$$\text{Priority Score} = \lfloor 100 \times \left( 0.35 \cdot VI + 0.25 \cdot CR + 0.20 \cdot \left(\frac{GR_{30d}}{30}\right) + 0.10 \cdot Recurrence + 0.10 \cdot Urgency \right) \rfloor$$

### Faixas de Ação Operacional:
* **[80 - 100 pontos] 🔴 Crítica:** Intervenção imediata ou emergencial em até 72h para evitar desligamentos intempestivos ou falhas por arco elétrico.
* **[60 - 79 pontos] 🟠 Alta:** Inclusão prioritária no próximo ciclo mensal de roçada mecanizada ou poda controlada.
* **[40 - 59 pontos] 🟡 Atenção:** Programação de inspeção preventiva ou alocação de equipe em janela otimizada.
* **[0 - 39 pontos] 🟢 Normal:** Vegetação sob controle dentro dos limites regulatórios da ANEEL/ONS.

---

## 🏗️ 4. Módulos e Funcionalidades do Prototipo

| Módulo | Ícone | Descrição Técnica & Funcionalidades |
| :--- | :---: | :--- |
| **1. Dashboard Executivo** | 📊 | Painel executivo com 8 KPIs industriais, gráficos de tendência histórica de 6 meses (`VI` e `Km Críticos`), ranking dos vãos mais críticos e quadro de alertas de curto prazo. |

| **2. Mapa de Risco Cartográfico** | 🗺️ | Projeção SVG interativa e georreferenciada com 3 camadas analíticas (`Criticidade`, `Vegetation Index` e `Risco de Aproximação`). Clique em qualquer torre/vão para abrir o painel lateral de inspeção detalhada e gerar ordens imediatas. |
| **3. Central de Eventos** | ⚠️ | Gestão do ciclo de vida de ocorrências operacionais (`Aberto` ➔ `Em análise` ➔ `Em execução` ➔ `Concluído`), com geração automática de eventos quando os limiares satelitais são ultrapassados. |
| **4. Calendário Automatizado** | 📅 | Cronograma interativo de roçadas com visões `Mês (30d)`, `Semana Agrupada` e `Lista de Ordens`. Possui detecção automática de conflitos de alocação de equipes, identificação de atrasos climáticos e travamento de ordens aprovadas. |
| **5. Otimizador Multicritério** | ⚡ | Motor heurístico com 10 sliders de calibração de pesos e restrições de orçamento/equipes que gera e compara simultaneamente **3 Cenários Estratégicos:** `Conservador`, `Balanceado` e `Risco Mínimo`. Aplique qualquer cenário com um clique para atualizar o calendário! |
| **6. Equipes & Fornecedores** | 👥 | Cadastro e acompanhamento operacional de empresas contratadas, produtividade diária (`km/dia`), custo médio por quilômetro, avaliações de desempenho em campo (`rating`) e estatísticas de atrasos/retrabalho. |
| **7. Auditoria de Execução** | 🛡️ | Controle rigoroso de fiscalização de campo com comparativo financeiro (`Custo Planejado vs. Realizado vs. Variação %`) e **Inspetor Interativo Antes/Depois** com evidências fotográficas georreferenciadas. |
| **8. Relatórios Operacionais** | 📑 | Central analítica com gráficos de conformidade da malha, indicadores de desvio e exportação simulada de relatórios gerenciais nos formatos `PDF` e `CSV`. |
| **9. Configurações & Parâmetros** | ⚙️ | Parametrização em tempo real dos limiares de alarme automático (`viThreshold`, `crThreshold`, `grThreshold`), parâmetros operacionais de produtividade e pesos da fórmula da ANEEL/ONS. |

---

## 📁 5. Arquitetura e Estrutura de Componentes

```text
flora_transmission/
├── index.html                  # Core HTML5 with Google Fonts (JetBrains Mono & Inter)
├── package.json                # Dependencies (React 18, Vite, Tailwind CSS, Lucide Icons)
├── tsconfig.json               # Strict TypeScript configuration
├── vite.config.ts              # Vite modern bundler setup
└── src/
    ├── main.tsx                # React root bootstrap
    ├── App.tsx                 # Main layout, Navigation Sidebar, Topbar and router
    ├── index.css               # Industrial Dark Theme CSS variables & custom utilities
    ├── vite-env.d.ts           # Client type definitions
    ├── types/
    │   └── index.ts            # Domain entities (Span, OperationalEvent, ScheduleActivity, etc.)
    ├── data/
    │   └── mockData.ts         # Realistic dataset covering 108 spans across 3 transmission lines
    ├── services/
    │   ├── priorityCalculator.ts # Formula logic & priority score computation
    │   ├── eventEngine.ts      # Automated event generation based on satellite telemetry
    │   └── optimizerEngine.ts  # 3-Scenario heuristic optimization engine
    ├── context/
    │   └── AppContext.tsx      # Centralized global state (Spans, Events, Activities, Settings)
    ├── components/             # Reusable industrial UI components
    │   ├── KpiCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── RiskBadge.tsx
    │   ├── PageHeader.tsx
    │   ├── FilterBar.tsx
    │   ├── SpanDetailPanel.tsx
    │   ├── TransmissionMap.tsx # Interactive SVG Map with layers & zoom
    │   ├── RankingTable.tsx
    │   ├── EventsTable.tsx
    │   ├── ScheduleCalendar.tsx
    │   ├── OptimizationPanel.tsx # 10-Weights heuristic control dashboard
    │   ├── ScenarioComparison.tsx
    │   ├── SupplierTable.tsx
    │   ├── AuditTable.tsx      # Before/After photographic inspection drawer
    │   └── TrendChart.tsx      # Historical 6-month curves
    └── pages/                  # Top-level operational pages
        ├── DashboardPage.tsx
        ├── MapPage.tsx
        ├── EventsPage.tsx
        ├── CalendarPage.tsx
        ├── OptimizerPage.tsx
        ├── TeamsPage.tsx
        ├── AuditPage.tsx
        ├── ReportsPage.tsx
        └── SettingsPage.tsx
```

---

## 🎨 6. Identidade Visual Industrial Sóbria (`Industrial Dark Theme`)

O design da interface segue os mais rigorosos padrões de painéis SCADA e centros de controle de sistemas de potência (CCRs):
* **Fundo e Superfícies:** Paleta escura técnica (`#0a0e14`, `#131b26`, `#1a2332`) sem gradientes excessivos ou sombras que cansem a vista do operador em turnos de 12 horas.
* **Tipografia:** Tipografia monoespaçada `JetBrains Mono` e `Roboto Mono` para dados numéricos, coordenadas, IDs de vão, custos e fórmulas de prioridade.
* **Multistate Coding por Cor:**
  * 🟢 **Verde (`#00D26A` / `#10b981`):** Normal / Aprovado / Baixo Risco
  * 🟡 **Amarelo (`#FFB800` / `#f59e0b`):** Atenção / Em Análise / Atraso Leve
  * 🟠 **Laranja (`#FF6B00` / `#f97316`):** Risco Alto / Retrabalho / Proximidade
  * 🔴 **Vermelho (`#FF2E2E` / `#ef4444`):** Criticidade Máxima / Urgência Imediata
  * 🔵 **Ciano (`#00E5FF` / `#06b6d4`):** Destaque Operacional / Telemetria / Ação Padrão

---

## 🚀 7. Como Executar e Compilar o Projeto

### Pré-requisitos
* **Node.js** v18+ ou v20+
* **npm** ou **yarn** ou **pnpm**

### Instalação de Dependências
```bash
git clone https://github.com/G-Fontenele/flora_tr.git
cd flora_transmission
npm install
```

### Rodar Servidor de Desenvolvimento
```bash
npm run dev
```
O protótipo será iniciado em `http://localhost:5173/` de forma instantânea e sem necessidade de conexão com banco de dados ou backend.

### Compilação para Produção
```bash
npm run build
```
Os artefatos otimizados e minificados serão gerados na pasta `/dist`, prontos para implantação estática em qualquer servidor ou CDN.

---

## 📝 8. Licença e Créditos

Desenvolvido para demonstração avançada e prototipagem de soluções tecnológicas autônomas no **Setor Elétrico Nacional**.  
**FLORA Transmission Core** — Todos os direitos reservados © 2026.
