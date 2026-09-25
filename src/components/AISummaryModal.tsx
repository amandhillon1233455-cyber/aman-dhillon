import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { SummaryResult } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { error: toastError, info } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    } else {
      setSummary(null);
      setCopied(false);
    }
  }, [isOpen]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.ai.generateSummary();
      setSummary(res.summary);
    } catch (err: any) {
      console.error('Summary generation error:', err);
      toastError('Summary Failed', err.message || 'Could not generate executive summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `PrintAI Fleet Operational Summary\nPeriod: ${summary.period}\n\nExecutive Overview:\n${summary.executiveSummary}\n\nMetrics:\n- Total Jobs: ${summary.totalJobs}\n- Completed: ${summary.completedJobs}\n- Failed: ${summary.failedJobs}\n- Pages Printed: ${summary.pagesPrinted}\n\nInsights:\n${summary.printerHealthInsights.map(i => `• ${i}`).join('\n')}\n\nActionable Recommendations:\n${summary.recommendations.map(r => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    info('Copied', 'Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-indigo-950/50 via-slate-900 to-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Fleet Executive Briefing</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated synthesis of recent jobs, hardware alerts, and throughput
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                Aggregating print queues and error telemetry...
              </p>
              <p className="text-xs text-slate-500">
                Generating executive insights via Gemini AI
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-center">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Jobs</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">{summary.totalJobs}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-center">
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase">Completed</div>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">{summary.completedJobs}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-center">
                  <div className="text-[11px] font-semibold text-rose-400 uppercase">Failed</div>
                  <div className="text-xl font-bold font-mono text-rose-300 mt-0.5">{summary.failedJobs}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-center">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase">Pages Printed</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">{summary.pagesPrinted.toLocaleString()}</div>
                </div>
              </div>

              {/* Executive Overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <FileCheck className="w-4 h-4" />
                  <span>Executive Overview</span>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 text-slate-200 text-sm leading-relaxed">
                  {summary.executiveSummary}
                </div>
              </div>

              {/* Fleet Health & Issues */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Fleet Health & Hardware Issues</span>
                </div>
                <div className="space-y-2">
                  {summary.printerHealthInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Optimizations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Lightbulb className="w-4 h-4" />
                  <span>Recommended Optimizations</span>
                </div>
                <div className="space-y-2">
                  {summary.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-cyan-950/15 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              disabled={!summary}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
