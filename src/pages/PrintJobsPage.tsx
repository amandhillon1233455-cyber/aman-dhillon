import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  FileText,
  User,
  AlertTriangle,
} from 'lucide-react';
import { PrintJob, Printer, DocumentFile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { PrintJobModal } from '../components/PrintJobModal.tsx';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface PrintJobsPageProps {
  onOpenNewJobModal: () => void;
}

export const PrintJobsPage: React.FC<PrintJobsPageProps> = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [printerFilter, setPrinterFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<PrintJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<PrintJob | null>(null);

  const { success, error: toastError, info } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobsRes, printersRes, docsRes] = await Promise.all([
        api.jobs.getAll({
          status: statusFilter,
          printerId: printerFilter,
          search: searchQuery,
          sort: sortOrder,
        }),
        api.printers.getAll(),
        api.documents.getAll(),
      ]);

      setJobs(jobsRes.jobs);
      setPrinters(printersRes.printers);
      setDocuments(docsRes.documents);
    } catch (err: any) {
      toastError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, printerFilter, searchQuery, sortOrder]);

  const handleCancelJob = async (job: PrintJob) => {
    try {
      await api.jobs.updateStatus(job._id, 'Cancelled', 'Cancelled by operator via dashboard');
      success('Job Cancelled', `Cancelled "${job.documentName}".`);
      fetchJobs();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  const handleRetryJob = async (job: PrintJob) => {
    try {
      await api.jobs.updateStatus(job._id, 'Queued');
      success('Job Re-queued', `Re-queued "${job.documentName}" for printing.`);
      fetchJobs();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  const handleMarkCompleted = async (job: PrintJob) => {
    try {
      await api.jobs.updateStatus(job._id, 'Completed');
      success('Job Completed', `Marked "${job.documentName}" as completed.`);
      fetchJobs();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    try {
      await api.jobs.delete(jobToDelete._id);
      success('Job Removed', `Deleted job record "${jobToDelete.documentName}".`);
      setJobToDelete(null);
      fetchJobs();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Print Job Queue & Spooler</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {jobs.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervise document pipelines, cancel stuck jobs, and inspect completion timestamps
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Print Job</span>
          </button>

          <button
            onClick={fetchJobs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Jobs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search by document */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document name or user..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter by Printer */}
          <select
            value={printerFilter}
            onChange={e => setPrinterFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          >
            <option value="All">All Destination Printers</option>
            {printers.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filters & Sorting */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {['All', 'Queued', 'Printing', 'Completed', 'Failed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium shrink-0 ml-1"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <th className="pb-3.5 font-semibold">Document & User</th>
              <th className="pb-3.5 font-semibold">Destination Printer</th>
              <th className="pb-3.5 font-semibold">Volume / Format</th>
              <th className="pb-3.5 font-semibold">Status</th>
              <th className="pb-3.5 font-semibold">Created / Finished</th>
              <th className="pb-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No print jobs match the selected filter criteria.
                </td>
              </tr>
            ) : (
              jobs.map(job => {
                const statusBadge = {
                  Queued: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                  Printing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
                  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                  Failed: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                  Cancelled: 'bg-slate-700/50 text-slate-400 border-slate-600',
                }[job.status];

                return (
                  <tr key={job._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Document */}
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate max-w-[200px] sm:max-w-xs">
                          <div className="font-semibold text-white truncate">{job.documentName}</div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" />
                            <span>{job.userName || job.userEmail || 'Anonymous'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Printer */}
                    <td className="py-4 pr-3">
                      <div className="font-medium text-slate-200">{job.printerName || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {job.printerId}</div>
                    </td>

                    {/* Pages & Copies */}
                    <td className="py-4 pr-3">
                      <div className="font-mono text-slate-200">
                        {job.pages} pgs • {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {job.colorMode === 'Color' ? 'Full CMYK Color' : 'Monochrome B&W'}
                      </div>
                    </td>

                    {/* Status & Error */}
                    <td className="py-4 pr-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {job.status}
                      </span>
                      {job.errorMessage && (
                        <div className="text-[11px] text-rose-400 mt-1 max-w-[180px] truncate" title={job.errorMessage}>
                          {job.errorMessage}
                        </div>
                      )}
                    </td>

                    {/* Timestamps */}
                    <td className="py-4 pr-3 font-mono text-[11px] text-slate-400">
                      <div>{new Date(job.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      {job.completedAt && (
                        <div className="text-emerald-400 text-[10px]">
                          Finished: {new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedJobForDetails(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="View Job Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {job.status === 'Queued' || job.status === 'Printing' ? (
                        <>
                          <button
                            onClick={() => handleMarkCompleted(job)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelJob(job)}
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/30"
                            title="Cancel Job"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : null}

                      {job.status === 'Failed' || job.status === 'Cancelled' ? (
                        <button
                          onClick={() => handleRetryJob(job)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30"
                          title="Retry Job"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : null}

                      <button
                        onClick={() => setJobToDelete(job)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                        title="Delete Job Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Job Modal */}
      <PrintJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        printers={printers}
        documents={documents}
        onJobCreated={fetchJobs}
      />

      {/* Job Details Modal */}
      {selectedJobForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Job Specification</h3>
              </div>
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 space-y-1">
                <div className="text-slate-400">Document Name:</div>
                <div className="font-bold text-white text-sm">{selectedJobForDetails.documentName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
                  <div className="text-slate-400">Destination:</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedJobForDetails.printerName}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
                  <div className="text-slate-400">Initiating User:</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedJobForDetails.userName}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-750 text-center">
                  <div className="text-slate-400 text-[10px]">Pages</div>
                  <div className="font-bold text-white mt-0.5">{selectedJobForDetails.pages}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-750 text-center">
                  <div className="text-slate-400 text-[10px]">Copies</div>
                  <div className="font-bold text-white mt-0.5">{selectedJobForDetails.copies}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-750 text-center">
                  <div className="text-slate-400 text-[10px]">Mode</div>
                  <div className="font-bold text-white mt-0.5">{selectedJobForDetails.colorMode}</div>
                </div>
              </div>

              {selectedJobForDetails.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
                  <div className="font-bold uppercase text-[10px]">Failure Reason</div>
                  <div className="mt-0.5">{selectedJobForDetails.errorMessage}</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!jobToDelete}
        title="Delete Print Job Record"
        message={`Are you sure you want to delete job "${jobToDelete?.documentName}"?`}
        confirmLabel="Delete Job"
        onConfirm={handleDelete}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
};
