import React, { useState, useEffect } from 'react';
import {
  Printer as PrinterIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Wrench,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  List,
  Grid,
  RefreshCw,
  ExternalLink,
  Layers,
  MapPin,
  Globe,
  Gauge,
  Activity,
  ChevronDown,
} from 'lucide-react';
import { Printer as PrinterType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { PrinterModal } from '../components/PrinterModal.tsx';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface PrintersPageProps {
  onOpenTroubleshoot: (printer: PrinterType) => void;
  onViewJobsForPrinter?: (printerId: string) => void;
}

export const PrintersPage: React.FC<PrintersPageProps> = ({
  onOpenTroubleshoot,
  onViewJobsForPrinter,
}) => {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [printerToDelete, setPrinterToDelete] = useState<PrinterType | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const { isAdmin } = useAuth();

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const res = await api.printers.getAll({
        status: statusFilter,
        search: searchQuery,
      });
      setPrinters(res.printers);
    } catch (err: any) {
      toastError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (printer: PrinterType, newStatus: string) => {
    try {
      let customErr: string | undefined = undefined;
      if (newStatus === 'Error') {
        customErr = 'Simulated Hardware Optical Sensor Alert [Code: E-404]';
      }
      await api.printers.updateStatus(printer._id, newStatus, customErr);
      success('Status Updated', `Changed status of ${printer.name} to ${newStatus}.`);
      setActiveMenuId(null);
      fetchPrinters();
    } catch (err: any) {
      toastError('Status Update Failed', err.message);
    }
  };

  const handleDelete = async () => {
    if (!printerToDelete) return;
    try {
      await api.printers.delete(printerToDelete._id);
      success('Printer Removed', `Removed ${printerToDelete.name} from catalog.`);
      setPrinterToDelete(null);
      fetchPrinters();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Printer Fleet Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {printers.length} Devices
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time network hardware, inspect consumables, and diagnose issues with AI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingPrinter(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Printer</span>
          </button>

          <button
            onClick={fetchPrinters}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Printers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, model, IP or floor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Online', 'Printing', 'Error', 'Maintenance', 'Offline'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {printers.map(printer => {
            const statusConfig = {
              Online: {
                badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                dot: 'bg-emerald-400',
              },
              Printing: {
                badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
                dot: 'bg-indigo-400',
              },
              Error: {
                badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                dot: 'bg-rose-400',
              },
              Maintenance: {
                badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                dot: 'bg-amber-400',
              },
              Offline: {
                badge: 'bg-slate-700/60 text-slate-400 border-slate-600',
                dot: 'bg-slate-500',
              },
            }[printer.status];

            const isMenuOpen = activeMenuId === printer._id;

            return (
              <div
                key={printer._id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <PrinterIcon className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-white text-sm truncate">{printer.name}</h3>
                      <div className="text-[11px] text-slate-400 truncate">{printer.model}</div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : printer._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-30 animate-in fade-in duration-150 space-y-1">
                        <button
                          onClick={() => {
                            setEditingPrinter(printer);
                            setIsModalOpen(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-700 text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit Hardware</span>
                        </button>

                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Change Status
                        </div>
                        {(['Online', 'Printing', 'Maintenance', 'Error', 'Offline'] as const).map(st => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(printer, st)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-700 text-left"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Mark as {st}</span>
                          </button>
                        ))}

                        <div className="border-t border-slate-700 my-1" />
                        <button
                          onClick={() => {
                            setPrinterToDelete(printer);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Printer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & IP */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    <span>{printer.status}</span>
                  </span>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{printer.ipAddress}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{printer.location}</span>
                </div>

                {/* Consumable Levels (Toner & Paper) */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Toner Cartridge Level</span>
                      <span className="font-mono font-bold text-slate-300">{printer.tonerLevel ?? 80}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${printer.tonerLevel ?? 80}%` }}
                        className={`h-full rounded-full ${
                          (printer.tonerLevel ?? 80) < 20 ? 'bg-rose-500' : 'bg-cyan-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Paper Tray Capacity</span>
                      <span className="font-mono font-bold text-slate-300">{printer.paperLevel ?? 85}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${printer.paperLevel ?? 85}%` }}
                        className={`h-full rounded-full ${
                          (printer.paperLevel ?? 85) < 20 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Error / Action Bar */}
                {printer.status === 'Error' ? (
                  <div className="pt-2">
                    <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 mb-3 text-[11px] text-rose-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Active Hardware Fault</span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-rose-200">
                        {printer.currentError || 'Unspecified Error'}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenTroubleshoot(printer)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.01]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explain with AI</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
                    <span>Lifetime Volume:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {printer.pagesPrinted.toLocaleString()} pgs
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Printer</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Pages Printed</th>
                <th className="pb-3 font-semibold">Toner / Paper</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {printers.map(printer => (
                <tr key={printer._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pr-2">
                    <div className="font-semibold text-white">{printer.name}</div>
                    <div className="text-[11px] text-slate-400">{printer.model}</div>
                  </td>
                  <td className="py-3.5 text-slate-300">{printer.location}</td>
                  <td className="py-3.5 font-mono text-slate-300">{printer.ipAddress}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {printer.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-200">
                    {printer.pagesPrinted.toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">
                    T: {printer.tonerLevel}% | P: {printer.paperLevel}%
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    {printer.status === 'Error' && (
                      <button
                        onClick={() => onOpenTroubleshoot(printer)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px]"
                      >
                        Explain with AI
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingPrinter(printer);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPrinterToDelete(printer)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Printer Modal */}
      <PrinterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrinter(null);
        }}
        printerToEdit={editingPrinter}
        onSaved={fetchPrinters}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!printerToDelete}
        title="Delete Fleet Printer"
        message={`Are you sure you want to permanently remove "${printerToDelete?.name}" from your MongoDB database? This action cannot be reversed.`}
        confirmLabel="Delete Printer"
        onConfirm={handleDelete}
        onCancel={() => setPrinterToDelete(null)}
      />
    </div>
  );
};
