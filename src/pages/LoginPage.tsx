import React, { useState } from 'react';
import { Printer, Lock, Mail, ArrowRight, AlertCircle, Shield, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onGoHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onSwitchToRegister,
  onGoHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, quickLoginDemo } = useAuth();
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome Back!', 'Logged into Printing Dashboard.');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      toastError('Login Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'user') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await quickLoginDemo(type);
      success(
        type === 'admin' ? 'Logged in as Admin' : 'Logged in as Staff User',
        type === 'admin' ? 'Full system administrator privileges active.' : 'Staff print queue operator active.'
      );
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-600/20 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 cursor-pointer mb-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Printer className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">PrintAI Dashboard</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Access real-time printer telemetry and AI diagnostics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 backdrop-blur-md space-y-6">
          {/* Quick Demo Login Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant One-Click Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-white transition-colors text-center disabled:opacity-50"
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors text-center disabled:opacity-50"
              >
                Staff (Sarah)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@printai.io"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <button
              onClick={onSwitchToRegister}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
