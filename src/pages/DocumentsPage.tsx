import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Trash2,
  Printer,
  Eye,
  Download,
  Clock,
  User,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { DocumentFile, Printer as PrinterType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DocumentUploadModal } from '../components/DocumentUploadModal.tsx';
import { PrintJobModal } from '../components/PrintJobModal.tsx';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';
import { useToast } from '../context/ToastContext.tsx';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToPrint, setDocToPrint] = useState<DocumentFile | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentFile | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);

  const { success, error: toastError } = useToast();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const [docsRes, printersRes] = await Promise.all([
        api.documents.getAll(),
        api.printers.getAll(),
      ]);
      setDocuments(docsRes.documents);
      setPrinters(printersRes.printers);
    } catch (err: any) {
      toastError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await api.documents.delete(docToDelete._id);
      success('Document Removed', `Deleted "${docToDelete.fileName}".`);
      setDocToDelete(null);
      fetchDocs();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const filteredDocs = documents.filter(d =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Document Repository</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {documents.length} Files
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store enterprise PDFs, specifications, and collateral for instant print job dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={fetchDocs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by file name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-3">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-600" />
            <div className="text-sm font-semibold text-slate-300">No documents found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload PDF documents, schematics, or images to begin dispatching jobs directly to your printer fleet.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Your First File</span>
            </button>
          </div>
        ) : (
          filteredDocs.map(doc => {
            const sizeFormatted = (doc.fileSize / (1024 * 1024)).toFixed(2) + ' MB';
            const isImage = doc.fileType.startsWith('image/');

            return (
              <div
                key={doc._id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-white text-sm truncate" title={doc.fileName}>
                        {doc.fileName}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {sizeFormatted} • {doc.pages} {doc.pages === 1 ? 'page' : 'pages'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{doc.userName || 'Operator'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setDocToPrint(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.01]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Document</span>
                  </button>

                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                    title="Preview Document Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() => fetchDocs()}
      />

      {/* Print Modal directly from document */}
      {docToPrint && (
        <PrintJobModal
          isOpen={!!docToPrint}
          onClose={() => setDocToPrint(null)}
          printers={printers}
          documents={documents}
          initialDocumentName={docToPrint.fileName}
          initialPages={docToPrint.pages}
          onJobCreated={() => {
            setDocToPrint(null);
            fetchDocs();
          }}
        />
      )}

      {/* Document Preview Area Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Document Information Preview</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2">
                <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">File Specifications</div>
                <div className="font-bold text-white text-base truncate">{previewDoc.fileName}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] pt-1">
                  <div>Type: {previewDoc.fileType}</div>
                  <div>Size: {(previewDoc.fileSize / 1024).toFixed(0)} KB</div>
                  <div>Pages: {previewDoc.pages}</div>
                  <div>Uploader: {previewDoc.userName}</div>
                </div>
              </div>

              {/* Secure Preview Box */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="text-slate-300 font-semibold text-xs">Protected Document Preview Container</div>
                <p className="text-[11px] text-slate-500">
                  Ready for spooler dispatch to any authorized network printer.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = previewDoc;
                  setPreviewDoc(null);
                  setDocToPrint(target);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!docToDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${docToDelete?.fileName}"?`}
        confirmLabel="Delete File"
        onConfirm={handleDelete}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  );
};
