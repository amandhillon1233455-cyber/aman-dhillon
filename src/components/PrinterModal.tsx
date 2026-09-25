import React, { useState, useEffect } from 'react';
import { X, Printer as PrinterIcon, MapPin, Globe, Cpu, AlertCircle } from 'lucide-react';
import { Printer } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerToEdit?: Printer | null;
  onSaved: () => void;
}

export const PrinterModal: React.FC<PrinterModalProps> = ({
  isOpen,
  onClose,
  printerToEdit,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [status, setStatus] = useState<'Online' | 'Offline' | 'Printing' | 'Error' | 'Maintenance'>('Online');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (printerToEdit) {
      setName(printerToEdit.name);
      setModel(printerToEdit.model);
      setLocation(printerToEdit.location);
      setIpAddress(printerToEdit.ipAddress);
      setStatus(printerToEdit.status);
      setErrorDetails(printerToEdit.currentError || '');
    } else {
      setName('');
      setModel('');
      setLocation('');
      setIpAddress('192.168.1.');
      setStatus('Online');
      setErrorDetails('');
    }
    setFormError(null);
  }, [printerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !model.trim() || !location.trim() || !ipAddress.trim()) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress.trim())) {
      setFormError('Please enter a valid IPv4 address (e.g., 192.168.1.150).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (printerToEdit) {
        await api.printers.update(printerToEdit._id, {
          name: name.trim(),
          model: model.trim(),
          location: location.trim(),
          ipAddress: ipAddress.trim(),
          status,
          currentError: status === 'Error' ? errorDetails : undefined,
        });
        success('Printer Updated', `Saved changes to ${name}.`);
      } else {
        await api.printers.create({
          name: name.trim(),
          model: model.trim(),
          location: location.trim(),
          ipAddress: ipAddress.trim(),
          status,
        });
        success('Printer Enrolled', `Enrolled "${name}" into fleet.`);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save printer record.');
      toastError('Save Error', err.message);
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
              <PrinterIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {printerToEdit ? 'Edit Printer Configuration' : 'Add New Fleet Printer'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register network hardware parameters and physical location
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Printer Friendly Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Legal HP LaserJet Enterprise"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Model & Hardware Specs <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. HP LaserJet Enterprise M608dn"
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Physical Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HQ Floor 3 - Legal Wing"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Network IP Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="192.168.1.105"
                value={ipAddress}
                onChange={e => setIpAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Operational Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="Online">Online (Ready)</option>
              <option value="Printing">Printing (Busy)</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Error">Error (Simulate Hardware Alarm)</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {status === 'Error' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-rose-300 mb-1.5">
                Error Message / Hardware Fault Description
              </label>
              <input
                type="text"
                placeholder="e.g. Paper Jam in Tray 2 - Sensor Obstruction [Code: E-102]"
                value={errorDetails}
                onChange={e => setErrorDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs focus:outline-hidden focus:border-rose-400 transition-colors"
              />
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : printerToEdit ? 'Save Changes' : 'Add Printer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
