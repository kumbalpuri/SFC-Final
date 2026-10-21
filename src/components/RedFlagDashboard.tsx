import React, { useState, useMemo } from 'react';
import { RedFlag } from '../types';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Filter, 
  Layers, 
  Building, 
  Calendar, 
  UserCheck, 
  RotateCcw, 
  ArrowUpRight,
  Flame,
  Activity,
  Zap,
  Target
} from 'lucide-react';

interface RedFlagDashboardProps {
  redFlags: RedFlag[];
  onSelectRedFlag?: (rf: RedFlag) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function RedFlagDashboard({ redFlags, onSelectRedFlag, onNavigateToTab }: RedFlagDashboardProps) {
  // Multi-Combination Filters
  const [plantFilter, setPlantFilter] = useState('ALL');
  const [originatorDeptFilter, setOriginatorDeptFilter] = useState('ALL');
  const [targetDeptFilter, setTargetDeptFilter] = useState('ALL');
  const [category5MFilter, setCategory5MFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeHorizon, setTimeHorizon] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'matrix' | 'sustenance' | 'pareto'>('all');

  // Filter computation
  const filteredFlags = useMemo(() => {
    return redFlags.filter(rf => {
      if (plantFilter !== 'ALL' && rf.mfName !== plantFilter) return false;
      if (originatorDeptFilter !== 'ALL' && rf.raisedByDepartment !== originatorDeptFilter) return false;
      if (targetDeptFilter !== 'ALL' && rf.targetDepartment !== targetDeptFilter) return false;
      if (category5MFilter !== 'ALL' && rf.category5M !== category5MFilter) return false;
      if (severityFilter !== 'ALL' && !rf.severity?.includes(severityFilter)) return false;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Open' && rf.status !== 'Open') return false;
        if (statusFilter === 'Contained' && rf.status !== 'Contained') return false;
        if (statusFilter === 'Sustenance' && !rf.sustenanceStartDate) return false;
        if (statusFilter === 'Closed' && rf.status !== 'Closed') return false;
      }
      return true;
    });
  }, [redFlags, plantFilter, originatorDeptFilter, targetDeptFilter, category5MFilter, severityFilter, statusFilter, timeHorizon]);

  // Key KPI Metrics
  const totalCount = filteredFlags.length;
  const openCount = filteredFlags.filter(r => r.status === 'Open').length;
  const containedCount = filteredFlags.filter(r => r.status === 'Contained').length;
  const inSustenanceCount = filteredFlags.filter(r => (r.status === 'Under-Sustenance' || (r.sustenanceStartDate && r.status !== 'Closed'))).length;
  const closedCount = filteredFlags.filter(r => r.status === 'Closed' || r.sustenanceAchieved).length;
  const criticalCount = filteredFlags.filter(r => r.severity?.includes('Critical')).length;
  const totalQuarantinedWIP = filteredFlags.reduce((sum, r) => sum + (r.suspectQtyQuarantined || 0), 0);
  
  // Containment efficiency (<2 hours standard)
  const containmentRate = totalCount > 0 
    ? Math.round(((totalCount - openCount) / totalCount) * 100) 
    : 100;

  // 3-Month Sustenance compliance rate
  const itemsWithSustenance = filteredFlags.filter(r => r.sustenanceStartDate);
  const sustainedSuccessCount = itemsWithSustenance.filter(r => r.month3Check?.status === 'Pass' || r.sustenanceAchieved).length;
  const sustenancePassRate = itemsWithSustenance.length > 0 
    ? Math.round((sustainedSuccessCount / itemsWithSustenance.length) * 100) 
    : 100;

  // 5M Distribution
  const counts5M = useMemo(() => {
    const counts: Record<string, number> = { Method: 0, Machine: 0, Material: 0, Man: 0, Measurement: 0 };
    filteredFlags.forEach(r => {
      const cat = r.category5M || 'Method';
      if (counts[cat] !== undefined) counts[cat]++;
      else counts.Method++;
    });
    return counts;
  }, [filteredFlags]);

  // Originator vs Target Cross Matrix
  const departments = ['Production', 'Quality', 'Maintenance', 'Tooling & Die', 'Safety & EHS', 'Logistics & Stores'];
  const crossMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    departments.forEach(orig => {
      matrix[orig] = {};
      departments.forEach(tgt => {
        matrix[orig][tgt] = 0;
      });
    });

    filteredFlags.forEach(rf => {
      const orig = departments.find(d => rf.raisedByDepartment?.includes(d)) || 'Production';
      const tgt = departments.find(d => rf.targetDepartment?.includes(d)) || 'Production';
      if (matrix[orig] && matrix[orig][tgt] !== undefined) {
        matrix[orig][tgt]++;
      }
    });
    return matrix;
  }, [filteredFlags]);

  // Sustenance Funnel Breakdown
  const m1Checked = filteredFlags.filter(r => r.month1Check && r.month1Check.status !== 'Pending').length;
  const m1Passed = filteredFlags.filter(r => r.month1Check?.status === 'Pass').length;
  const m2Checked = filteredFlags.filter(r => r.month2Check && r.month2Check.status !== 'Pending').length;
  const m2Passed = filteredFlags.filter(r => r.month2Check?.status === 'Pass').length;
  const m3Checked = filteredFlags.filter(r => r.month3Check && r.month3Check.status !== 'Pending').length;
  const m3Passed = filteredFlags.filter(r => r.month3Check?.status === 'Pass').length;

  // Reset all filters
  const resetFilters = () => {
    setPlantFilter('ALL');
    setOriginatorDeptFilter('ALL');
    setTargetDeptFilter('ALL');
    setCategory5MFilter('ALL');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setTimeHorizon('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Multi-Combination Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono">
              Multi-Dimensional Dashboard Matrix Filters
            </span>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              {filteredFlags.length} of {redFlags.length} Records
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            {/* View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                onClick={() => setViewMode('all')}
                className={`px-2 py-1 rounded transition cursor-pointer ${viewMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Comprehensive
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-2 py-1 rounded transition cursor-pointer ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Originator Matrix
              </button>
              <button
                onClick={() => setViewMode('sustenance')}
                className={`px-2 py-1 rounded transition cursor-pointer ${viewMode === 'sustenance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                3M Sustenance
              </button>
              <button
                onClick={() => setViewMode('pareto')}
                className={`px-2 py-1 rounded transition cursor-pointer ${viewMode === 'pareto' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                5M Pareto
              </button>
            </div>
          </div>
        </div>

        {/* 7-Way Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Plant */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Plant / MF
            </label>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All Plants (MF1-3)</option>
              <option value="MF1">MF1 (Assembly)</option>
              <option value="MF2">MF2 (Machining)</option>
              <option value="MF3">MF3 (Moulding)</option>
            </select>
          </div>

          {/* Originator Dept */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Raised By (Originator)
            </label>
            <select
              value={originatorDeptFilter}
              onChange={(e) => setOriginatorDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All Raiser Depts</option>
              <option value="Production">Production</option>
              <option value="Quality">Quality / QA</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Safety & EHS">Safety &amp; EHS</option>
              <option value="Tooling & Die">Tooling &amp; Die</option>
              <option value="Logistics & Stores">Logistics &amp; Stores</option>
            </select>
          </div>

          {/* Target Dept */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Raised On (Target)
            </label>
            <select
              value={targetDeptFilter}
              onChange={(e) => setTargetDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All Target Depts</option>
              <option value="Production">Production</option>
              <option value="Quality">Quality / QA</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Tooling & Die">Tooling &amp; Die</option>
              <option value="Logistics & Stores">Logistics &amp; Stores</option>
              <option value="Supplier / Inward">Supplier / Inward</option>
            </select>
          </div>

          {/* 5M Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              5M Category
            </label>
            <select
              value={category5MFilter}
              onChange={(e) => setCategory5MFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All 5M Categories</option>
              <option value="Method">Method</option>
              <option value="Machine">Machine</option>
              <option value="Material">Material</option>
              <option value="Man">Man</option>
              <option value="Measurement">Measurement</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Severity Level
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical (Line Stop)</option>
              <option value="Major">Major (Quarantine)</option>
              <option value="Minor">Minor (Observation)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lifecycle Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open (Pending Containment)</option>
              <option value="Contained">Contained (RCA in progress)</option>
              <option value="Sustenance">Under 3M Sustenance</option>
              <option value="Closed">Closed (3M Verified)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Top 6 KPI High-Contrast Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Flags */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Total Flags</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black font-mono text-slate-900">{totalCount}</span>
            <span className="text-[10px] font-bold text-slate-500">100%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Logged Shopfloor</span>
        </div>

        {/* Active Open (<2h Containment) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-rose-500 uppercase font-mono tracking-wider">Active Open</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className={`text-2xl font-black font-mono ${openCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
              {openCount}
            </span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">&lt;2h SLA</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Containment Pending</span>
        </div>

        {/* Quarantined Pieces */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-amber-500 uppercase font-mono tracking-wider">Quarantined WIP</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black font-mono text-amber-700">{totalQuarantinedWIP}</span>
            <span className="text-[10px] font-bold text-slate-400">Pcs</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Suspect WIP Held</span>
        </div>

        {/* Under 3M Sustenance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-indigo-500 uppercase font-mono tracking-wider">In Sustenance</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black font-mono text-indigo-700">{inSustenanceCount}</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">90d Watch</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Kept OPEN for 3M</span>
        </div>

        {/* Sustenance Achieved */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-emerald-500 uppercase font-mono tracking-wider">Closed (3M Done)</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black font-mono text-emerald-700">{closedCount}</span>
            <span className="text-[10px] font-bold text-emerald-700 font-mono">{sustenancePassRate}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">QA Custodian Signed</span>
        </div>

        {/* Containment Efficiency */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Containment %</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{containmentRate}%</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">&lt;2h MTTR</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">IATF 16949 Compliant</span>
        </div>

      </div>

      {/* Analytical Views Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VIEW 1: 5M Root Cause Pareto Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono">
                5M Defect Root Cause Distribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Total: {totalCount}</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(counts5M).map(([category, count]) => {
              const countNum = Number(count) || 0;
              const pct = totalCount > 0 ? Math.round((countNum / totalCount) * 100) : 0;
              const colorClass = 
                category === 'Method' ? 'bg-indigo-600' :
                category === 'Machine' ? 'bg-rose-500' :
                category === 'Material' ? 'bg-amber-500' :
                category === 'Man' ? 'bg-blue-500' : 'bg-emerald-500';

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{category} ({category === 'Method' ? 'Process/SOP' : category === 'Machine' ? 'Tool/Press' : category === 'Material' ? 'Raw Stock' : category === 'Man' ? 'Operator' : 'Gauge/Cal'})</span>
                    <span className="font-mono text-slate-900">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
            <span>Primary Root Cause Domain:</span>
            <strong className="text-slate-900 font-mono">Method &amp; Machine (75% of shopfloor line stops)</strong>
          </div>
        </div>

        {/* VIEW 2: 3-Month Sustenance Progression Funnel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono">
                3-Month Sustenance Audit Progression (Point Kept Open)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              90-Day Milestone
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            
            {/* Month 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Month 1 (30 Days)</span>
              <div className="text-xl font-black font-mono text-slate-900">{m1Passed} / {m1Checked || 1}</div>
              <span className="text-[10px] font-bold text-emerald-600 block">
                {m1Checked > 0 ? Math.round((m1Passed / m1Checked) * 100) : 100}% Zero Recurrence
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">Shift Trials &amp; Audit</span>
            </div>

            {/* Month 2 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Month 2 (60 Days)</span>
              <div className="text-xl font-black font-mono text-slate-900">{m2Passed} / {m2Checked || 1}</div>
              <span className="text-[10px] font-bold text-indigo-600 block">
                {m2Checked > 0 ? Math.round((m2Passed / m2Checked) * 100) : 100}% Adherence
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">SOP &amp; OPL Gemba</span>
            </div>

            {/* Month 3 */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono block">Month 3 (90 Days)</span>
              <div className="text-xl font-black font-mono text-emerald-800">{m3Passed} / {m3Checked || 1}</div>
              <span className="text-[10px] font-bold text-emerald-700 block">
                {m3Checked > 0 ? Math.round((m3Passed / m3Checked) * 100) : 100}% Full Closure
              </span>
              <span className="text-[9px] text-emerald-600 block font-mono">QA Custodian Authorized</span>
            </div>

          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Sustenance Rule:</strong> No Red Flag can be closed until 90 continuous days pass without repeat occurrence.
              </span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('sustenance')}
                className="text-[10px] font-bold text-amber-800 underline uppercase tracking-wider shrink-0 ml-2 cursor-pointer"
              >
                Open Monitor &rarr;
              </button>
            )}
          </div>
        </div>

      </div>

      {/* VIEW 3: Originator vs Target Department Cross-Matrix Heatmap */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono">
              Cross-Department Red Flag Matrix (Who Raises On Whom - Anyone on Anyone)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Rows: Originator • Columns: Target Department
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[10px] uppercase">
                <th className="p-2.5 font-bold border-r border-slate-200">Originator \ Target</th>
                {departments.map(dept => (
                  <th key={dept} className="p-2.5 font-bold text-center border-r border-slate-200 last:border-r-0">
                    {dept.split(' ')[0]}
                  </th>
                ))}
                <th className="p-2.5 font-bold text-center bg-slate-200">Total Raised</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((origDept, idx) => {
                const rowTotal = departments.reduce((sum, tgt) => sum + (crossMatrix[origDept]?.[tgt] || 0), 0);
                return (
                  <tr key={origDept} className={`border-b border-slate-100 hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="p-2.5 font-bold text-slate-800 border-r border-slate-200 font-mono text-[11px]">
                      {origDept}
                    </td>
                    {departments.map(tgtDept => {
                      const count = crossMatrix[origDept]?.[tgtDept] || 0;
                      const hasCount = count > 0;
                      return (
                        <td 
                          key={tgtDept} 
                          className={`p-2.5 text-center font-mono font-bold border-r border-slate-200 last:border-r-0 ${
                            hasCount 
                              ? 'bg-rose-50 text-rose-700 font-black' 
                              : 'text-slate-300'
                          }`}
                        >
                          {count > 0 ? count : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center font-mono font-black text-slate-900 bg-slate-100/60">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>* Any shopfloor operator or department can flag defects on any supporting team to enforce zero defect escape.</span>
          <span className="font-mono font-bold text-slate-700">IATF 16949 Section 8.7 Non-conformance Custody</span>
        </div>
      </div>

    </div>
  );
}
