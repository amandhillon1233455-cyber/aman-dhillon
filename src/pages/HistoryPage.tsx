import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { Activity as ActivityType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const HistoryPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const { error: toastError } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.activity.getAll({ search, page, limit: 15 });
      setActivities(res.activities);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err: any) {
      toastError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>System Activity & Audit Log</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {totalRecords} Events
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable timeline of print jobs, hardware diagnostics, error occurrences, and operator actions
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity by keyword, user, or action..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No system activity matches your search filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {activities.map(act => {
              const isError = act.action.toLowerCase().includes('error') || act.action.toLowerCase().includes('fail');
              const isJob = act.action.toLowerCase().includes('job');
              const isAI = act.action.toLowerCase().includes('ai');

              return (
                <div key={act._id} className="py-4 flex items-start gap-3.5 hover:bg-slate-800/30 transition-colors px-2 rounded-xl">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isError
                        ? 'bg-rose-500/20 text-rose-400'
                        : isAI
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : isJob
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isError ? (
                      <Activity className="w-4 h-4" />
                    ) : isAI ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs tracking-tight">{act.action}</span>
                        <span className="text-[11px] text-slate-400">by {act.userName || 'System Operator'}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {new Date(act.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
