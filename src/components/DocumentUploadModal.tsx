import React, { useState, useRef } from 'react';
import { X, UploadCloud, File, FileText, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { DocumentFile } from '../types/index.ts';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (newDoc: DocumentFile) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success, error: toastError } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Estimate pages roughly by size or default
      const estimatedPages = Math.max(1, Math.round(file.size / 65000));
      setPages(estimatedPages);

      // If image, create object URL for preview
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const estimatedPages = Math.max(1, Math.round(file.size / 65000));
      setPages(estimatedPages);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await api.documents.upload(selectedFile, pages);
      success('Document Uploaded', `${res.document.fileName} is now in your repository.`);
      onUploaded(res.document);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed.');
      toastError('Upload Error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload New Document</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Support for PDF, Word documents, images, and text files
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-indigo-500/60 bg-indigo-950/20'
                : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx,.doc"
              className="hidden"
            />

            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-200">
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop file here'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              PDF, DOCX, PNG, JPG, or TXT up to 25MB
            </div>
          </div>

          {/* Selected File Details & Preview */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-white truncate">{selectedFile.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                  </div>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/80 max-h-40 flex items-center justify-center bg-black/40">
                  <img src={previewUrl} alt="Preview" className="max-h-40 object-contain" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Page Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={pages}
                  onChange={e => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

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
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Save to Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
