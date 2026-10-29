import React, { useState, useMemo } from 'react';
import { Kaizen } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
  PieChart,
  Pie,
  LabelList
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  Activity,
  Users,
  Award,
  Trophy,
  Crown,
  Medal,
  Filter,
  RotateCcw,
  Search,
  Layers,
  Sparkles,
  GitBranch,
  Target,
  ShieldCheck,
  Calendar,
  Building2,
  Eye,
  SlidersHorizontal,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { formatIndianRupees, formatIndianRupeesCompact } from '../utils';
import { PowerBiVisualCard, SFC_PALETTE, DrillBreadcrumbItem } from './common/SfcPowerBiShared';

interface DashboardProps {
  kaizens: Kaizen[];
  onSelectKaizen: (k: Kaizen) => void;
  onNavigateToTab: (tab: 'form' | 'committee' | 'list' | 'cft-awards' | 'process-flowchart' | 'gamification') => void;
}

type PqcdsmKey = 'p' | 'q' | 'c' | 'd' | 's' | 'm';

const PQCDSM_META: { key: PqcdsmKey; code: string; label: string; color: string }[] = [
  { key: 'p', code: 'P', label: 'Productivity', color: '#0ea5e9' },
  { key: 'q', code: 'Q', label: 'Quality', color: '#6366f1' },
  { key: 'c', code: 'C', label: 'Cost', color: '#10b981' },
  { key: 'd', code: 'D', label: 'Delivery', color: '#f59e0b' },
  { key: 's', code: 'S', label: 'Safety', color: '#f43f5e' },
  { key: 'm', code: 'M', label: 'Morale', color: '#a855f7' }
];

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function normalizeMonthName(m?: string): string {
  if (!m) return 'July';
  const found = MONTH_ORDER.find(full => full.toLowerCase().startsWith(m.trim().toLowerCase()));
  return found || m;
}

function getQuarterFromMonth(monthName: string): string {
  const idx = MONTH_ORDER.indexOf(monthName);
  if (idx >= 0 && idx <= 2) return 'Q1 (Jan–Mar)';
  if (idx >= 3 && idx <= 5) return 'Q2 (Apr–Jun)';
  if (idx >= 6 && idx <= 8) return 'Q3 (Jul–Sep)';
  return 'Q4 (Oct–Dec)';
}

function parseCleanName(raw?: string): { cleanName: string; role: string } {
  if (!raw) return { cleanName: 'Shopfloor Operator', role: 'Operator' };
  const match = raw.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  if (match) {
    return {
      cleanName: match[1].trim(),
      role: match[2]?.trim() || 'Operator / Engineer'
    };
  }
  return { cleanName: raw.trim(), role: 'Operator / Engineer' };
}

function computeLeadTimeDays(k: Kaizen): number {
  if (k.suggestionDate && k.implementedDate) {
    const d1 = new Date(k.suggestionDate);
    const d2 = new Date(k.implementedDate);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2.getTime() >= d1.getTime()) {
      return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }
  return 6;
}

export default function Dashboard({ kaizens, onSelectKaizen, onNavigateToTab }: DashboardProps) {
  // ============================================================================
  // 1. POWER-BI / TABLEAU WORKBOOK THEME & REPORT PAGE TABS
  // ============================================================================
  const [darkTheme, setDarkTheme] = useState<boolean>(true); // PowerBI Executive Dark Navy by default, 1-click toggle to Tableau Crisp Light
  const [reportPage, setReportPage] = useState<'all' | 'toppers' | 'yoy_roi' | 'hierarchy' | 'matrix'>('all');

  // ============================================================================
  // 2. POWER-BI CHICLET SLICERS & CROSS-FILTER STATES
  // ============================================================================
  const [periodSlicer, setPeriodSlicer] = useState<string>('ALL');
  const [deptSlicer, setDeptSlicer] = useState<string>('ALL');
  const [classificationSlicer, setClassificationSlicer] = useState<string>('ALL');
  const [statusSlicer, setStatusSlicer] = useState<string>('ALL');
  const [pillarSlicer, setPillarSlicer] = useState<PqcdsmKey | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [crossEmployee, setCrossEmployee] = useState<string | null>(null);

  // ============================================================================
  // 3. HIERARCHY DRILL-DOWN STATES
  // ============================================================================
  // Plant Hierarchy: 0 = Minifactory -> 1 = Line/Area -> 2 = Machine/Station -> 3 = Individual Kaizen
  const [plantDrillLevel, setPlantDrillLevel] = useState<number>(0);
  const [drillDept, setDrillDept] = useState<string | null>(null);
  const [drillArea, setDrillArea] = useState<string | null>(null);
  const [drillMachine, setDrillMachine] = useState<string | null>(null);
  const [plantDrillMode, setPlantDrillMode] = useState<boolean>(true);
  const [plantChartMetric, setPlantChartMetric] = useState<'combo' | 'status' | 'savings'>('combo');

  // Time Hierarchy: 0 = YoY (2021-2026) -> 1 = Quarterly -> 2 = Monthly
  const [timeDrillLevel, setTimeDrillLevel] = useState<number>(2);
  const [drillQuarter, setDrillQuarter] = useState<string | null>(null);
  const [timeDrillMode, setTimeDrillMode] = useState<boolean>(true);

  // Decomposition Tree State
  const [decompMetric, setDecompMetric] = useState<'savings' | 'count'>('savings');
  const [decompSelectedDept, setDecompSelectedDept] = useState<string | null>(null);
  const [decompSelectedArea, setDecompSelectedArea] = useState<string | null>(null);

  // Employee View & Sort State
  const [empSortBy, setEmpSortBy] = useState<'total' | 'savings' | 'approved'>('total');
  const [empViewMode, setEmpViewMode] = useState<'bars' | 'podium' | 'table'>('bars');
  const [expandedEmpName, setExpandedEmpName] = useState<string | null>(null);

  // Available Departments & Months
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    kaizens.forEach(k => {
      if (k.minifactory) set.add(k.minifactory);
    });
    return Array.from(set).sort();
  }, [kaizens]);

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    kaizens.forEach(k => set.add(normalizeMonthName(k.month)));
    return MONTH_ORDER.filter(m => set.has(m));
  }, [kaizens]);

  // ============================================================================
  // MASTER FILTERED DATASET (Connected to all PowerBI Slicers & Cross-Filters)
  // ============================================================================
  const filteredKaizens = useMemo(() => {
    return kaizens.filter(k => {
      const normMonth = normalizeMonthName(k.month);
      const quarter = getQuarterFromMonth(normMonth);
      const { cleanName } = parseCleanName(k.ideaBy);

      if (periodSlicer !== 'ALL') {
        if (periodSlicer.startsWith('Q')) {
          if (quarter !== periodSlicer) return false;
        } else if (normMonth !== periodSlicer) {
          return false;
        }
      }
      if (drillQuarter && quarter !== drillQuarter) return false;
      if (deptSlicer !== 'ALL' && k.minifactory !== deptSlicer) return false;
      if (drillDept && k.minifactory !== drillDept) return false;
      if (drillArea && k.area !== drillArea) return false;
      if (drillMachine && k.machine !== drillMachine) return false;
      if (classificationSlicer !== 'ALL' && k.classification !== classificationSlicer) return false;
      if (statusSlicer !== 'ALL') {
        if (statusSlicer === 'ApprovedAndGood' && !(k.status === 'Approved' || k.status === 'Good Point')) return false;
        else if (statusSlicer !== 'ApprovedAndGood' && k.status !== statusSlicer) return false;
      }
      if (pillarSlicer !== 'ALL' && !k.benefits?.[pillarSlicer]) return false;
      if (crossEmployee && cleanName !== crossEmployee) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match =
          k.srNo.toLowerCase().includes(q) ||
          k.title.toLowerCase().includes(q) ||
          k.area.toLowerCase().includes(q) ||
          k.minifactory.toLowerCase().includes(q) ||
          k.machine.toLowerCase().includes(q) ||
          k.ideaBy.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    kaizens,
    periodSlicer,
    drillQuarter,
    deptSlicer,
    drillDept,
    drillArea,
    drillMachine,
    classificationSlicer,
    statusSlicer,
    pillarSlicer,
    crossEmployee,
    searchQuery
  ]);

  // ============================================================================
  // CORE KPI METRICS
  // ============================================================================
  const totalCount = filteredKaizens.length;
  const approvedList = useMemo(
    () => filteredKaizens.filter(k => k.status === 'Approved' || k.status === 'Good Point'),
    [filteredKaizens]
  );
  const pendingList = useMemo(
    () => filteredKaizens.filter(k => k.status === 'Pending'),
    [filteredKaizens]
  );
  const goodPointList = useMemo(
    () => filteredKaizens.filter(k => k.classification === 'Good Point' || k.status === 'Good Point'),
    [filteredKaizens]
  );
  const kaizenOnlyCount = totalCount - goodPointList.length;
  const totalSavings = useMemo(
    () => filteredKaizens.reduce((sum, k) => sum + (k.costSave || 0), 0),
    [filteredKaizens]
  );
  const approvalRatePct = totalCount > 0 ? Math.round((approvedList.length / totalCount) * 100) : 0;
  const avgSavingsPerKaizen = totalCount > 0 ? Math.round(totalSavings / totalCount) : 0;
  const avgLeadTimeDays = useMemo(() => {
    if (approvedList.length === 0) return 0;
    const sum = approvedList.reduce((acc, k) => acc + computeLeadTimeDays(k), 0);
    return Number((sum / approvedList.length).toFixed(1));
  }, [approvedList]);

  // ============================================================================
  // EMPLOYEE TOPPERS & WORKFORCE LEADERBOARD ANALYTICS
  // ============================================================================
  const employeeAnalytics = useMemo(() => {
    const map: Record<string, {
      cleanName: string;
      role: string;
      dept: string;
      total: number;
      approved: number;
      goodPoint: number;
      pending: number;
      savings: number;
      kaizens: Kaizen[];
    }> = {};

    // Aggregate from filteredKaizens (or full kaizens when no employee filter is set)
    const sourceList = filteredKaizens;
    sourceList.forEach(k => {
      const { cleanName, role } = parseCleanName(k.ideaBy);
      if (!map[cleanName]) {
        map[cleanName] = {
          cleanName,
          role,
          dept: k.minifactory || 'MF1',
          total: 0,
          approved: 0,
          goodPoint: 0,
          pending: 0,
          savings: 0,
          kaizens: []
        };
      }
      map[cleanName].total += 1;
      if (k.status === 'Approved') map[cleanName].approved += 1;
      else if (k.status === 'Good Point') map[cleanName].goodPoint += 1;
      else map[cleanName].pending += 1;
      map[cleanName].savings += k.costSave || 0;
      map[cleanName].kaizens.push(k);
    });

    return Object.values(map).sort((a, b) => {
      if (empSortBy === 'savings') return b.savings - a.savings || b.total - a.total;
      if (empSortBy === 'approved') return (b.approved + b.goodPoint) - (a.approved + a.goodPoint) || b.savings - a.savings;
      return b.total - a.total || b.savings - a.savings;
    });
  }, [filteredKaizens, empSortBy]);

  // Top 3 Employee Toppers (Ranked by Total & ROI)
  const top3EmployeeToppers = useMemo(() => {
    return [...employeeAnalytics]
      .sort((a, b) => b.total - a.total || b.savings - a.savings)
      .slice(0, 3);
  }, [employeeAnalytics]);

  // Top 3 Highest-ROI Kaizen Sheets (Best Kaizen Toppers)
  const top3KaizenSheets = useMemo(() => {
    return [...filteredKaizens]
      .filter(k => k.costSave > 0)
      .sort((a, b) => b.costSave - a.costSave)
      .slice(0, 3);
  }, [filteredKaizens]);

  // ============================================================================
  // PLANT HIERARCHY DRILL-DOWN DATA (Minifactory -> Line/Area -> Machine -> Kaizen)
  // ============================================================================
  const plantHierarchyData = useMemo(() => {
    const groups: Record<string, {
      name: string;
      fullTitle?: string;
      count: number;
      approved: number;
      pending: number;
      goodPoint: number;
      savings: number;
      savingsLakhs: number;
      kaizenItem?: Kaizen;
    }> = {};

    filteredKaizens.forEach(k => {
      const key =
        plantDrillLevel === 0 ? (k.minifactory || 'General') :
        plantDrillLevel === 1 ? (k.area || 'Main Line') :
        plantDrillLevel === 2 ? (k.machine || 'Station 01') :
        k.srNo;

      if (!groups[key]) {
        groups[key] = {
          name: key,
          fullTitle: plantDrillLevel === 3 ? `${k.srNo}: ${k.title}` : key,
          count: 0,
          approved: 0,
          pending: 0,
          goodPoint: 0,
          savings: 0,
          savingsLakhs: 0,
          kaizenItem: plantDrillLevel === 3 ? k : undefined
        };
      }
      groups[key].count += 1;
      if (k.status === 'Approved') groups[key].approved += 1;
      else if (k.status === 'Good Point') groups[key].goodPoint += 1;
      else groups[key].pending += 1;

      groups[key].savings += k.costSave || 0;
      groups[key].savingsLakhs = Number((groups[key].savings / 100000).toFixed(2));
    });

    return Object.values(groups).sort((a, b) => b.count - a.count || b.savings - a.savings);
  }, [filteredKaizens, plantDrillLevel]);

  // Department Summary for Donuts & Topper Dept
  const deptDistribution = useMemo(() => {
    const map: Record<string, { name: string; count: number; savings: number }> = {};
    filteredKaizens.forEach(k => {
      const d = k.minifactory || 'General';
      if (!map[d]) map[d] = { name: d, count: 0, savings: 0 };
      map[d].count += 1;
      map[d].savings += k.costSave || 0;
    });
    const list = Object.values(map).sort((a, b) => b.savings - a.savings || b.count - a.count);
    return list.map((item, idx) => ({
      ...item,
      volPct: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
      savPct: totalSavings > 0 ? Math.round((item.savings / totalSavings) * 100) : 0,
      color: SFC_PALETTE.categorical[idx % SFC_PALETTE.categorical.length]
    }));
  }, [filteredKaizens, totalCount, totalSavings]);

  const top1DeptTopper = deptDistribution[0];

  const handlePlantBarClick = (entry: any) => {
    if (!entry || !entry.name) return;
    if (plantDrillLevel === 3 && entry.kaizenItem) {
      onSelectKaizen(entry.kaizenItem);
      return;
    }

    if (!plantDrillMode) {
      if (plantDrillLevel === 0) setDeptSlicer(prev => (prev === entry.name ? 'ALL' : entry.name));
      else if (plantDrillLevel === 1) setDrillArea(prev => (prev === entry.name ? null : entry.name));
      else if (plantDrillLevel === 2) setDrillMachine(prev => (prev === entry.name ? null : entry.name));
      return;
    }

    if (plantDrillLevel === 0) {
      setDrillDept(entry.name);
      setPlantDrillLevel(1);
    } else if (plantDrillLevel === 1) {
      setDrillArea(entry.name);
      setPlantDrillLevel(2);
    } else if (plantDrillLevel === 2) {
      setDrillMachine(entry.name);
      setPlantDrillLevel(3);
    }
  };

  const handlePlantDrillUp = () => {
    if (plantDrillLevel === 3) {
      setDrillMachine(null);
      setPlantDrillLevel(2);
    } else if (plantDrillLevel === 2) {
      setDrillArea(null);
      setPlantDrillLevel(1);
    } else if (plantDrillLevel === 1) {
      setDrillDept(null);
      setPlantDrillLevel(0);
    }
  };

  const handlePlantDrillToLevel = (targetLevel: number) => {
    if (targetLevel <= 0) {
      setDrillDept(null);
      setDrillArea(null);
      setDrillMachine(null);
      setPlantDrillLevel(0);
    } else if (targetLevel === 1) {
      setDrillArea(null);
      setDrillMachine(null);
      setPlantDrillLevel(1);
    } else if (targetLevel === 2) {
      setDrillMachine(null);
      setPlantDrillLevel(2);
    }
  };

  const plantBreadcrumbs: DrillBreadcrumbItem[] = [
    { label: 'All Minifactories', value: drillDept || undefined, level: 0 },
    ...(plantDrillLevel >= 1 ? [{ label: 'Line / Area', value: drillArea || undefined, level: 1 }] : []),
    ...(plantDrillLevel >= 2 ? [{ label: 'Machine / Station', value: drillMachine || undefined, level: 2 }] : []),
    ...(plantDrillLevel >= 3 ? [{ label: 'Kaizen Sheets', level: 3 }] : [])
  ];

  // ============================================================================
  // YOY BENCHMARK & TIME-HIERARCHY DATA
  // ============================================================================
  const yoyBenchmarkData = useMemo(() => {
    const liveSavings = filteredKaizens.reduce((s, k) => s + (k.costSave || 0), 0);
    return [
      { year: '2021', count: 360, perEmp: 1.13, savings: 658071, savingsLakhs: '₹6.58L' },
      { year: '2022', count: 379, perEmp: 1.14, savings: 710238, savingsLakhs: '₹7.10L' },
      { year: '2023', count: 442, perEmp: 1.18, savings: 834458, savingsLakhs: '₹8.34L' },
      { year: '2024', count: 441, perEmp: 1.34, savings: 896448, savingsLakhs: '₹8.96L' },
      { year: '2025', count: 409, perEmp: 1.37, savings: 887300, savingsLakhs: '₹8.87L' },
      {
        year: '2026 Live',
        count: Math.max(filteredKaizens.length, 1),
        perEmp: Number((1.42 + filteredKaizens.length * 0.02).toFixed(2)),
        savings: liveSavings,
        savingsLakhs: formatIndianRupeesCompact(liveSavings)
      }
    ];
  }, [filteredKaizens]);

  const timeHierarchyData = useMemo(() => {
    if (timeDrillLevel === 0) {
      let cum = 0;
      return yoyBenchmarkData.map(y => {
        cum += y.savings;
        return {
          name: y.year,
          count: y.count,
          approved: Math.round(y.count * 0.9),
          pending: Math.round(y.count * 0.1),
          savings: y.savings,
          cumulativeSavings: cum
        };
      });
    }

    if (timeDrillLevel === 1) {
      const qOrder = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)'];
      const qMap: Record<string, { name: string; count: number; approved: number; pending: number; savings: number }> = {};
      qOrder.forEach(q => {
        qMap[q] = { name: q, count: 0, approved: 0, pending: 0, savings: 0 };
      });
      filteredKaizens.forEach(k => {
        const q = getQuarterFromMonth(normalizeMonthName(k.month));
        if (!qMap[q]) qMap[q] = { name: q, count: 0, approved: 0, pending: 0, savings: 0 };
        qMap[q].count += 1;
        if (k.status === 'Approved' || k.status === 'Good Point') qMap[q].approved += 1;
        else qMap[q].pending += 1;
        qMap[q].savings += k.costSave || 0;
      });
      let cum = 0;
      return Object.values(qMap).map(item => {
        cum += item.savings;
        return { ...item, cumulativeSavings: cum };
      });
    }

    // Level 2: Monthly Velocity
    const mMap: Record<string, { name: string; fullMonth: string; count: number; approved: number; pending: number; savings: number }> = {};
    allMonths.forEach(m => {
      mMap[m] = { name: m.slice(0, 3), fullMonth: m, count: 0, approved: 0, pending: 0, savings: 0 };
    });
    filteredKaizens.forEach(k => {
      const m = normalizeMonthName(k.month);
      if (!mMap[m]) mMap[m] = { name: m.slice(0, 3), fullMonth: m, count: 0, approved: 0, pending: 0, savings: 0 };
      mMap[m].count += 1;
      if (k.status === 'Approved' || k.status === 'Good Point') mMap[m].approved += 1;
      else mMap[m].pending += 1;
      mMap[m].savings += k.costSave || 0;
    });
    let cum = 0;
    return Object.values(mMap).map(item => {
      cum += item.savings;
      return { ...item, cumulativeSavings: cum };
    });
  }, [filteredKaizens, timeDrillLevel, yoyBenchmarkData, allMonths]);

  const handleTimeBarClick = (entry: any) => {
    if (!entry) return;
    if (timeDrillLevel === 0) {
      setTimeDrillLevel(1);
    } else if (timeDrillLevel === 1) {
      if (timeDrillMode) {
        setDrillQuarter(entry.name);
        setTimeDrillLevel(2);
      } else {
        setPeriodSlicer(prev => (prev === entry.name ? 'ALL' : entry.name));
      }
    } else if (timeDrillLevel === 2) {
      const targetM = entry.fullMonth || entry.name;
      setPeriodSlicer(prev => (prev === targetM ? 'ALL' : targetM));
    }
  };

  const handleTimeDrillUp = () => {
    if (timeDrillLevel === 2) {
      setDrillQuarter(null);
      setTimeDrillLevel(1);
    } else if (timeDrillLevel === 1) {
      setDrillQuarter(null);
      setTimeDrillLevel(0);
    }
  };

  const timeBreadcrumbs: DrillBreadcrumbItem[] = [
    { label: 'YoY (2021–2026)', level: 0 },
    ...(timeDrillLevel >= 1 ? [{ label: 'Quarter', value: drillQuarter || undefined, level: 1 }] : []),
    ...(timeDrillLevel >= 2 ? [{ label: 'Month', value: periodSlicer !== 'ALL' ? periodSlicer : undefined, level: 2 }] : [])
  ];

  // ============================================================================
  // DECOMPOSITION TREE & 80/20 PARETO & PQCDSM MATRIX DATA
  // ============================================================================
  const decompTreeData = useMemo(() => {
    const depts = deptDistribution;
    const activeDept = decompSelectedDept || depts[0]?.name || null;

    const areaMap: Record<string, { name: string; count: number; savings: number }> = {};
    filteredKaizens
      .filter(k => !activeDept || k.minifactory === activeDept)
      .forEach(k => {
        const a = k.area || 'Main Line';
        if (!areaMap[a]) areaMap[a] = { name: a, count: 0, savings: 0 };
        areaMap[a].count += 1;
        areaMap[a].savings += k.costSave || 0;
      });
    const areas = Object.values(areaMap).sort((a, b) =>
      decompMetric === 'savings' ? b.savings - a.savings : b.count - a.count
    );

    const activeArea =
      decompSelectedArea && areas.some(a => a.name === decompSelectedArea)
        ? decompSelectedArea
        : areas[0]?.name || null;

    const leafKaizens = filteredKaizens
      .filter(k => (!activeDept || k.minifactory === activeDept) && (!activeArea || k.area === activeArea))
      .sort((a, b) => (decompMetric === 'savings' ? b.costSave - a.costSave : 0));

    return { depts, activeDept, areas, activeArea, leafKaizens };
  }, [filteredKaizens, deptDistribution, decompMetric, decompSelectedDept, decompSelectedArea]);

  const paretoData = useMemo(() => {
    const map: Record<string, { name: string; savings: number; count: number }> = {};
    filteredKaizens.forEach(k => {
      const key = k.area || k.minifactory || 'General';
      if (!map[key]) map[key] = { name: key, savings: 0, count: 0 };
      map[key].savings += k.costSave || 0;
      map[key].count += 1;
    });
    const sorted = Object.values(map).sort((a, b) => b.savings - a.savings);
    const totalSav = sorted.reduce((s, i) => s + i.savings, 0) || 1;
    let cum = 0;
    return sorted.map(item => {
      cum += item.savings;
      return {
        ...item,
        shortName: item.name.length > 15 ? `${item.name.slice(0, 14)}..` : item.name,
        savingsLakhs: Number((item.savings / 100000).toFixed(2)),
        cumulativePct: Math.round((cum / totalSav) * 100)
      };
    });
  }, [filteredKaizens]);

  const pqcdsmStats = useMemo(() => {
    return PQCDSM_META.map(meta => {
      const matching = filteredKaizens.filter(k => k.benefits?.[meta.key]);
      const count = matching.length;
      const savings = matching.reduce((s, k) => s + (k.costSave || 0), 0);
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { ...meta, count, savings, pct };
    });
  }, [filteredKaizens, totalCount]);

  const deptPqcdsmMatrix = useMemo(() => {
    const depts = allDepartments.length > 0 ? allDepartments : ['MF1', 'MF2', 'MF3', 'Machining', 'Maintenance', 'Quality'];
    return depts.map(dept => {
      const deptItems = filteredKaizens.filter(k => k.minifactory === dept);
      const cells: Record<PqcdsmKey, number> = { p: 0, q: 0, c: 0, d: 0, s: 0, m: 0 };
      deptItems.forEach(k => {
        PQCDSM_META.forEach(m => {
          if (k.benefits?.[m.key]) cells[m.key] += 1;
        });
      });
      const savings = deptItems.reduce((s, k) => s + (k.costSave || 0), 0);
      return { dept, total: deptItems.length, savings, cells };
    });
  }, [filteredKaizens, allDepartments]);

  // Reset All Slicers & Drill Paths
  const hasActiveFilters =
    periodSlicer !== 'ALL' ||
    deptSlicer !== 'ALL' ||
    classificationSlicer !== 'ALL' ||
    statusSlicer !== 'ALL' ||
    pillarSlicer !== 'ALL' ||
    searchQuery.trim() !== '' ||
    drillDept !== null ||
    drillArea !== null ||
    drillMachine !== null ||
    drillQuarter !== null ||
    crossEmployee !== null;

  const handleResetAllFilters = () => {
    setPeriodSlicer('ALL');
    setDeptSlicer('ALL');
    setClassificationSlicer('ALL');
    setStatusSlicer('ALL');
    setPillarSlicer('ALL');
    setSearchQuery('');
    setDrillDept(null);
    setDrillArea(null);
    setDrillMachine(null);
    setPlantDrillLevel(0);
    setDrillQuarter(null);
    setCrossEmployee(null);
  };

  // Theme classes
  const canvasBg = darkTheme ? 'bg-[#060e1a] text-white' : 'bg-slate-100 text-slate-900';
  const ribbonBg = darkTheme ? 'bg-[#0b1728] border-slate-800' : 'bg-white border-slate-200';
  const tileBg = darkTheme ? 'bg-[#0f1f35] border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${canvasBg}`}>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-3 space-y-3.5">

        {/* ===================================================================
            1. POWER-BI / TABLEAU WORKBOOK TOP COMMAND RIBBON & PAGE TABS
        =================================================================== */}
        <div className={`rounded-xl border p-3.5 shadow-md space-y-3 ${ribbonBg}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    POWER-BI &amp; TABLEAU EXECUTIVE WORKBOOK
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                    LIVE DRILL-UP / DRILL-DOWN &amp; TOPPERS PODIUM
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase font-mono mt-0.5">
                  SFC Kaizen Intelligence, Toppers &amp; Financial ROI Analytics
                </h1>
              </div>
            </div>

            {/* Quick Module Actions & Theme Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setDarkTheme(!darkTheme)}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap ${
                  darkTheme
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                {darkTheme ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{darkTheme ? 'Tableau Light Mode' : 'PowerBI Dark Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('form')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black rounded-lg text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+ Log Kaizen</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('committee')}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  darkTheme ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>CFT Review ({pendingList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('cft-awards')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black rounded-lg text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>CFT Awards</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('gamification')}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  darkTheme ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Gamification</span>
              </button>
            </div>
          </div>

          {/* PowerBI Workbook Report Page Tabs */}
          <div className={`pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap ${darkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: '📊 Page 1: Full PowerBI Executive Canvas' },
                { id: 'toppers', label: '🏆 Page 2: Toppers Wall of Fame & Leaderboard' },
                { id: 'yoy_roi', label: '📈 Page 3: YoY Growth & Financial Impact' },
                { id: 'hierarchy', label: '⑂ Page 4: Hierarchy Drill & Decomposition Tree' },
                { id: 'matrix', label: '🎯 Page 5: PQCDSM Radar & Tableau Matrix' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReportPage(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer whitespace-nowrap border-b-2 ${
                    reportPage === tab.id
                      ? 'bg-sky-500 text-slate-950 border-amber-400 font-black'
                      : darkTheme
                      ? 'bg-[#07111e] text-slate-300 hover:bg-slate-800 border-transparent'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono opacity-80 tabular-nums">
              Active Dataset: <strong>{filteredKaizens.length}</strong> / {kaizens.length} Sheets
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. POWER-BI CHICLET SLICER PANEL (100% INTERACTIVE & SYNCED)
        =================================================================== */}
        <div className={`rounded-xl border p-3 shadow-xs space-y-2.5 ${ribbonBg}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 text-xs font-mono items-end">
            {/* Timeline Slicer (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[9px] font-bold uppercase text-sky-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Period Slicer</span>
              </label>
              <select
                value={periodSlicer}
                onChange={(e) => setPeriodSlicer(e.target.value)}
                className={`w-full rounded-lg px-2 py-1.5 text-[11px] font-bold border focus:outline-none ${
                  darkTheme ? 'bg-[#07111e] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
              >
                <option value="ALL">All Months (YTD)</option>
                <option value="Q1 (Jan–Mar)">Q1 (Jan–Mar)</option>
                <option value="Q2 (Apr–Jun)">Q2 (Apr–Jun)</option>
                <option value="Q3 (Jul–Sep)">Q3 (Jul–Sep)</option>
                {allMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Minifactory Chiclet Slicer (4 cols) */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Minifactory Chiclet Slicer</span>
              </label>
              <div className={`flex flex-wrap gap-1 p-1 rounded-lg border ${darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setDeptSlicer('ALL')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                    deptSlicer === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : darkTheme ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  ALL
                </button>
                {allDepartments.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeptSlicer(prev => (prev === d ? 'ALL' : d))}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      deptSlicer === d
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : darkTheme ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Type & Status Chiclet Slicers (3 cols) */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[9px] font-bold uppercase text-amber-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Status &amp; Type Slicer</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={statusSlicer}
                  onChange={(e) => setStatusSlicer(e.target.value)}
                  className={`w-full rounded-lg px-2 py-1.5 text-[11px] font-bold border focus:outline-none ${
                    darkTheme ? 'bg-[#07111e] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="ALL">Status: All</option>
                  <option value="ApprovedAndGood">Closed / Appr</option>
                  <option value="Pending">Open / Pending</option>
                </select>
                <select
                  value={classificationSlicer}
                  onChange={(e) => setClassificationSlicer(e.target.value)}
                  className={`w-full rounded-lg px-2 py-1.5 text-[11px] font-bold border focus:outline-none ${
                    darkTheme ? 'bg-[#07111e] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="ALL">Type: All</option>
                  <option value="Kaizen">Kaizen</option>
                  <option value="Good Point">Good Point</option>
                </select>
              </div>
            </div>

            {/* PQCDSM & Search Slicer (3 cols) */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[9px] font-bold uppercase text-violet-400 flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>PQCDSM &amp; Search</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className={`flex p-0.5 rounded-lg border shrink-0 ${darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  {PQCDSM_META.map(m => (
                    <button
                      key={m.key}
                      type="button"
                      title={m.label}
                      onClick={() => setPillarSlicer(prev => (prev === m.key ? 'ALL' : m.key))}
                      className={`w-5 h-6 rounded text-[10px] font-black transition cursor-pointer ${
                        pillarSlicer === m.key
                          ? 'bg-sky-500 text-slate-950'
                          : darkTheme ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {m.code}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`w-full rounded-lg pl-6 pr-2 py-1.5 text-[11px] border focus:outline-none ${
                      darkTheme ? 'bg-[#07111e] text-white border-slate-700 placeholder-slate-500' : 'bg-slate-50 text-slate-900 border-slate-300'
                    }`}
                  />
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Cross-Filter & Drill Path Bar */}
          {hasActiveFilters && (
            <div className={`pt-2 border-t flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono ${darkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Active Slicers:</span>
                </span>
                {drillDept && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                    Drill Dept: {drillDept} <button type="button" onClick={() => handlePlantDrillToLevel(0)} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {drillArea && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                    Drill Area: {drillArea} <button type="button" onClick={() => handlePlantDrillToLevel(1)} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {drillMachine && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                    Drill Machine: {drillMachine} <button type="button" onClick={() => handlePlantDrillToLevel(2)} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {deptSlicer !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Minifactory: {deptSlicer} <button type="button" onClick={() => setDeptSlicer('ALL')} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {periodSlicer !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Period: {periodSlicer} <button type="button" onClick={() => setPeriodSlicer('ALL')} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {pillarSlicer !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold">
                    Pillar: {pillarSlicer.toUpperCase()} <button type="button" onClick={() => setPillarSlicer('ALL')} className="ml-1 text-rose-400 font-black cursor-pointer">×</button>
                  </span>
                )}
                {crossEmployee && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                    Topper Filter: {crossEmployee} <button type="button" onClick={() => setCrossEmployee(null)} className="ml-1 text-rose-700 font-black cursor-pointer">×</button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetAllFilters}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
            3. POWER-BI KPI CARDS STRIP (6 COMPACT HIGH-CONTRAST BI CARDS)
        =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
          <div className={`p-3 rounded-xl border border-t-2 border-t-sky-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-sky-400 block">TOTAL SUBMISSIONS</span>
            <div className="text-2xl font-black tabular-nums mt-0.5">{totalCount}</div>
            <span className="text-[10px] opacity-70 block tabular-nums">{kaizenOnlyCount} Kaizen • {goodPointList.length} Good Pt</span>
          </div>

          <div className={`p-3 rounded-xl border border-t-2 border-t-lime-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-lime-400 block">COST SAVED / AVOIDED</span>
            <div className="text-2xl font-black text-lime-400 tabular-nums mt-0.5">{formatIndianRupeesCompact(totalSavings)}</div>
            <span className="text-[10px] opacity-70 block tabular-nums">Avg {formatIndianRupeesCompact(avgSavingsPerKaizen)}/sht</span>
          </div>

          <div className={`p-3 rounded-xl border border-t-2 border-t-emerald-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-emerald-400 block">APPROVED / CLOSED</span>
            <div className="text-2xl font-black text-emerald-400 tabular-nums mt-0.5">
              {approvedList.length} <span className="text-xs opacity-75">({approvalRatePct}%)</span>
            </div>
            <span className="text-[10px] opacity-70 block">Standardized on line</span>
          </div>

          <div className={`p-3 rounded-xl border border-t-2 border-t-amber-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-amber-400 block">OPEN / PENDING CFT</span>
            <div className="text-2xl font-black text-amber-400 tabular-nums mt-0.5">{pendingList.length}</div>
            <span className="text-[10px] opacity-70 block">Awaiting CFT review</span>
          </div>

          <div className={`p-3 rounded-xl border border-t-2 border-t-indigo-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-indigo-400 block">KAIZENS / EMPLOYEE</span>
            <div className="text-2xl font-black text-indigo-400 tabular-nums mt-0.5">1.65</div>
            <span className="text-[10px] opacity-70 block">+20.4% vs 2025 (1.37)</span>
          </div>

          <div className={`p-3 rounded-xl border border-t-2 border-t-violet-500 ${tileBg}`}>
            <span className="text-[9px] font-bold uppercase text-violet-400 block">AVG LEAD TIME</span>
            <div className="text-2xl font-black text-violet-400 tabular-nums mt-0.5">{avgLeadTimeDays}d</div>
            <span className="text-[10px] opacity-70 block">Idea → Implementation</span>
          </div>
        </div>

        {/* ===================================================================
            4. 🏆 HALL OF TOPPERS: EMPLOYEE PODIUM + DEPT TOPPER + BEST KAIZENS
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'toppers') && (
          <div className={`rounded-xl border p-4 space-y-4 ${ribbonBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-slate-700/60">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      CHAMPIONSHIP PODIUM
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-wider font-mono">
                      Plant Kaizen Toppers — Employee Champions, #1 Minifactory &amp; Top ROI Sheets
                    </h2>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Click any Topper Card to Cross-Filter Workbook or Inspect Sheet
              </span>
            </div>

            {/* Row A: Top 3 Employee Toppers (Gold #1, Silver #2, Bronze #3) + #1 Minifactory Topper */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
              {top3EmployeeToppers.map((emp, idx) => {
                const isSelected = crossEmployee === emp.cleanName;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const rankLabel = idx === 0 ? 'GOLD TOPPER #1' : idx === 1 ? 'SILVER TOPPER #2' : 'BRONZE TOPPER #3';
                const borderStyle =
                  idx === 0
                    ? darkTheme
                      ? 'bg-gradient-to-br from-amber-500/25 via-[#0f1f35] to-[#0a1526] border-amber-400/70'
                      : 'bg-gradient-to-br from-amber-50 via-amber-100/40 to-white border-amber-400'
                    : idx === 1
                    ? darkTheme
                      ? 'bg-gradient-to-br from-slate-400/20 via-[#0f1f35] to-[#0a1526] border-slate-400/60'
                      : 'bg-gradient-to-br from-slate-100 to-white border-slate-300'
                    : darkTheme
                    ? 'bg-gradient-to-br from-orange-500/20 via-[#0f1f35] to-[#0a1526] border-orange-400/60'
                    : 'bg-gradient-to-br from-orange-50 to-white border-orange-300';

                return (
                  <button
                    key={emp.cleanName}
                    type="button"
                    onClick={() => setCrossEmployee(prev => (prev === emp.cleanName ? null : emp.cleanName))}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${borderStyle} ${
                      isSelected ? 'ring-2 ring-sky-400' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-2xl shrink-0">{medal}</span>
                          <div className="min-w-0">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded inline-block ${
                              idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-orange-400 text-slate-950'
                            }`}>
                              {rankLabel}
                            </span>
                            <h3 className="text-sm font-black truncate mt-1 font-sans">{emp.cleanName}</h3>
                            <span className="text-[10px] opacity-75 block truncate">{emp.role} • {emp.dept}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-xs shrink-0 tabular-nums">
                          {emp.total} Shts
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-600/30 flex items-center justify-between text-[11px] tabular-nums">
                      <div>
                        <span className="text-[9px] opacity-70 uppercase block">Approved</span>
                        <span className="font-black text-emerald-400">{emp.approved + emp.goodPoint} Approved</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] opacity-70 uppercase block">Validated ROI</span>
                        <span className="font-black text-amber-400">{formatIndianRupeesCompact(emp.savings)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* 4th Card: #1 Department / Minifactory Champion Topper */}
              {top1DeptTopper && (
                <button
                  type="button"
                  onClick={() => setDeptSlicer(prev => (prev === top1DeptTopper.name ? 'ALL' : top1DeptTopper.name))}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    darkTheme
                      ? 'bg-gradient-to-br from-emerald-500/25 via-[#0f1f35] to-[#0a1526] border-emerald-400/70'
                      : 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">🏆</span>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 inline-block">
                          #1 MINIFACTORY TOPPER
                        </span>
                        <h3 className="text-sm font-black truncate mt-1">{top1DeptTopper.name} Champion</h3>
                        <span className="text-[10px] opacity-75 block truncate">
                          {top1DeptTopper.volPct}% Plant Volume Share
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs shrink-0 tabular-nums font-mono">
                      {top1DeptTopper.count} Shts
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-600/30 flex items-center justify-between text-[11px] font-mono tabular-nums">
                    <div>
                      <span className="text-[9px] opacity-70 uppercase block">ROI Share</span>
                      <span className="font-black text-sky-400">{top1DeptTopper.savPct}% of Plant</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] opacity-70 uppercase block">Total Dept ROI</span>
                      <span className="font-black text-lime-400">{formatIndianRupeesCompact(top1DeptTopper.savings)}</span>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Row B: Top 3 Highest-ROI Kaizen Sheets of the Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {top3KaizenSheets.map((k, idx) => (
                <div
                  key={k.id}
                  onClick={() => onSelectKaizen(k)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    darkTheme
                      ? 'bg-[#091526] hover:bg-slate-800/80 border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black">
                        TOP ROI #{idx + 1}
                      </span>
                      <span className="opacity-60 font-bold">{k.srNo}</span>
                      <span className="text-sky-400 font-bold">• {k.minifactory}</span>
                    </div>
                    <h4 className="text-xs font-bold truncate">{k.title}</h4>
                    <span className="text-[10px] opacity-70 font-mono block truncate">
                      By {k.ideaBy} • {k.machine}
                    </span>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-lime-500/20 text-lime-300 border border-lime-500/40 font-black text-xs tabular-nums block">
                      +{formatIndianRupeesCompact(k.costSave)}/yr
                    </span>
                    <span className="text-[9px] text-sky-400 underline mt-1 block">Inspect Sheet →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            5. POWER-BI BENCHMARK ROW: YOY KAIZENS, PER-EMPLOYEE & YOY COST SAVED
               (Exact PowerBI visuals with Direct Data Labels on Bars & Lines!)
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'yoy_roi') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Visual A (4 Cols): No. of Kaizens - Implemented YoY */}
            <PowerBiVisualCard
              className="lg:col-span-4"
              darkTheme={darkTheme}
              title="No. of Kaizens - Implemented YoY"
              subtitle="Multi-year submission trajectory with trend curve"
              badge="YOY VOLUME"
              accentColor="sky"
              insightText="Consistent YoY growth from 360 (2021) to 442 peak."
              insightHighlight="2021–2026 Live"
            >
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yoyBenchmarkData} margin={{ top: 20, right: 10, left: -18, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, fill: darkTheme ? '#e2e8f0' : '#1e293b' }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Implemented Kaizens" fill="#38bdf8" radius={[3, 3, 0, 0]}>
                      <LabelList
                        dataKey="count"
                        position="insideTop"
                        style={{ fill: '#0f172a', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}
                      />
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="YoY Trend"
                      stroke="#eab308"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#eab308', stroke: '#0f172a', strokeWidth: 1.5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PowerBiVisualCard>

            {/* Visual B (4 Cols): NO. OF KAIZENS PER EMPLOYEE */}
            <PowerBiVisualCard
              className="lg:col-span-4"
              darkTheme={darkTheme}
              title="No. of Kaizens Per Employee"
              subtitle="Workforce participation density ratio YoY"
              badge="PARTICIPATION RATIO"
              accentColor="emerald"
              insightText="Per-employee Kaizen density rose from 1.13 to 1.65."
              insightHighlight="+46% Cultural Lift"
            >
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yoyBenchmarkData} margin={{ top: 24, right: 16, left: -18, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, fill: darkTheme ? '#e2e8f0' : '#1e293b' }}
                    />
                    <YAxis
                      domain={[0.8, 2.0]}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="perEmp"
                      name="Kaizens / Employee"
                      stroke="#22c55e"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#0f172a', stroke: '#22c55e', strokeWidth: 3 }}
                    >
                      <LabelList
                        dataKey="perEmp"
                        position="top"
                        offset={10}
                        style={{
                          fill: darkTheme ? '#4ade80' : '#15803d',
                          fontSize: 11,
                          fontWeight: 900,
                          fontFamily: 'monospace'
                        }}
                      />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PowerBiVisualCard>

            {/* Visual C (4 Cols): YoY Cost Saved / Avoided (INR) */}
            <PowerBiVisualCard
              className="lg:col-span-4"
              darkTheme={darkTheme}
              title="YoY: Cost Saved / Avoided (INR)"
              subtitle="Validated annual financial impact with trajectory"
              badge="FINANCIAL IMPACT"
              accentColor="amber"
              insightText="Annualized cost avoidance on track for record high."
              insightHighlight={formatIndianRupeesCompact(totalSavings)}
            >
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yoyBenchmarkData} margin={{ top: 20, right: 12, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, fill: darkTheme ? '#e2e8f0' : '#1e293b' }}
                    />
                    <YAxis
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                    />
                    <Tooltip formatter={(v: any) => [formatIndianRupees(Number(v)), 'Cost Saved']} />
                    <Bar dataKey="savings" name="Cost Saved (INR)" fill="#a3e635" radius={[3, 3, 0, 0]}>
                      <LabelList
                        dataKey="savingsLakhs"
                        position="top"
                        style={{
                          fill: darkTheme ? '#d9f99d' : '#365314',
                          fontSize: 10,
                          fontWeight: 900,
                          fontFamily: 'monospace'
                        }}
                      />
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="savings"
                      name="Savings Trajectory"
                      stroke="#facc15"
                      strokeWidth={2.5}
                      strokeDasharray="5 4"
                      dot={{ r: 3.5, fill: '#facc15' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PowerBiVisualCard>
          </div>
        )}

        {/* ===================================================================
            6. POWER-BI DRILL-DOWN ROW: 4-LEVEL PLANT HIERARCHY & TIME HIERARCHY
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'hierarchy' || reportPage === 'yoy_roi') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Visual D (7 Cols): 4-Level Hierarchical Drill-Down Bar + ROI Line Chart */}
            <PowerBiVisualCard
              className="lg:col-span-7"
              darkTheme={darkTheme}
              title={
                plantDrillLevel === 0 ? 'Drill-Down: Minifactory Volume & Cost Savings' :
                plantDrillLevel === 1 ? `Drill-Down: Lines & Areas in ${drillDept}` :
                plantDrillLevel === 2 ? `Drill-Down: Machines & Stations in ${drillArea}` :
                `Drill-Down: Individual Kaizens at ${drillMachine}`
              }
              subtitle="Click any bar to Drill Down: Minifactory → Line/Area → Machine → Kaizen Sheet"
              badge={`HIERARCHY L${plantDrillLevel + 1}/4`}
              accentColor="sky"
              drillLevel={plantDrillLevel}
              maxDrillLevel={3}
              drillBreadcrumbs={plantBreadcrumbs}
              onDrillUp={handlePlantDrillUp}
              onDrillToLevel={handlePlantDrillToLevel}
              onExpandNextLevel={() => setPlantDrillLevel(prev => Math.min(3, prev + 1))}
              drillModeActive={plantDrillMode}
              onToggleDrillMode={() => setPlantDrillMode(prev => !prev)}
              headerRight={
                <div className={`flex rounded-lg p-0.5 border text-[10px] font-mono font-bold ${
                  darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {(['combo', 'status', 'savings'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPlantChartMetric(m)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer whitespace-nowrap ${
                        plantChartMetric === m ? 'bg-sky-500 text-slate-950 font-black' : 'opacity-75'
                      }`}
                    >
                      {m === 'combo' ? 'Combo' : m === 'status' ? 'Stacked' : '₹ ROI'}
                    </button>
                  ))}
                </div>
              }
              insightText="Click any bar to drill down into child stations, or use 'Up' in the visual header to drill up."
              insightHighlight={`${plantHierarchyData.length} Active Branches`}
            >
              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={plantHierarchyData} margin={{ top: 20, right: 16, left: -12, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, fill: darkTheme ? '#e2e8f0' : '#1e293b' }}
                      interval={0}
                      angle={plantHierarchyData.length > 4 ? -15 : 0}
                      textAnchor={plantHierarchyData.length > 4 ? 'end' : 'middle'}
                      height={45}
                    />
                    <YAxis
                      yAxisId="left"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#a3e635' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs font-mono space-y-1">
                            <div className="font-black text-sky-400 border-b border-slate-800 pb-1">
                              {d.fullTitle || d.name}
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Total Kaizens:</span>
                              <span className="font-bold tabular-nums">{d.count}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-emerald-400">Approved / Good Pt:</span>
                              <span className="font-bold tabular-nums">{d.approved + d.goodPoint}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-amber-400">Pending:</span>
                              <span className="font-bold tabular-nums">{d.pending}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
                              <span className="text-lime-400">Annualized ROI:</span>
                              <span className="font-black tabular-nums">{formatIndianRupees(d.savings)}</span>
                            </div>
                          </div>
                        );
                      }}
                    />

                    {plantChartMetric === 'combo' && (
                      <>
                        <Bar
                          yAxisId="left"
                          dataKey="count"
                          name="Kaizen Count"
                          fill="#0ea5e9"
                          radius={[4, 4, 0, 0]}
                          cursor="pointer"
                          onClick={(data) => handlePlantBarClick(data)}
                        >
                          {plantHierarchyData.map((entry, idx) => (
                            <Cell key={entry.name} fill={SFC_PALETTE.categorical[idx % SFC_PALETTE.categorical.length]} />
                          ))}
                          <LabelList
                            dataKey="count"
                            position="top"
                            style={{ fill: darkTheme ? '#ffffff' : '#0f172a', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}
                          />
                        </Bar>
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="savings"
                          name="Cost Saved (₹)"
                          stroke="#a3e635"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#a3e635', stroke: '#0f172a', strokeWidth: 2 }}
                        />
                      </>
                    )}

                    {plantChartMetric === 'status' && (
                      <>
                        <Bar yAxisId="left" dataKey="approved" stackId="st" name="Approved" fill="#10b981" cursor="pointer" onClick={(d) => handlePlantBarClick(d)} />
                        <Bar yAxisId="left" dataKey="goodPoint" stackId="st" name="Good Point" fill="#0ea5e9" cursor="pointer" onClick={(d) => handlePlantBarClick(d)} />
                        <Bar yAxisId="left" dataKey="pending" stackId="st" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(d) => handlePlantBarClick(d)}>
                          <LabelList dataKey="count" position="top" style={{ fill: darkTheme ? '#fff' : '#0f172a', fontSize: 10, fontWeight: 900 }} />
                        </Bar>
                      </>
                    )}

                    {plantChartMetric === 'savings' && (
                      <Bar
                        yAxisId="right"
                        dataKey="savings"
                        name="Cost Saved (₹)"
                        fill="#a3e635"
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                        onClick={(data) => handlePlantBarClick(data)}
                      >
                        <LabelList
                          dataKey="savingsLakhs"
                          position="top"
                          formatter={(v: any) => `₹${v}L`}
                          style={{ fill: darkTheme ? '#a3e635' : '#15803d', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
                        />
                      </Bar>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PowerBiVisualCard>

            {/* Visual E (5 Cols): Month-on-Month / Quarterly / YoY Time Drill-Down Chart */}
            <PowerBiVisualCard
              className="lg:col-span-5"
              darkTheme={darkTheme}
              title={
                timeDrillLevel === 0 ? 'Time Drill: Multi-Year YoY Volume' :
                timeDrillLevel === 1 ? 'Time Drill: Quarterly Submissions' :
                'Month-on-Month Submission Volume & ROI'
              }
              subtitle="Time Drill-Up / Drill-Down: Year ↔ Quarter ↔ Month"
              badge={`TIME L${timeDrillLevel + 1}/3`}
              accentColor="emerald"
              drillLevel={timeDrillLevel}
              maxDrillLevel={2}
              drillBreadcrumbs={timeBreadcrumbs}
              onDrillUp={handleTimeDrillUp}
              onDrillToLevel={(lvl) => {
                setDrillQuarter(null);
                setTimeDrillLevel(lvl);
              }}
              onExpandNextLevel={() => setTimeDrillLevel(prev => Math.min(2, prev + 1))}
              drillModeActive={timeDrillMode}
              onToggleDrillMode={() => setTimeDrillMode(prev => !prev)}
              insightText="Click any month point or bar to cross-filter the entire workbook by period."
              insightHighlight={periodSlicer === 'ALL' ? 'All Months' : periodSlicer}
            >
              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeHierarchyData} margin={{ top: 20, right: 14, left: -14, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, fill: darkTheme ? '#e2e8f0' : '#1e293b' }}
                    />
                    <YAxis
                      yAxisId="left"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: darkTheme ? '#94a3b8' : '#64748b' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#38bdf8' }}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) =>
                        name.includes('ROI') ? [formatIndianRupees(Number(val)), name] : [val, name]
                      }
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      name="Submissions"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(d) => handleTimeBarClick(d)}
                    >
                      <LabelList
                        dataKey="count"
                        position="top"
                        style={{ fill: darkTheme ? '#ffffff' : '#0f172a', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}
                      />
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulativeSavings"
                      name="Cumulative ROI"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 1.5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PowerBiVisualCard>
          </div>
        )}

        {/* ===================================================================
            7. POWER-BI MULTI-DONUT & STATUS SUMMARY ROW (MATCHING IMAGE 3)
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'yoy_roi') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Donut 1: TYPE - IDEA / GOOD POINT OR KAIZEN */}
            <PowerBiVisualCard
              darkTheme={darkTheme}
              title="Type — Good Point vs Kaizen"
              subtitle="Click slice to filter by classification"
              badge="TYPE SPLIT"
              accentColor="amber"
              insightText="Kaizens vs Quick-Win Good Points ratio."
              insightHighlight={`${totalCount} Total`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="h-40 w-40 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Kaizen', value: Math.max(kaizenOnlyCount, 1), color: '#38bdf8' },
                          { name: 'Good Point', value: goodPointList.length, color: '#f97316' }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={60}
                        paddingAngle={3}
                        onClick={(e) => setClassificationSlicer(prev => (prev === e.name ? 'ALL' : e.name))}
                        className="cursor-pointer"
                      >
                        <Cell fill="#38bdf8" />
                        <Cell fill="#f97316" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
                    <span className="text-base font-black">{totalCount}</span>
                    <span className="text-[9px] opacity-70">100%</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setClassificationSlicer(prev => (prev === 'Kaizen' ? 'ALL' : 'Kaizen'))}
                    className={`w-full p-2 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                      classificationSlicer === 'Kaizen'
                        ? 'bg-sky-500 text-slate-950 font-black border-sky-400'
                        : darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
                      <span>Kaizen</span>
                    </span>
                    <span className="font-black tabular-nums">{kaizenOnlyCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassificationSlicer(prev => (prev === 'Good Point' ? 'ALL' : 'Good Point'))}
                    className={`w-full p-2 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                      classificationSlicer === 'Good Point'
                        ? 'bg-orange-500 text-slate-950 font-black border-orange-400'
                        : darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 inline-block" />
                      <span>Good Pt</span>
                    </span>
                    <span className="font-black tabular-nums">{goodPointList.length}</span>
                  </button>
                </div>
              </div>
            </PowerBiVisualCard>

            {/* Donut 2: MINIFACTORY VOLUME SHARE */}
            <PowerBiVisualCard
              darkTheme={darkTheme}
              title="Minifactory Volume Share"
              subtitle="Click any slice or dept to cross-filter"
              badge="DEPT VOLUME"
              accentColor="indigo"
              insightText="Distribution of logged sheets across plant zones."
              insightHighlight={`${deptDistribution.length} Depts`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-40 w-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptDistribution}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={2}
                        onClick={(e) => setDeptSlicer(prev => (prev === e.name ? 'ALL' : e.name))}
                        className="cursor-pointer"
                      >
                        {deptDistribution.map(d => (
                          <Cell key={d.name} fill={d.color} opacity={deptSlicer !== 'ALL' && deptSlicer !== d.name ? 0.25 : 1} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 flex-1 font-mono text-[11px] max-h-40 overflow-y-auto pr-1">
                  {deptDistribution.map(d => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setDeptSlicer(prev => (prev === d.name ? 'ALL' : d.name))}
                      className={`w-full px-2 py-1 rounded flex items-center justify-between transition cursor-pointer ${
                        deptSlicer === d.name
                          ? 'bg-sky-500 text-slate-950 font-black'
                          : darkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate font-bold">{d.name}</span>
                      </span>
                      <span className="font-black tabular-nums ml-1">{d.count} ({d.volPct}%)</span>
                    </button>
                  ))}
                </div>
              </div>
            </PowerBiVisualCard>

            {/* Donut 3: COST SAVING / AVOIDANCE SHARE IN INR */}
            <PowerBiVisualCard
              darkTheme={darkTheme}
              title="Cost Saving Share in INR"
              subtitle="Financial ROI contribution by Minifactory"
              badge="₹ ROI SHARE"
              accentColor="emerald"
              insightText="Click any department row to isolate its high-ROI sheets."
              insightHighlight={formatIndianRupeesCompact(totalSavings)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-40 w-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptDistribution.filter(d => d.savings > 0)}
                        dataKey="savings"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={2}
                        onClick={(e) => setDeptSlicer(prev => (prev === e.name ? 'ALL' : e.name))}
                        className="cursor-pointer"
                      >
                        {deptDistribution.filter(d => d.savings > 0).map(d => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatIndianRupees(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 flex-1 font-mono text-[11px] max-h-40 overflow-y-auto pr-1">
                  {deptDistribution.map(d => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setDeptSlicer(prev => (prev === d.name ? 'ALL' : d.name))}
                      className={`w-full px-2 py-1 rounded flex items-center justify-between transition cursor-pointer ${
                        deptSlicer === d.name
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : darkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate font-bold">{d.name}</span>
                      </span>
                      <span className="font-black text-lime-400 tabular-nums ml-1">
                        {formatIndianRupeesCompact(d.savings)} ({d.savPct}%)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </PowerBiVisualCard>
          </div>
        )}

        {/* ===================================================================
            8. EMPLOYEE-WISE NUMBER OF KAIZENS RANKED BAR CHART & LEADERBOARD
               (With Stacked Bars, Podium View & Matrix Table Switcher!)
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'toppers') && (
          <PowerBiVisualCard
            darkTheme={darkTheme}
            title="Employee-Wise Number of Kaizen Graphs & Toppers Leaderboard"
            subtitle="Click any employee row to expand their Kaizen sheets or cross-filter the entire PowerBI workbook"
            badge={`${employeeAnalytics.length} ACTIVE CONTRIBUTORS`}
            accentColor="amber"
            headerRight={
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className={`flex rounded-lg p-0.5 border text-[10px] font-mono font-bold ${
                  darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {(['total', 'savings', 'approved'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEmpSortBy(s)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        empSortBy === s ? 'bg-amber-400 text-slate-950 font-black' : 'opacity-75'
                      }`}
                    >
                      {s === 'total' ? 'By Count' : s === 'savings' ? 'By ₹ ROI' : 'By Appr'}
                    </button>
                  ))}
                </div>

                <div className={`flex rounded-lg p-0.5 border text-[10px] font-mono font-bold ${
                  darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {(['bars', 'table'] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEmpViewMode(v)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        empViewMode === v ? 'bg-sky-500 text-slate-950 font-black' : 'opacity-75'
                      }`}
                    >
                      {v === 'bars' ? 'Stacked Bars' : 'Matrix Table'}
                    </button>
                  ))}
                </div>
              </div>
            }
            insightText="Top 3 Medalists are highlighted in Gold, Silver, and Bronze. Click any employee bar to drill into their sheets."
            insightHighlight={formatIndianRupeesCompact(totalSavings)}
          >
            {empViewMode === 'bars' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {employeeAnalytics.map((emp, idx) => {
                  const maxCount = Math.max(...employeeAnalytics.map(e => e.total), 1);
                  const apprPct = (emp.approved / maxCount) * 100;
                  const goodPct = (emp.goodPoint / maxCount) * 100;
                  const pendPct = (emp.pending / maxCount) * 100;
                  const isExpanded = expandedEmpName === emp.cleanName;

                  return (
                    <div
                      key={emp.cleanName}
                      onClick={() => setExpandedEmpName(isExpanded ? null : emp.cleanName)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isExpanded
                          ? 'border-amber-400 ring-1 ring-amber-400'
                          : darkTheme
                          ? 'bg-[#091526] hover:bg-slate-800/70 border-slate-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-slate-950' :
                            idx === 1 ? 'bg-slate-300 text-slate-950' :
                            idx === 2 ? 'bg-orange-400 text-slate-950' :
                            darkTheme ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-black truncate block">{emp.cleanName}</span>
                            <span className="text-[10px] font-mono opacity-70 block truncate">
                              {emp.role} • {emp.dept}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0 tabular-nums">
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-black">
                            {emp.total} Kaizens
                          </span>
                          {emp.savings > 0 && (
                            <span className="px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30 font-black">
                              +{formatIndianRupeesCompact(emp.savings)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Horizontal Stacked Progress Bar */}
                      <div className={`w-full h-3 rounded-full overflow-hidden flex ${darkTheme ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        {apprPct > 0 && (
                          <div className="bg-emerald-500 h-full" style={{ width: `${apprPct}%` }} title={`${emp.approved} Approved`} />
                        )}
                        {goodPct > 0 && (
                          <div className="bg-sky-400 h-full" style={{ width: `${goodPct}%` }} title={`${emp.goodPoint} Good Point`} />
                        )}
                        {pendPct > 0 && (
                          <div className="bg-amber-400 h-full" style={{ width: `${pendPct}%` }} title={`${emp.pending} Pending`} />
                        )}
                      </div>

                      {/* Expanded Drill-Down Sheets */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-amber-400 font-bold uppercase">
                              Submitted Sheets by {emp.cleanName}:
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCrossEmployee(prev => (prev === emp.cleanName ? null : emp.cleanName));
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black cursor-pointer"
                            >
                              {crossEmployee === emp.cleanName ? 'Clear Filter' : 'Filter Workbook by Employee'}
                            </button>
                          </div>
                          {emp.kaizens.map(k => (
                            <div
                              key={k.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectKaizen(k);
                              }}
                              className={`p-2 rounded-lg border flex items-center justify-between hover:border-sky-400 transition ${
                                darkTheme ? 'bg-[#060e1a] border-slate-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <span className="truncate pr-2 font-bold">{k.srNo}: {k.title}</span>
                              <span className="text-lime-400 font-black shrink-0 tabular-nums">
                                {formatIndianRupeesCompact(k.costSave)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className={darkTheme ? 'bg-[#07111e] text-slate-300 border-b border-slate-800' : 'bg-slate-100 text-slate-700 border-b border-slate-200'}>
                    <tr>
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">Employee Name</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Minifactory</th>
                      <th className="p-2.5 text-center">Total</th>
                      <th className="p-2.5 text-center">Approved</th>
                      <th className="p-2.5 text-center">Pending</th>
                      <th className="p-2.5 text-right">Validated Cost Saved (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {employeeAnalytics.map((emp, idx) => (
                      <tr
                        key={emp.cleanName}
                        onClick={() => setCrossEmployee(prev => (prev === emp.cleanName ? null : emp.cleanName))}
                        className="hover:bg-sky-500/10 cursor-pointer transition"
                      >
                        <td className="p-2.5 font-black text-amber-400">#{idx + 1}</td>
                        <td className="p-2.5 font-bold">{emp.cleanName}</td>
                        <td className="p-2.5 opacity-75">{emp.role}</td>
                        <td className="p-2.5 text-sky-400 font-bold">{emp.dept}</td>
                        <td className="p-2.5 text-center font-black tabular-nums">{emp.total}</td>
                        <td className="p-2.5 text-center text-emerald-400 font-bold tabular-nums">{emp.approved + emp.goodPoint}</td>
                        <td className="p-2.5 text-center text-amber-400 font-bold tabular-nums">{emp.pending}</td>
                        <td className="p-2.5 text-right font-black text-lime-400 tabular-nums">{formatIndianRupees(emp.savings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PowerBiVisualCard>
        )}

        {/* ===================================================================
            9. DECOMPOSITION TREE, 80/20 PARETO & TABLEAU CONDITIONAL MATRIX
        =================================================================== */}
        {(reportPage === 'all' || reportPage === 'hierarchy' || reportPage === 'matrix') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Decomposition Tree (6 Cols) */}
            <PowerBiVisualCard
              className="lg:col-span-6"
              darkTheme={darkTheme}
              title="PowerBI Interactive Decomposition Tree"
              subtitle="Root Plant Total → Minifactory → Production Line → Individual Kaizen Sheet"
              badge="DECOMPOSITION TREE"
              accentColor="indigo"
              headerRight={
                <div className={`flex rounded-lg p-0.5 border text-[10px] font-mono font-bold ${
                  darkTheme ? 'bg-[#07111e] border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setDecompMetric('savings')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${decompMetric === 'savings' ? 'bg-indigo-500 text-white font-black' : 'opacity-70'}`}
                  >
                    ₹ ROI
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecompMetric('count')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${decompMetric === 'count' ? 'bg-indigo-500 text-white font-black' : 'opacity-70'}`}
                  >
                    Volume
                  </button>
                </div>
              }
              insightText="Click any Minifactory branch to expand its Lines, then click a Kaizen leaf to inspect."
              insightHighlight={formatIndianRupeesCompact(totalSavings)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                {/* Col 1: Minifactory */}
                <div className={`p-2 rounded-xl border space-y-1.5 ${darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9px] font-black uppercase text-sky-400 block border-b border-slate-700/50 pb-1">
                    1. Minifactory
                  </span>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                    {decompTreeData.depts.map(d => {
                      const active = decompTreeData.activeDept === d.name;
                      const pct = decompMetric === 'savings' ? d.savPct : d.volPct;
                      return (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => {
                            setDecompSelectedDept(d.name);
                            setDecompSelectedArea(null);
                          }}
                          className={`w-full text-left p-2 rounded-lg border transition cursor-pointer ${
                            active
                              ? 'bg-sky-500 text-slate-950 font-black border-sky-400'
                              : darkTheme ? 'bg-[#0f1f35] border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="truncate">{d.name}</span>
                            <span className="tabular-nums">{pct}%</span>
                          </div>
                          <div className="text-[10px] opacity-80 tabular-nums">
                            {decompMetric === 'savings' ? formatIndianRupeesCompact(d.savings) : `${d.count} shts`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Col 2: Line / Area */}
                <div className={`p-2 rounded-xl border space-y-1.5 ${darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9px] font-black uppercase text-emerald-400 block border-b border-slate-700/50 pb-1 truncate">
                    2. Line ({decompTreeData.activeDept || 'All'})
                  </span>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                    {decompTreeData.areas.map(a => {
                      const active = decompTreeData.activeArea === a.name;
                      return (
                        <button
                          key={a.name}
                          type="button"
                          onClick={() => setDecompSelectedArea(a.name)}
                          className={`w-full text-left p-2 rounded-lg border transition cursor-pointer ${
                            active
                              ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                              : darkTheme ? 'bg-[#0f1f35] border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-bold truncate">{a.name}</div>
                          <div className="flex justify-between text-[10px] opacity-80 tabular-nums">
                            <span>{a.count} shts</span>
                            <span>{formatIndianRupeesCompact(a.savings)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Col 3: Kaizen Leaf */}
                <div className={`p-2 rounded-xl border space-y-1.5 ${darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9px] font-black uppercase text-amber-400 block border-b border-slate-700/50 pb-1">
                    3. Kaizen Sheet
                  </span>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                    {decompTreeData.leafKaizens.map(k => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => onSelectKaizen(k)}
                        className={`w-full text-left p-2 rounded-lg border transition cursor-pointer ${
                          darkTheme ? 'bg-[#0f1f35] hover:border-amber-400 border-slate-800' : 'bg-white hover:border-amber-500 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-sky-400">{k.srNo}</span>
                          <span className="text-lime-400 tabular-nums">{formatIndianRupeesCompact(k.costSave)}</span>
                        </div>
                        <div className="text-[11px] font-sans font-bold line-clamp-2 mt-0.5">{k.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PowerBiVisualCard>

            {/* Tableau / PowerBI Conditional-Formatted Cross-Tab Matrix with Grand Totals (6 Cols) */}
            <PowerBiVisualCard
              className="lg:col-span-6"
              darkTheme={darkTheme}
              title="Tableau / PowerBI Dept × PQCDSM Matrix & Grand Totals"
              subtitle="Conditional heatmap cells with in-cell ROI data bars & click-to-filter"
              badge="CROSS-TAB MATRIX"
              accentColor="violet"
              insightText="Click any cell to slice by both Minifactory and PQCDSM benefit pillar."
              insightHighlight={`${totalCount} Total Hits`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase ${darkTheme ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-2 text-left font-black">Minifactory</th>
                      {PQCDSM_META.map(m => (
                        <th key={m.key} className="py-2 text-center font-black">{m.code}</th>
                      ))}
                      <th className="py-2 text-center font-black">Total</th>
                      <th className="py-2 text-right font-black">ROI Data Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {deptPqcdsmMatrix.map(row => {
                      const maxSavings = Math.max(...deptPqcdsmMatrix.map(r => r.savings), 1);
                      const barWidth = Math.round((row.savings / maxSavings) * 100);
                      return (
                        <tr key={row.dept}>
                          <td className="py-2 pr-2 font-black whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDeptSlicer(prev => (prev === row.dept ? 'ALL' : row.dept))}
                              className="hover:text-sky-400 cursor-pointer"
                            >
                              {row.dept}
                            </button>
                          </td>
                          {PQCDSM_META.map(m => {
                            const val = row.cells[m.key];
                            const selected = deptSlicer === row.dept && pillarSlicer === m.key;
                            const cellBg =
                              val === 0
                                ? darkTheme ? 'bg-slate-900/50 text-slate-600' : 'bg-slate-50 text-slate-300'
                                : val === 1
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : val === 2
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                : 'bg-emerald-500 text-slate-950 font-black';
                            return (
                              <td key={m.key} className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selected) {
                                      setDeptSlicer('ALL');
                                      setPillarSlicer('ALL');
                                    } else {
                                      setDeptSlicer(row.dept);
                                      setPillarSlicer(m.key);
                                    }
                                  }}
                                  className={`w-6 h-6 rounded text-[11px] font-bold tabular-nums cursor-pointer transition ${cellBg} ${
                                    selected ? 'ring-2 ring-amber-400' : ''
                                  }`}
                                >
                                  {val}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-2 text-center font-black tabular-nums">{row.total}</td>
                          <td className="py-2 pl-2 text-right w-32">
                            <div className="relative h-5 rounded bg-slate-800/50 overflow-hidden flex items-center justify-end px-1.5">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-lime-500/30"
                                style={{ width: `${barWidth}%` }}
                              />
                              <span className="relative z-10 text-[10px] font-black text-lime-400 tabular-nums">
                                {formatIndianRupeesCompact(row.savings)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className={`border-t-2 font-black text-[11px] ${darkTheme ? 'border-slate-700 bg-[#091526]' : 'border-slate-300 bg-slate-100'}`}>
                      <td className="py-2 text-amber-400">GRAND TOTAL</td>
                      {PQCDSM_META.map(m => {
                        const colSum = deptPqcdsmMatrix.reduce((s, r) => s + r.cells[m.key], 0);
                        return (
                          <td key={m.key} className="py-2 text-center tabular-nums text-sky-400">{colSum}</td>
                        );
                      })}
                      <td className="py-2 text-center tabular-nums">{totalCount}</td>
                      <td className="py-2 pr-1.5 text-right text-lime-400 tabular-nums">{formatIndianRupeesCompact(totalSavings)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </PowerBiVisualCard>
          </div>
        )}

        {/* ===================================================================
            10. POWER-BI DRILL-THROUGH MASTER REGISTER (BOTTOM DATA GRID)
        =================================================================== */}
        <div className={`rounded-xl border overflow-hidden ${tileBg}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${darkTheme ? 'bg-[#091526] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-sky-500 text-slate-950">
                DRILL-THROUGH TABLE
              </span>
              <h3 className="text-xs font-black uppercase font-mono">
                Filtered Kaizen Sheets ({filteredKaizens.length} Records) — Click Any Row to Inspect Sheet
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('list')}
              className="text-[11px] font-mono font-bold text-sky-400 hover:underline cursor-pointer"
            >
              Open Full Master Register →
            </button>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className={`sticky top-0 text-[10px] uppercase border-b ${darkTheme ? 'bg-[#07111e] text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                <tr>
                  <th className="p-2.5">Sr. No</th>
                  <th className="p-2.5">Month</th>
                  <th className="p-2.5">Kaizen Title</th>
                  <th className="p-2.5">Minifactory / Area</th>
                  <th className="p-2.5">Originator</th>
                  <th className="p-2.5 text-center">PQCDSM</th>
                  <th className="p-2.5 text-right">Annual ROI (₹)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredKaizens.map(k => (
                  <tr
                    key={k.id}
                    onClick={() => onSelectKaizen(k)}
                    className="hover:bg-sky-500/10 cursor-pointer transition"
                  >
                    <td className="p-2.5 font-black text-sky-400 whitespace-nowrap">{k.srNo}</td>
                    <td className="p-2.5 whitespace-nowrap">{k.month}</td>
                    <td className="p-2.5 font-sans font-bold max-w-xs truncate">{k.title}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="font-bold">{k.minifactory}</span> • <span className="opacity-75">{k.area}</span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">{k.ideaBy}</td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <div className="inline-flex gap-0.5">
                        {PQCDSM_META.map(m =>
                          k.benefits?.[m.key] ? (
                            <span
                              key={m.key}
                              className="w-4 h-4 rounded text-[9px] font-black text-white flex items-center justify-center"
                              style={{ backgroundColor: m.color }}
                            >
                              {m.code}
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-black text-lime-400 tabular-nums whitespace-nowrap">
                      {k.costSave > 0 ? formatIndianRupees(k.costSave) : '—'}
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        k.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : k.status === 'Good Point'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
