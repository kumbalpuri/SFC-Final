import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
  LabelList
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  Maximize2,
  Minimize2,
  Filter,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Layers,
  Trophy,
  Medal,
  Award
} from 'lucide-react';

// ============================================================================
// STANDARD SFC POWER-BI / TABLEAU COLOR PALETTE & CHART TOKENS
// ============================================================================
export const SFC_PALETTE = {
  primary: '#0f172a',
  indigo: '#4f46e5',
  emerald: '#10b981',
  emeraldDark: '#059669',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#e11d48',
  violet: '#7c3aed',
  teal: '#0d9488',
  slate: '#64748b',
  categorical: [
    '#0ea5e9', // PowerBI Cyan/Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber/Gold
    '#6366f1', // Indigo
    '#f97316', // Orange
    '#ec4899', // Pink/Rose
    '#8b5cf6', // Violet
    '#14b8a6'  // Teal
  ]
};

export interface DrillBreadcrumbItem {
  label: string;
  value?: string;
  level: number;
}

interface PowerBiVisualCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  accentColor?: 'emerald' | 'indigo' | 'sky' | 'amber' | 'rose' | 'violet' | 'slate';
  darkTheme?: boolean;
  drillLevel?: number;
  maxDrillLevel?: number;
  drillBreadcrumbs?: DrillBreadcrumbItem[];
  onDrillUp?: () => void;
  onDrillToLevel?: (level: number) => void;
  onExpandNextLevel?: () => void;
  drillModeActive?: boolean;
  onToggleDrillMode?: () => void;
  headerRight?: React.ReactNode;
  insightText?: string;
  insightHighlight?: string;
  children: React.ReactNode;
  className?: string;
}

export function PowerBiVisualCard({
  title,
  subtitle,
  badge,
  accentColor = 'sky',
  darkTheme = false,
  drillLevel = 0,
  maxDrillLevel = 0,
  drillBreadcrumbs = [],
  onDrillUp,
  onDrillToLevel,
  onExpandNextLevel,
  drillModeActive,
  onToggleDrillMode,
  headerRight,
  insightText,
  insightHighlight,
  children,
  className = ''
}: PowerBiVisualCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  const topBorderMap: Record<string, string> = {
    emerald: 'border-t-emerald-500',
    indigo: 'border-t-indigo-500',
    sky: 'border-t-sky-500',
    amber: 'border-t-amber-500',
    rose: 'border-t-rose-500',
    violet: 'border-t-violet-500',
    slate: 'border-t-slate-500'
  };

  const badgeColorMap: Record<string, string> = darkTheme
    ? {
        emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        sky: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        violet: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        slate: 'bg-slate-700 text-slate-200 border-slate-600'
      }
    : {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        sky: 'bg-sky-50 text-sky-700 border-sky-200',
        amber: 'bg-amber-50 text-amber-800 border-amber-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        violet: 'bg-violet-50 text-violet-700 border-violet-200',
        slate: 'bg-slate-100 text-slate-700 border-slate-200'
      };

  const hasDrillControls = maxDrillLevel > 0;

  const cardSurface = darkTheme
    ? 'bg-[#0f1f35] border-slate-700/80 text-white shadow-md'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-2xs';

  const headerSurface = darkTheme
    ? 'bg-[#0b1728] border-slate-800'
    : 'bg-slate-50/80 border-slate-200/70';

  const renderCardBody = (inModal: boolean) => (
    <div
      className={`border border-t-2 ${topBorderMap[accentColor]} rounded-xl flex flex-col justify-between overflow-hidden transition-all ${cardSurface} ${
        inModal ? 'w-full max-w-6xl max-h-[90vh]' : className
      }`}
    >
      {/* PowerBI / Tableau Compact Visual Header */}
      <div>
        <div className={`px-3.5 py-2.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${headerSurface}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {badge && (
                <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border whitespace-nowrap ${badgeColorMap[accentColor]}`}>
                  {badge}
                </span>
              )}
              <h3 className={`text-xs font-black uppercase tracking-wider font-mono truncate ${darkTheme ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className={`text-[10px] font-medium truncate mt-0.5 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Authentic PowerBI Visual Header Icons (↑ Drill Up, ↓ Drill Mode, ⇊ Next Level, ⛶ Focus Mode) */}
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {hasDrillControls && (
              <div className={`flex items-center rounded-lg p-0.5 text-[10px] font-mono font-bold border ${
                darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-white border-slate-200'
              }`}>
                {/* ↑ Drill Up */}
                {onDrillUp && (
                  <button
                    type="button"
                    onClick={onDrillUp}
                    disabled={drillLevel === 0}
                    title="Drill Up (↑) one level"
                    className={`px-1.5 py-1 rounded flex items-center gap-0.5 transition whitespace-nowrap ${
                      drillLevel > 0
                        ? darkTheme
                          ? 'text-sky-300 hover:bg-slate-800 cursor-pointer font-black'
                          : 'text-slate-800 hover:bg-slate-100 cursor-pointer font-black'
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Up</span>
                  </button>
                )}

                {/* ↓ Drill Mode Toggle */}
                {onToggleDrillMode !== undefined && (
                  <button
                    type="button"
                    onClick={onToggleDrillMode}
                    title={drillModeActive ? 'Drill Down Mode ON: Click a bar to drill down' : 'Cross-Filter Mode: Click a bar to cross-highlight'}
                    className={`px-1.5 py-1 rounded flex items-center gap-0.5 border-l transition cursor-pointer whitespace-nowrap ${
                      darkTheme ? 'border-slate-800' : 'border-slate-100'
                    } ${
                      drillModeActive
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : darkTheme
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>{drillModeActive ? 'Drill: ON' : 'Filter'}</span>
                  </button>
                )}

                {/* ⇊ Expand Next Level */}
                {onExpandNextLevel && (
                  <button
                    type="button"
                    onClick={onExpandNextLevel}
                    disabled={drillLevel >= maxDrillLevel}
                    title="Go to the next level in the hierarchy (⇊)"
                    className={`px-1.5 py-1 rounded flex items-center gap-0.5 border-l transition whitespace-nowrap ${
                      darkTheme ? 'border-slate-800' : 'border-slate-100'
                    } ${
                      drillLevel < maxDrillLevel
                        ? darkTheme
                          ? 'text-emerald-300 hover:bg-slate-800 cursor-pointer font-black'
                          : 'text-indigo-700 hover:bg-indigo-50 cursor-pointer font-black'
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <ChevronsDown className="w-3 h-3" />
                    <span>Next</span>
                  </button>
                )}
              </div>
            )}

            {headerRight}

            {/* PowerBI Focus Mode (Maximize / Restore Visual) */}
            <button
              type="button"
              onClick={() => setIsFocused(!isFocused)}
              title={isFocused ? 'Exit Focus Mode' : 'Focus Mode (Maximize Visual)'}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                darkTheme
                  ? 'bg-[#07111e] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isFocused ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Interactive Drill Breadcrumb Bar */}
        {drillBreadcrumbs.length > 0 && (
          <div className={`px-3.5 py-1.5 border-b flex items-center justify-between gap-2 text-[10px] font-mono overflow-x-auto ${
            darkTheme ? 'bg-[#081322] border-slate-800 text-slate-300' : 'bg-slate-100/80 border-slate-200/60 text-slate-700'
          }`}>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-bold uppercase text-sky-500 mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Drill Path:</span>
              </span>
              {drillBreadcrumbs.map((crumb, idx) => {
                const isCurrent = idx === drillBreadcrumbs.length - 1;
                return (
                  <React.Fragment key={`${crumb.level}-${crumb.label}`}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                    <button
                      type="button"
                      onClick={() => onDrillToLevel && onDrillToLevel(crumb.level)}
                      className={`px-1.5 py-0.5 rounded transition whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500 text-slate-950 font-black'
                          : darkTheme
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 font-bold'
                      }`}
                    >
                      {crumb.label}
                      {crumb.value ? `: ${crumb.value}` : ''}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            <span className="text-[9px] font-bold opacity-75 whitespace-nowrap">
              L{drillLevel + 1}/{maxDrillLevel + 1}
            </span>
          </div>
        )}
      </div>

      {/* Main Chart Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* Compact Analytical Takeaway Footer */}
      {(insightText || insightHighlight) && (
        <div className={`px-3.5 py-2 border-t flex items-center justify-between gap-2 text-[10px] ${
          darkTheme ? 'bg-[#091526] border-slate-800 text-slate-300' : 'bg-slate-50/90 border-slate-100 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate font-medium">{insightText}</span>
          </div>
          {insightHighlight && (
            <span className={`font-mono font-black px-2 py-0.5 rounded border whitespace-nowrap shrink-0 tabular-nums ${
              darkTheme ? 'bg-slate-800 text-emerald-300 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
            }`}>
              {insightHighlight}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {renderCardBody(false)}
      {isFocused && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          {renderCardBody(true)}
        </div>
      )}
    </>
  );
}

// ============================================================================
// UNIVERSAL POWER-BI / TABLEAU DRILL-DOWN & TOPPERS STUDIO FOR ANY SFC MODULE
// ============================================================================
export interface SfcStandardRecord {
  id: string;
  code: string;
  title: string;
  level1: string;       // e.g. Plant / Minifactory / Department
  level2: string;       // e.g. Line / Area / Zone
  level3: string;       // e.g. Category / Pillar / Station / Type
  owner: string;        // e.g. Operator / Auditor / Engineer
  status: 'Completed' | 'In-Progress' | 'Open';
  rawStatus: string;
  period: string;       // e.g. Month or Date
  metricValue: number;  // e.g. Cost Saved ₹, Audit Score %, Quarantine Qty, etc.
}

interface SfcModuleStandardDrillBoardProps {
  moduleTitle: string;
  moduleSubtitle: string;
  moduleBadge: string;
  accentColor?: 'emerald' | 'indigo' | 'sky' | 'amber' | 'rose' | 'violet';
  level1Label: string;
  level2Label: string;
  level3Label: string;
  metricLabel: string;
  metricFormatter?: (val: number) => string;
  metricIsAverage?: boolean;
  records: SfcStandardRecord[];
  onSelectRecord?: (id: string) => void;
}

export function SfcModuleStandardDrillBoard({
  moduleTitle,
  moduleSubtitle,
  moduleBadge,
  accentColor = 'sky',
  level1Label,
  level2Label,
  level3Label,
  metricLabel,
  metricFormatter = (v) => v.toLocaleString('en-IN'),
  metricIsAverage = false,
  records
}: SfcModuleStandardDrillBoardProps) {
  const [drillLevel, setDrillLevel] = useState<number>(0);
  const [selectedL1, setSelectedL1] = useState<string | null>(null);
  const [selectedL2, setSelectedL2] = useState<string | null>(null);
  const [selectedL3, setSelectedL3] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [statusSlicer, setStatusSlicer] = useState<'ALL' | 'Completed' | 'In-Progress' | 'Open'>('ALL');
  const [drillModeActive, setDrillModeActive] = useState<boolean>(true);
  const [darkTheme, setDarkTheme] = useState<boolean>(true);

  // Filter records by active hierarchy path, owner topper click & status slicer
  const activeRecords = useMemo(() => {
    return records.filter(r => {
      if (statusSlicer !== 'ALL' && r.status !== statusSlicer) return false;
      if (selectedL1 && r.level1 !== selectedL1) return false;
      if (selectedL2 && r.level2 !== selectedL2) return false;
      if (selectedL3 && r.level3 !== selectedL3) return false;
      if (selectedOwner && r.owner !== selectedOwner) return false;
      return true;
    });
  }, [records, statusSlicer, selectedL1, selectedL2, selectedL3, selectedOwner]);

  // Compute Top 3 Module Toppers (By Owner / Contributor)
  const moduleToppers = useMemo(() => {
    const map: Record<string, { name: string; dept: string; count: number; completed: number; metricSum: number }> = {};
    records.forEach(r => {
      const owner = r.owner || 'Shopfloor Team';
      if (!map[owner]) {
        map[owner] = { name: owner, dept: r.level1, count: 0, completed: 0, metricSum: 0 };
      }
      map[owner].count += 1;
      if (r.status === 'Completed') map[owner].completed += 1;
      map[owner].metricSum += r.metricValue;
    });
    return Object.values(map)
      .map(t => ({
        ...t,
        metricDisplay: metricIsAverage && t.count > 0 ? Math.round(t.metricSum / t.count) : t.metricSum
      }))
      .sort((a, b) => b.count - a.count || b.metricDisplay - a.metricDisplay)
      .slice(0, 3);
  }, [records, metricIsAverage]);

  // Group records by current drill level for the Primary Drill-Down Bar + Pareto Combo Chart
  const drillChartData = useMemo(() => {
    const groups: Record<string, {
      name: string;
      count: number;
      completed: number;
      inProgress: number;
      open: number;
      metricSum: number;
    }> = {};

    activeRecords.forEach(r => {
      const key =
        drillLevel === 0 ? r.level1 :
        drillLevel === 1 ? r.level2 :
        drillLevel === 2 ? r.level3 :
        r.owner || r.code;

      if (!groups[key]) {
        groups[key] = { name: key, count: 0, completed: 0, inProgress: 0, open: 0, metricSum: 0 };
      }
      groups[key].count += 1;
      if (r.status === 'Completed') groups[key].completed += 1;
      else if (r.status === 'In-Progress') groups[key].inProgress += 1;
      else groups[key].open += 1;
      groups[key].metricSum += r.metricValue;
    });

    const sorted = Object.values(groups)
      .map(g => ({
        ...g,
        metricDisplay: metricIsAverage && g.count > 0 ? Math.round(g.metricSum / g.count) : g.metricSum
      }))
      .sort((a, b) => b.count - a.count);

    const totalCount = sorted.reduce((s, i) => s + i.count, 0);
    let cumulative = 0;
    return sorted.map(item => {
      cumulative += item.count;
      return {
        ...item,
        cumulativePct: totalCount > 0 ? Math.round((cumulative / totalCount) * 100) : 0
      };
    });
  }, [activeRecords, drillLevel, metricIsAverage]);

  // Group by Level 3 (Category / Pillar) for Cross-Filter Distribution Chart
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, { name: string; count: number; metricSum: number }> = {};
    activeRecords.forEach(r => {
      const k = r.level3 || 'General';
      if (!counts[k]) counts[k] = { name: k, count: 0, metricSum: 0 };
      counts[k].count += 1;
      counts[k].metricSum += r.metricValue;
    });
    const total = activeRecords.length || 1;
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map((c, idx) => ({
        ...c,
        pct: Math.round((c.count / total) * 100),
        color: SFC_PALETTE.categorical[idx % SFC_PALETTE.categorical.length]
      }));
  }, [activeRecords]);

  const handleBarClick = (entry: any) => {
    if (!entry || !entry.name) return;
    const clickedName = entry.name;

    if (!drillModeActive) {
      if (drillLevel === 0) setSelectedL1(prev => (prev === clickedName ? null : clickedName));
      else if (drillLevel === 1) setSelectedL2(prev => (prev === clickedName ? null : clickedName));
      else if (drillLevel === 2) setSelectedL3(prev => (prev === clickedName ? null : clickedName));
      return;
    }

    if (drillLevel === 0) {
      setSelectedL1(clickedName);
      setDrillLevel(1);
    } else if (drillLevel === 1) {
      setSelectedL2(clickedName);
      setDrillLevel(2);
    } else if (drillLevel === 2) {
      setSelectedL3(clickedName);
      setDrillLevel(3);
    }
  };

  const handleDrillUp = () => {
    if (drillLevel === 3) {
      setSelectedL3(null);
      setDrillLevel(2);
    } else if (drillLevel === 2) {
      setSelectedL2(null);
      setDrillLevel(1);
    } else if (drillLevel === 1) {
      setSelectedL1(null);
      setDrillLevel(0);
    }
  };

  const handleDrillToLevel = (targetLevel: number) => {
    if (targetLevel <= 0) {
      setSelectedL1(null);
      setSelectedL2(null);
      setSelectedL3(null);
      setDrillLevel(0);
    } else if (targetLevel === 1) {
      setSelectedL2(null);
      setSelectedL3(null);
      setDrillLevel(1);
    } else if (targetLevel === 2) {
      setSelectedL3(null);
      setDrillLevel(2);
    }
  };

  const handleResetAll = () => {
    setSelectedL1(null);
    setSelectedL2(null);
    setSelectedL3(null);
    setSelectedOwner(null);
    setDrillLevel(0);
    setStatusSlicer('ALL');
  };

  const breadcrumbs: DrillBreadcrumbItem[] = [
    { label: `All ${level1Label}`, value: selectedL1 || undefined, level: 0 },
    ...(drillLevel >= 1 ? [{ label: level2Label, value: selectedL2 || undefined, level: 1 }] : []),
    ...(drillLevel >= 2 ? [{ label: level3Label, value: selectedL3 || undefined, level: 2 }] : []),
    ...(drillLevel >= 3 ? [{ label: 'Contributors / Records', level: 3 }] : [])
  ];

  const currentDimensionLabel =
    drillLevel === 0 ? level1Label :
    drillLevel === 1 ? level2Label :
    drillLevel === 2 ? level3Label :
    'Contributor / Owner';

  const topGroup = drillChartData[0];

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border space-y-4 transition-colors ${
      darkTheme ? 'bg-[#081221] border-slate-800 text-white' : 'bg-slate-100/90 border-slate-200 text-slate-900'
    }`}>
      {/* PowerBI Top Ribbon & Slicer Bar */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3 ${
        darkTheme ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-sky-500 text-slate-950">
              {moduleBadge} · POWER-BI / TABLEAU WORKBOOK
            </span>
            {(selectedL1 || selectedL2 || selectedL3 || selectedOwner || statusSlicer !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Slicers &amp; Drill</span>
              </button>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mt-1">
            {moduleTitle}
          </h3>
          <p className={`text-[11px] font-medium ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            {moduleSubtitle}
          </p>
        </div>

        {/* Right Controls: Chiclet Slicers & Theme Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center rounded-lg p-0.5 border text-[10px] font-mono font-bold ${
            darkTheme ? 'bg-[#0f1f35] border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {(['ALL', 'Completed', 'In-Progress', 'Open'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusSlicer(st)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  statusSlicer === st
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : darkTheme
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDarkTheme(!darkTheme)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold cursor-pointer transition whitespace-nowrap ${
              darkTheme
                ? 'bg-slate-800 text-sky-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {darkTheme ? 'Theme: PowerBI Dark' : 'Theme: Tableau Light'}
          </button>
        </div>
      </div>

      {/* MODULE TOPPERS PODIUM STRIP (GOLD #1, SILVER #2, BRONZE #3) */}
      {moduleToppers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {moduleToppers.map((topper, idx) => {
            const isSelected = selectedOwner === topper.name;
            const rankBadge = idx === 0 ? '🥇 #1 GOLD TOPPER' : idx === 1 ? '🥈 #2 SILVER TOPPER' : '🥉 #3 BRONZE TOPPER';
            const cardColors = darkTheme
              ? idx === 0
                ? 'bg-gradient-to-r from-amber-500/20 via-[#0f1f35] to-[#0f1f35] border-amber-500/50'
                : idx === 1
                ? 'bg-gradient-to-r from-slate-400/15 via-[#0f1f35] to-[#0f1f35] border-slate-600'
                : 'bg-gradient-to-r from-orange-500/15 via-[#0f1f35] to-[#0f1f35] border-orange-500/40'
              : idx === 0
              ? 'bg-amber-50/90 border-amber-300'
              : idx === 1
              ? 'bg-white border-slate-300'
              : 'bg-orange-50/60 border-orange-200';

            return (
              <button
                key={topper.name}
                type="button"
                onClick={() => setSelectedOwner(prev => (prev === topper.name ? null : topper.name))}
                className={`text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${cardColors} ${
                  isSelected ? 'ring-2 ring-sky-400' : ''
                }`}
              >
                <div className="min-w-0">
                  <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded inline-block ${
                    idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-orange-400 text-slate-950'
                  }`}>
                    {rankBadge}
                  </span>
                  <h4 className="text-xs font-black truncate mt-1">{topper.name}</h4>
                  <span className={`text-[10px] font-mono block truncate ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zone: {topper.dept}
                  </span>
                </div>
                <div className="text-right font-mono shrink-0 tabular-nums">
                  <span className="text-base font-black text-sky-400 block">{topper.count} Logs</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    {metricLabel}: {metricFormatter(topper.metricDisplay)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left 8 Cols: Multi-Level Drill-Down Bar & Pareto Line Chart with Direct Data Labels */}
        <PowerBiVisualCard
          className="lg:col-span-8"
          darkTheme={darkTheme}
          title={`Hierarchical Drill-Down by ${currentDimensionLabel}`}
          subtitle={`Click any bar to drill down (${level1Label} → ${level2Label} → ${level3Label} → Owner)`}
          badge={`LEVEL ${drillLevel + 1}/4`}
          accentColor={accentColor}
          drillLevel={drillLevel}
          maxDrillLevel={3}
          drillBreadcrumbs={breadcrumbs}
          onDrillUp={handleDrillUp}
          onDrillToLevel={handleDrillToLevel}
          onExpandNextLevel={() => setDrillLevel(prev => Math.min(3, prev + 1))}
          drillModeActive={drillModeActive}
          onToggleDrillMode={() => setDrillModeActive(prev => !prev)}
          insightText={
            topGroup
              ? `Topper ${currentDimensionLabel}: "${topGroup.name}" leads with ${topGroup.count} records (${topGroup.cumulativePct}% cumulative share).`
              : 'No records match current slicer.'
          }
          insightHighlight={`${activeRecords.length} Records Active`}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={drillChartData}
                margin={{ top: 18, right: 16, left: -12, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkTheme ? '#1e293b' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, fill: darkTheme ? '#cbd5e1' : '#334155' }}
                  interval={0}
                  angle={drillChartData.length > 5 ? -15 : 0}
                  textAnchor={drillChartData.length > 5 ? 'end' : 'middle'}
                  height={42}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#f59e0b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs font-mono space-y-1">
                        <div className="font-black text-sky-400 border-b border-slate-800 pb-1">
                          {d.name}
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Total Count:</span>
                          <span className="font-bold tabular-nums">{d.count}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-emerald-400">Completed:</span>
                          <span className="font-bold tabular-nums">{d.completed}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-amber-400">Open / In-Prog:</span>
                          <span className="font-bold tabular-nums">{d.inProgress + d.open}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
                          <span className="text-sky-300">{metricLabel}:</span>
                          <span className="font-bold tabular-nums">{metricFormatter(d.metricDisplay)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine yAxisId="right" y={80} stroke="#f59e0b" strokeDasharray="4 4" />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Total Count"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => handleBarClick(data)}
                >
                  {drillChartData.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={SFC_PALETTE.categorical[idx % SFC_PALETTE.categorical.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{
                      fill: darkTheme ? '#ffffff' : '#0f172a',
                      fontSize: 11,
                      fontWeight: 900,
                      fontFamily: 'monospace'
                    }}
                  />
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativePct"
                  name="Pareto Cumulative %"
                  stroke="#facc15"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#facc15', stroke: '#0f172a', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </PowerBiVisualCard>

        {/* Right 4 Cols: Category Donut & In-Cell Data Bar Matrix */}
        <PowerBiVisualCard
          className="lg:col-span-4"
          darkTheme={darkTheme}
          title={`${level3Label} Share`}
          subtitle="Click slice or row to cross-filter canvas"
          badge="DONUT + MATRIX"
          accentColor="emerald"
          insightText={`Click any ${level3Label} row to slice the entire workbook.`}
          insightHighlight={`${categoryBreakdown.length} Segments`}
        >
          <div className="space-y-3">
            <div className="h-36 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={58}
                    paddingAngle={2}
                    onClick={(entry) => {
                      if (!entry?.name) return;
                      setSelectedL3(prev => (prev === entry.name ? null : entry.name));
                    }}
                    className="cursor-pointer"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={selectedL3 && selectedL3 !== entry.name ? 0.25 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [`${val} records`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {categoryBreakdown.map(cat => {
                const isSelected = selectedL3 === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedL3(prev => (prev === cat.name ? null : cat.name))}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-black'
                        : darkTheme
                        ? 'bg-[#0b1728] hover:bg-slate-800 text-slate-200 border-slate-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate font-bold">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                      <span className="font-black">{cat.count}</span>
                      <span className="text-[10px] opacity-75">({cat.pct}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </PowerBiVisualCard>
      </div>
    </div>
  );
}
