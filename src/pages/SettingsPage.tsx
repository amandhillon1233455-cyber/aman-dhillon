import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Play,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Server,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';

export const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateQueue = async () => {
    setIsSimulating(true);
    try {
      const res = await api.activity.advanceJobSimulation();
      success('Queue Simulated', res.message);
    } catch (err: any) {
      info('Spooler Status', err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateJam = async () => {
    try {
      const printersRes = await api.printers.getAll();
      const onlinePrinter = printersRes.printers.find(p => p.status === 'Online');
      if (!onlinePrinter) {
        toastError('Simulation Info', 'No online printers currently available to simulate an error.');
        return;
      }

      await api.printers.updateStatus(
        onlinePrinter._id,
        'Error',
        'Simulated Paper Jam in Tray 2 - Sensor Obstruction [Code: E-102]'
      );

      success('Error Simulated', `Triggered error alarm on ${onlinePrinter.name}. You can now test AI Troubleshooting!`);
    } catch (err: any) {
      toastError('Simulation Error', err.message);
    }
  };

  const handleResetSeed = async () => {
    try {
      await api.activity.resetSeedData();
      success('Database Restored', 'Reset fleet, jobs, and history to fresh sample state.');
      setIsResetConfirmOpen(false);
      window.location.reload();
    } catch (err: any) {
      toastError('Reset Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>System & Workspace Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage operator authentication, fleet simulation tools, and database state
        </p>
      </div>

      {/* Operator Account Profile */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Active Operator Profile</h2>
            <p className="text-xs text-slate-400">Authenticated session parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="text-slate-400">Full Name</span>
            <div className="font-bold text-white mt-1">{user?.name || 'Administrator'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="text-slate-400">Work Email</span>
            <div className="font-bold text-white mt-1">{user?.email || 'admin@printai.io'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="text-slate-400">Security Clearance</span>
            <div className="font-bold text-indigo-400 uppercase mt-1 tracking-wider">
              {user?.role || 'admin'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Interactive Fleet Simulation Controls</h2>
            <p className="text-xs text-slate-400">
              Trigger real-time spooler events and printer errors to verify AI diagnostics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-750 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Advance Print Spooler Queue</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Marks the currently active printing job as completed and transitions the next queued job to active status.
              </p>
            </div>
            <button
              onClick={handleSimulateQueue}
              disabled={isSimulating}
              className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-650 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSimulating ? 'Simulating...' : 'Simulate 1 Job Step'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-750 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Simulate Hardware Paper Jam</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Flags a healthy online printer with a simulated optical sensor jam code [E-102] to test the "Explain with AI" workflow.
              </p>
            </div>
            <button
              onClick={handleSimulateJam}
              className="w-full py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors"
            >
              Inject Paper Jam Code
            </button>
          </div>
        </div>
      </div>

      {/* Database State & Seeding */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Database State & Reset</h2>
            <p className="text-xs text-slate-400">
              MongoDB / Embedded document storage engine
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The database is loaded with realistic printers (HP LaserJet Enterprise, Canon imageRUNNER, Brother Monochrome, Xerox VersaLink, Epson WorkForce), print queues, and historical activity events.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database to Initial Seed State</span>
          </button>
        </div>
      </div>

      {/* Seed Reset Confirmation */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title="Reset Entire Database"
        message="This will wipe all newly added printers, jobs, and documents, and reset the catalog back to the default demo state. Continue?"
        confirmLabel="Reset Everything"
        onConfirm={handleResetSeed}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
