import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Calendar,
  Sparkles,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/StatCard.tsx';
import {
  PrintingActivityChart,
  JobsRatioChart,
  PrinterUtilizationChart,
} from '../components/ChartComponents.tsx';
import { AnalyticsOverview, PrintingAnalytics, PrinterUtilStats } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<PrintingAnalytics | null>(null);
  const [printers, setPrinters] = useState<PrinterUtilStats[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [metric, setMetric] = useState<'jobs' | 'pages'>('jobs');
  const [loading, setLoading] = useState(true);

  const { error: toastError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, trendData, printerData] = await Promise.all([
        api.analytics.getOverview(),
        api.analytics.getPrintingTrends(timeRange),
        api.analytics.getPrinterStats(),
      ]);

      setOverview(ovData);
      setTrends(trendData);
      setPrinters(printerData.printers);
    } catch (err: any) {
      toastError('Analytics Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Fleet Analytics & Intelligence</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Calculated from MongoDB
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical aggregation of throughput, consumable consumption, and error rates
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 6 Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Print Jobs"
          value={overview ? overview.completedJobs + overview.failedJobs + overview.activeJobs : 0}
          subtitle="All-time submitted"
          icon={Layers}
          colorScheme="indigo"
        />
        <StatCard
          title="Completed Jobs"
          value={overview?.completedJobs ?? 0}
          subtitle="100% printed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Failed Jobs"
          value={overview?.failedJobs ?? 0}
          subtitle="Aborted or error"
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatCard
          title="Total Pages"
          value={overview?.pagesPrinted ?? 0}
          subtitle="Cumulative throughput"
          icon={FileText}
          colorScheme="cyan"
        />
        <StatCard
          title="Avg Pages / Job"
          value={overview?.avgPagesPerJob ?? 0}
          subtitle="Batch density"
          icon={TrendingUp}
          colorScheme="purple"
        />
        <StatCard
          title="Most Used Printer"
          value={overview?.mostUsedPrinter ? overview.mostUsedPrinter.split(' ')[0] : 'None'}
          subtitle={overview?.mostUsedPrinter || 'Fleet Device'}
          icon={Printer}
          colorScheme="amber"
        />
      </div>

      {/* Main Charts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Printing Activity Distribution</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily, weekly and monthly activity aggregated from job logs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  onClick={() => setMetric('jobs')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    metric === 'jobs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setMetric('pages')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    metric === 'pages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
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
                  7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    timeRange === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>

          <PrintingActivityChart data={trends?.timeSeries || []} metric={metric} />
        </div>

        {/* Success vs Failure */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Successful vs Failed Jobs</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fulfillment reliability score</p>
            </div>

            <JobsRatioChart
              completed={overview?.completedJobs ?? 0}
              failed={overview?.failedJobs ?? 0}
              cancelled={overview?.cancelledJobs ?? 0}
              active={overview?.activeJobs ?? 0}
            />
          </div>

          {/* Color vs Monochrome Ratio */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2.5">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Color vs Monochrome Output</span>
              <span className="text-[10px] text-indigo-400 font-mono">Ink Mode</span>
            </div>
            {trends?.colorDistribution.map(cd => (
              <div key={cd.name} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cd.name}</span>
                  <span className="font-mono">{cd.percentage}% ({cd.count} jobs)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.max(2, cd.percentage)}%` }}
                    className={`h-full rounded-full ${
                      cd.name === 'Color'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printer Usage Breakdown */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white">Printer Fleet Capacity & Volume</h2>
          <p className="text-xs text-slate-400 mt-0.5">Total lifetime pages and workload distribution across all hardware nodes</p>
        </div>

        <PrinterUtilizationChart printers={printers} />
      </div>
    </div>
  );
};
