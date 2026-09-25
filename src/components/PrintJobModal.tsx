import React, { useState, useEffect } from 'react';
import { X, Layers, Printer as PrinterIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Printer, DocumentFile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface PrintJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
  documents: DocumentFile[];
  initialDocumentName?: string;
  initialPages?: number;
  initialPrinterId?: string;
  onJobCreated: () => void;
}

export const PrintJobModal: React.FC<PrintJobModalProps> = ({
  isOpen,
  onClose,
  printers,
  documents,
  initialDocumentName,
  initialPages,
  initialPrinterId,
  onJobCreated,
}) => {
  const [documentName, setDocumentName] = useState('');
  const [printerId, setPrinterId] = useState('');
  const [pages, setPages] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'Color' | 'Black & White'>('Black & White');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      setDocumentName(initialDocumentName || (documents[0]?.fileName ?? 'Quarterly_Report_2026.pdf'));
      setPages(initialPages || 1);
      const defaultPrinter = initialPrinterId || printers.find(p => p.status === 'Online')?._id || printers[0]?._id || '';
      setPrinterId(defaultPrinter);
      setCopies(1);
      setColorMode('Black & White');
      setFormError(null);
    }
  }, [isOpen, initialDocumentName, initialPages, initialPrinterId, printers, documents]);

  if (!isOpen) return null;

  const handleDocumentSelect = (docFileName: string) => {
    setDocumentName(docFileName);
    const matchedDoc = documents.find(d => d.fileName === docFileName);
    if (matchedDoc) {
      setPages(matchedDoc.pages || 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!documentName.trim()) {
      setFormError('Please enter or select a document name.');
      return;
    }

    if (!printerId) {
      setFormError('Please select a destination printer.');
      return;
    }

    const selectedPrinter = printers.find(p => p._id === printerId);
    if (selectedPrinter && selectedPrinter.status === 'Offline') {
      setFormError(`Cannot dispatch to ${selectedPrinter.name} because it is currently Offline.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.jobs.create({
        documentName: documentName.trim(),
        printerId,
        pages: Math.max(1, pages),
        copies: Math.max(1, copies),
        colorMode,
      });

      success('Print Job Dispatched', `Queued "${documentName}" for printing on ${selectedPrinter?.name || 'fleet printer'}.`);
      onJobCreated();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit print job.');
      toastError('Dispatch Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Print Job</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure document parameters and spool directly to fleet hardware
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick select from uploaded documents if available */}
          {documents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select from Uploaded Repository
              </label>
              <select
                onChange={e => handleDocumentSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
                value={documents.some(d => d.fileName === documentName) ? documentName : ''}
              >
                <option value="">-- Choose an uploaded file or type below --</option>
                {documents.map(doc => (
                  <option key={doc._id} value={doc.fileName}>
                    {doc.fileName} ({doc.pages} pages, {(doc.fileSize / 1024).toFixed(0)} KB)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sales_Contract_Final.pdf"
              value={documentName}
              onChange={e => setDocumentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Printer <span className="text-rose-400">*</span>
            </label>
            <select
              value={printerId}
              onChange={e => setPrinterId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
              required
            >
              <option value="">-- Select a Destination Printer --</option>
              {printers.map(p => (
                <option
                  key={p._id}
                  value={p._id}
                  disabled={p.status === 'Offline'}
                >
                  {p.name} [{p.status}] - {p.location} {p.status === 'Offline' ? '(Unavailable)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Pages
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={pages}
                onChange={e => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Copies
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color Output Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setColorMode('Black & White')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  colorMode === 'Black & White'
                    ? 'bg-slate-700 border-indigo-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200'
                }`}
              >
                Monochrome (B&W)
              </button>
              <button
                type="button"
                onClick={() => setColorMode('Color')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  colorMode === 'Color'
                    ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500 text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Color (CMYK)
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Total Volume Calculated:</span>
            <span className="font-bold text-white">
              {(pages * copies).toLocaleString()} total printed pages
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? 'Spooling...' : 'Dispatch Print Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
