import React from 'react';
import {
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BarChart3,
  Layers,
  Wrench,
  FileText,
  AlertTriangle,
  Bot,
  Zap,
  Clock,
  ChevronRight,
  Check,
  Server,
  Play,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAIAssistant: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDashboard,
  onOpenLogin,
  onOpenRegister,
  onOpenAIAssistant,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        onNavigate={page => {
          if (page === 'dashboard') onNavigateToDashboard();
        }}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-cyan-300 mb-6 shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Enterprise Print Management</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Smart Printing Management{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Monitor printers, manage print jobs, track usage and get AI-powered troubleshooting assistance from one centralized dashboard.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={user ? onNavigateToDashboard : onOpenRegister}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-800 transition-all shadow-lg"
            >
              <span>View Dashboard</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Interactive Live Dashboard Illustration / Teaser Window */}
          <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl shadow-indigo-950/50">
            <div className="rounded-2xl bg-slate-900/90 overflow-hidden border border-slate-800/80 p-5 sm:p-7 text-left space-y-6">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-mono text-slate-400">printai://fleet-cluster/telemetry</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Fleet Connected • 6 Nodes</span>
                </div>
              </div>

              {/* Mini Preview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750">
                  <div className="text-[11px] font-semibold text-slate-400">Total Printers</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">6 Active</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750">
                  <div className="text-[11px] font-semibold text-emerald-400">Online Rate</div>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-1">83.3%</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750">
                  <div className="text-[11px] font-semibold text-indigo-400">Print Jobs Today</div>
                  <div className="text-xl font-bold font-mono text-indigo-300 mt-1">24 Dispatched</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750">
                  <div className="text-[11px] font-semibold text-cyan-400">AI Assistant</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">Gemini 3.8</div>
                </div>
              </div>

              {/* Sample Hardware Error Triage Banner */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-300">Design Canon imageRUNNER: Paper Jam in Tray 2</div>
                    <div className="text-[11px] text-slate-400">AI diagnosed media sensor obstruction [Code: E-102]. Click to inspect steps.</div>
                  </div>
                </div>
                <button
                  onClick={onNavigateToDashboard}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
                >
                  Explain with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section (6 Cards) */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Capabilities & Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Six Pillars of Modern Fleet Management
            </p>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Comprehensive full-stack toolset engineered for IT administrators, office managers, and enterprise print shops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Printer Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live device heartbeat, IP address lookup, toner & paper gauge status, and instantaneous state changes across all office floors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Print Job Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full lifecycle queue operations: create, cancel, retry, and re-route print jobs with real-time status progression from Queued to Completed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Usage Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive charts tracking daily volume, color versus monochrome distributions, page averages, and printer capacity utilization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">4. Error Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant alerts for paper jams, empty media trays, fuser failures, and network timeouts. Audit log pinpointing exact failure stamps.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">5. AI Troubleshooting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Gemini 3.8. Receive immediate root-cause breakdowns, clear actionable resolution checklists, and technician dispatch guidelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">6. Activity Summaries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click executive briefing that synthesizes 24-hour print throughput, hardware uptime, and strategic consumable replenishment advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4 Steps) */}
      <section id="how-it-works" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Simple 4-Step Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Device Enrollment to AI Resolution
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mx-auto mb-4 font-mono">
                01
              </div>
              <h4 className="font-bold text-base text-white mb-1.5">Connect / Add Printer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Input your printer's IP address, model name, and physical location to connect it into the MongoDB fleet catalog.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
              <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm mx-auto mb-4 font-mono">
                02
              </div>
              <h4 className="font-bold text-base text-white mb-1.5">Monitor Printer & Jobs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch real-time status signals (Online, Printing, Maintenance) and supervise queued document batches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
              <div className="w-10 h-10 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm mx-auto mb-4 font-mono">
                03
              </div>
              <h4 className="font-bold text-base text-white mb-1.5">Detect Issues</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive instant error alerts for paper jams, media sensor obstructions, low ink, and offline communication timeouts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm mx-auto mb-4 font-mono">
                04
              </div>
              <h4 className="font-bold text-base text-white mb-1.5">Get AI Assistance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click “Explain with AI” or query the AI Assistant to get hardware diagnosis grounded strictly in your live database records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI Section */}
      <section id="ai-assistant" className="py-20 bg-gradient-to-b from-indigo-950/20 via-slate-900 to-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Intelligent Copilot</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your AI Printing Assistant
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Trained on enterprise print hardware protocols and integrated directly with your MongoDB database telemetry. The AI never hallucinates printer inventory—all answers are grounded in your real live devices and job logs.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Explain printer errors:</strong> Translates obscure vendor hex codes into clear mechanical guidance.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Suggest troubleshooting steps:</strong> Step-by-step clearance routines for feed rollers and paper paths.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Summarize printing activity:</strong> Synthesize throughput and identify failure trends.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Identify possible issues:</strong> Warns before toner cartridges reach critical depletion.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Answer questions about printing data:</strong> Ask in plain English and receive instant queries.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenAIAssistant}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Bot className="w-4 h-4" />
                  <span>Try AI Assistant</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Right Chatbot Interactive Mockup */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">PrintAI Assistant</div>
                    <div className="text-[10px] text-cyan-400 font-mono">Grounded Fleet Knowledge</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  Online
                </span>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white max-w-[85%] ml-auto rounded-tr-xs">
                  Why is printer 2 showing an error right now?
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800 text-slate-200 max-w-[90%] mr-auto rounded-tl-xs border border-slate-750 space-y-1.5">
                  <div className="font-semibold text-cyan-300">
                    Design Canon imageRUNNER [HQ Floor 2 Studio]
                  </div>
                  <p>
                    Reported Error: <strong>Paper Jam in Tray 2 - Media Sensor Obstruction [Code: E-102]</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Current Job Blocked: <em>Brand_Guidelines_Booklet_v2.pdf</em>.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      Suggested Fix: Inspect Tray 2 rear guides
                    </span>
                  </div>
                </div>
              </div>

              {/* Prompt Suggestions */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={onOpenAIAssistant}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 border border-slate-700 transition-colors"
                >
                  "Summarize today's printing activity"
                </button>
                <button
                  onClick={onOpenAIAssistant}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 border border-slate-700 transition-colors"
                >
                  "Which printer has the most jobs?"
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
