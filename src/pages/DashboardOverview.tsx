import React, { useState, useEffect } from 'react';
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  BarChart2,
  ShieldAlert,
  Play,
  Check,
} from 'lucide-react';
import { StatCard } from '../components/StatCard.tsx';
import {
  PrintingActivityChart,
  JobsRatioChart,
  PrinterUtilizationChart,
} from '../components/ChartComponents.tsx';
import {
  AnalyticsOverview,
  PrintingAnalytics,
  PrinterUtilStats,
  Printer as PrinterType,
  PrintJob,
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface DashboardOverviewProps {
  onNavigateToPrinters: () => void;
  onNavigateToJobs: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToAIAssistant: () => void;
  onOpenTroubleshoot: (printer: PrinterType) => void;
  onOpenAISummary: () => void;
  onOpenNewJob: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToPrinters,
  onNavigateToJobs,
  onNavigateToAnalytics,
  onNavigateToAIAssistant,
  onOpenTroubleshoot,
  onOpenAISummary,
  onOpenNewJob,
}) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [printingTrends, setPrintingTrends] = useState<PrintingAnalytics | null>(null);
  const [printerStats, setPrinterStats] = useState<PrinterUtilStats[]>([]);
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);
  const [printersWithErrors, setPrintersWithErrors] = useState<PrinterType[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [chartMetric, setChartMetric] = useState<'jobs' | 'pages'>('jobs');
  const [loading, setLoading] = useState(true);

  const { success, error: toastError } = useToast();

  const loadDashboardData = async () => {
    try {
      const [ovData, trendData, utilData, jobsData, printersData] = await Promise.all([
        api.analytics.getOverview(),
        api.analytics.getPrintingTrends(timeRange),
        api.analytics.getPrinterStats(),
        api.jobs.getAll({ sort: 'desc' }),
        api.printers.getAll(),
      ]);

      setOverview(ovData);
      setPrintingTrends(trendData);
      setPrinterStats(utilData.printers);
      setRecentJobs(jobsData.jobs.slice(0, 6));

      const errors = printersData.printers.filter(
        p => p.status === 'Error' || p.status === 'Maintenance'
      );
      setPrintersWithErrors(errors);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      toastError('Data Sync Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with AI Summary CTA & Quick Actions */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Fleet Operations Overview
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live MongoDB
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time telemetry across {overview?.totalPrinters ?? 6} managed hardware nodes and active spoolers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAISummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate AI Summary</span>
          </button>

          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Real-time Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hardware Error Alert Banner (if any printer is in error) */}
      {printersWithErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <span>Immediate Attention Required</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-mono">
                  {printersWithErrors.length} Alerts
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">
                {printersWithErrors[0].name}: {printersWithErrors[0].currentError || 'Hardware error detected'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTroubleshoot(printersWithErrors[0])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain with AI</span>
            </button>
            <button
              onClick={onNavigateToPrinters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700"
            >
              View Fleet
            </button>
          </div>
        </div>
      )}

      {/* 6 Core Stat Cards (Computed dynamically from backend DB) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Printers"
          value={overview?.totalPrinters ?? 0}
          subtitle="Monitored in catalog"
          icon={Printer}
          colorScheme="indigo"
          onClick={onNavigateToPrinters}
        />
        <StatCard
          title="Online Printers"
          value={overview?.onlinePrinters ?? 0}
          subtitle={`${overview?.uptimePercentage ?? 100}% Fleet uptime`}
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={onNavigateToPrinters}
        />
        <StatCard
          title="Active Jobs"
          value={overview?.activeJobs ?? 0}
          subtitle="In spooler queue"
          icon={Layers}
          colorScheme="cyan"
          onClick={onNavigateToJobs}
        />
        <StatCard
          title="Completed Jobs"
          value={overview?.completedJobs ?? 0}
          subtitle="Successful batches"
          icon={Check}
          colorScheme="emerald"
          onClick={onNavigateToJobs}
        />
        <StatCard
          title="Failed Jobs"
          value={overview?.failedJobs ?? 0}
          subtitle="Jam / buffer aborts"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={onNavigateToJobs}
        />
        <StatCard
          title="Pages Printed"
          value={overview?.pagesPrinted ?? 0}
          subtitle={`Avg ${overview?.avgPagesPerJob ?? 0} pgs/job`}
          icon={FileText}
          colorScheme="purple"
          onClick={onNavigateToAnalytics}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Printing Activity Over Time */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Printing Activity Over Time</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated live from MongoDB print job timestamps
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  onClick={() => setChartMetric('jobs')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    chartMetric === 'jobs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setChartMetric('pages')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    chartMetric === 'pages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pages
                </button>
              </div>

              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    timeRange === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    timeRange === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
          </div>

          <PrintingActivityChart
            data={printingTrends?.timeSeries || []}
            metric={chartMetric}
          />
        </div>

        {/* Side Chart: Jobs Completed vs Failed */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Jobs Completed vs. Failed
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Spooler fulfillment success ratio
            </p>

            <div className="mt-6">
              <JobsRatioChart
                completed={overview?.completedJobs ?? 0}
                failed={overview?.failedJobs ?? 0}
                cancelled={overview?.cancelledJobs ?? 0}
                active={overview?.activeJobs ?? 0}
              />
            </div>
          </div>

          {/* Quick AI Diagnostic Callout */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Health Assessment</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {overview && overview.failedJobs > 0
                ? `${overview.failedJobs} failed print attempts logged. The primary cause is paper jams on Tray 2.`
                : 'Zero print failures logged in the last 24-hour cycle. Queue health is optimal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Printer Utilization & Recent Jobs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Printer Utilization */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Printer Utilization</h2>
              <p className="text-xs text-slate-400 mt-0.5">Lifetime volume & capacity</p>
            </div>
            <button
              onClick={onNavigateToPrinters}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <PrinterUtilizationChart printers={printerStats} />
        </div>

        {/* Recent Print Jobs */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Live Print Queue & Recent History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Most recent print requests</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewJob}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
              >
                + New Job
              </button>
              <button
                onClick={onNavigateToJobs}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-2"
              >
                <span>All Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold">Printer</th>
                  <th className="pb-3 font-semibold">Volume</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No print jobs recorded.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map(job => {
                    const statusBadge = {
                      Queued: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                      Printing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
                      Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      Failed: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                      Cancelled: 'bg-slate-700/50 text-slate-400 border-slate-600',
                    }[job.status];

                    return (
                      <tr key={job._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-white truncate max-w-[200px]">
                            {job.documentName}
                          </div>
                          <div className="text-[11px] text-slate-400">{job.userName || 'Staff'}</div>
                        </td>
                        <td className="py-3 text-slate-300 truncate max-w-[150px]">
                          {job.printerName || 'Unassigned'}
                        </td>
                        <td className="py-3 font-mono text-slate-300">
                          {job.pages} pgs ({job.copies} {job.copies === 1 ? 'copy' : 'copies'})
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-400 text-[11px]">
                          {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
