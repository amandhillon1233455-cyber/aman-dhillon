import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Loader2,
  RefreshCw,
  Wrench,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';
import { Printer, TroubleshootResult } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface AITroubleshootModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onPrinterResolved: () => void;
}

export const AITroubleshootModal: React.FC<AITroubleshootModalProps> = ({
  printer,
  isOpen,
  onClose,
  onPrinterResolved,
}) => {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<TroubleshootResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isResolving, setIsResolving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen && printer) {
      runTroubleshoot();
    } else {
      setDiagnosis(null);
      setCheckedSteps({});
      setErrorMsg(null);
    }
  }, [isOpen, printer]);

  const runTroubleshoot = async () => {
    if (!printer) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.ai.troubleshoot(printer._id, printer.currentError);
      setDiagnosis(res.diagnosis);
      setCheckedSteps({});
    } catch (err: any) {
      console.error('Troubleshoot error:', err);
      setErrorMsg(err.message || 'Unable to connect to AI diagnostics service.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleResolveAndOnline = async () => {
    if (!printer) return;
    setIsResolving(true);
    try {
      await api.printers.updateStatus(printer._id, 'Online');
      success('Printer Status Restored', `${printer.name} is now marked Online and ready for jobs.`);
      onPrinterResolved();
      onClose();
    } catch (err: any) {
      toastError('Resolution Failed', err.message || 'Could not update printer status.');
    } finally {
      setIsResolving(false);
    }
  };

  if (!isOpen || !printer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Hardware Diagnostics</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gemini 3.8 Core
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Device: <strong className="text-slate-200">{printer.name}</strong> ({printer.model})
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Error Banner */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">Reported Error Alert</div>
              <div className="text-sm font-semibold text-rose-100 mt-0.5">
                {printer.currentError || 'Unspecified Hardware or Network Fault'}
              </div>
              <div className="text-xs text-rose-300/80 mt-1 flex items-center gap-4">
                <span>Location: {printer.location}</span>
                <span>IP: {printer.ipAddress}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Gemini is synthesizing hardware schematics & error telemetry...
              </p>
              <p className="text-xs text-slate-500">
                Analyzing sensor logs and matching known resolution workflows
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <p>{errorMsg}</p>
              <button
                onClick={runTroubleshoot}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-500"
              >
                Retry Analysis
              </button>
            </div>
          ) : diagnosis ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. Explanation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <Wrench className="w-4 h-4" />
                  <span>1. Technical Error Explanation</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 text-slate-200 text-sm leading-relaxed">
                  {diagnosis.explanation}
                </div>
              </div>

              {/* 2. Possible Causes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Probable Root Causes</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {diagnosis.possibleCauses.map((cause, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-750/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Recommended Troubleshooting Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Recommended Action Steps (Interactive Checklist)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {Object.values(checkedSteps).filter(Boolean).length} / {diagnosis.recommendedSteps.length} Completed
                  </span>
                </div>
                <div className="space-y-2">
                  {diagnosis.recommendedSteps.map((step, idx) => {
                    const isChecked = !!checkedSteps[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 line-through opacity-80'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span className="text-xs leading-relaxed">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. When to Contact Support */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex items-start gap-3 text-xs">
                <PhoneCall className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                    4. When to Contact Technical Support
                  </div>
                  <div className="text-slate-300 mt-1 leading-relaxed">
                    {diagnosis.whenToContactSupport}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={runTroubleshoot}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run AI Diagnostics</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleResolveAndOnline}
              disabled={isResolving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isResolving ? 'Restoring...' : 'Mark Resolved & Return Online'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
