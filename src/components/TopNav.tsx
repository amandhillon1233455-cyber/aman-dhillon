import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Printer,
  Sparkles,
  Menu,
  Clock,
  Play,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface TopNavProps {
  onOpenMobileMenu: () => void;
  onOpenAddPrinter: () => void;
  onOpenNewJob: () => void;
  onOpenAISummary: () => void;
  globalSearch: string;
  onSearchChange: (val: string) => void;
  collapsed: boolean;
  onRefreshData?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileMenu,
  onOpenAddPrinter,
  onOpenNewJob,
  onOpenAISummary,
  globalSearch,
  onSearchChange,
  collapsed,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateQueue = async () => {
    setIsSimulating(true);
    try {
      const res = await api.activity.advanceJobSimulation();
      success('Print Spooler Updated', res.message);
      if (onRefreshData) onRefreshData();
    } catch (e: any) {
      info('Print Queue', e.message || 'Queue is up to date.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-all duration-300 flex items-center justify-between px-4 sm:px-6
        ${collapsed ? 'left-20' : 'left-0 lg:left-64'}
      `}
    >
      {/* Left: Mobile trigger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search printers, jobs, files, error codes..."
            value={globalSearch}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Date/Time, Quick Actions, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Live Date/Time Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentTime || 'Loading live clock...'}</span>
        </div>

        {/* Simulate Spooler Button */}
        <button
          onClick={handleSimulateQueue}
          disabled={isSimulating}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
          title="Advances print spooler: completes active job and starts next queued job"
        >
          <Play className={`w-3.5 h-3.5 text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Advance Spooler</span>
        </button>

        {/* AI Summary Quick Trigger */}
        <button
          onClick={onOpenAISummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-medium text-indigo-300 border border-indigo-500/30 transition-all"
          title="Generate AI Executive Fleet Summary"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">AI Summary</span>
        </button>

        {/* New Print Job Action */}
        <button
          onClick={onOpenNewJob}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Job</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold">2 Active</span>
              </div>
              <div className="py-2 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-300">Tray 2 Paper Jam</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Design Canon imageRUNNER reported an obstruction.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-300">Device Offline</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Reception Desk Compact has been unresponsive for 18h.</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Close Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
};
