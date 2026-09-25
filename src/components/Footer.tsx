import React from 'react';
import { Printer, Shield, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Printer className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">PrintAI Dashboard</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade print infrastructure management powered by Gemini AI. Real-time telemetry, automated triage, and print queue optimization.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Printer Monitoring</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Print Job Management</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Usage Analytics</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Hardware Error Tracking</a></li>
              <li><a href="#ai-assistant" className="hover:text-indigo-400 transition-colors">AI Troubleshooting</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Activity Summaries</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">About & Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Node.js Express REST API</span></li>
              <li><span className="text-slate-400">MongoDB & Mongoose Schema</span></li>
              <li><span className="text-slate-400">Google Gemini AI Engine</span></li>
              <li><span className="text-slate-400">JWT & bcrypt Cryptography</span></li>
              <li><span className="text-slate-400">Vite & Tailwind CSS Frontend</span></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#contact" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
              <li><a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="hover:text-indigo-400 transition-colors">Security Hardening</a></li>
              <li><a href="#sla" className="hover:text-indigo-400 transition-colors">Service Level Agreement</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} PrintAI Dashboard. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini 3.8 Intelligence Core</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise TLS Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
