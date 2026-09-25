import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardOverview } from './pages/DashboardOverview.tsx';
import { PrintersPage } from './pages/PrintersPage.tsx';
import { PrintJobsPage } from './pages/PrintJobsPage.tsx';
import { DocumentsPage } from './pages/DocumentsPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { AIAssistantPage } from './pages/AIAssistantPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { AITroubleshootModal } from './components/AITroubleshootModal.tsx';
import { AISummaryModal } from './components/AISummaryModal.tsx';
import { PrintJobModal } from './components/PrintJobModal.tsx';
import { PrinterModal } from './components/PrinterModal.tsx';
import { Printer, DocumentFile } from './types/index.ts';
import { api } from './services/api.ts';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Global modals
  const [troubleshootPrinter, setTroubleshootPrinter] = useState<Printer | null>(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);

  // Cached printers & documents for quick modals
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const fetchGlobalData = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        api.printers.getAll(),
        api.documents.getAll(),
      ]);
      setPrinters(pRes.printers);
      setDocuments(dRes.documents);
    } catch (e) {
      // Background cache fetch
    }
  };

  useEffect(() => {
    if (user) {
      fetchGlobalData();
    }
  }, [user]);

  // Navigate to dashboard if already logged in and requested
  const handleOpenDashboard = () => {
    if (!user) {
      setCurrentView('login');
    } else {
      setCurrentView('dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 animate-pulse" />
        <span className="text-xs text-slate-400 font-mono">Initializing PrintAI Engine...</span>
      </div>
    );
  }

  // 1. Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onNavigateToDashboard={handleOpenDashboard}
        onOpenLogin={() => setCurrentView('login')}
        onOpenRegister={() => setCurrentView('register')}
        onOpenAIAssistant={() => {
          if (user) {
            setCurrentView('dashboard');
            setCurrentTab('ai-assistant');
          } else {
            setCurrentView('login');
          }
        }}
      />
    );
  }

  // 2. Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('dashboard')}
        onSwitchToRegister={() => setCurrentView('register')}
        onGoHome={() => setCurrentView('landing')}
      />
    );
  }

  // 3. Register Page
  if (currentView === 'register') {
    return (
      <RegisterPage
        onSuccess={() => setCurrentView('dashboard')}
        onSwitchToLogin={() => setCurrentView('login')}
        onGoHome={() => setCurrentView('landing')}
      />
    );
  }

  // 4. Main Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onNavigateHome={() => setCurrentView('landing')}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header Navigation */}
        <TopNav
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddPrinter={() => setIsAddPrinterOpen(true)}
          onOpenNewJob={() => setIsNewJobOpen(true)}
          onOpenAISummary={() => setIsAISummaryOpen(true)}
          globalSearch={globalSearch}
          onSearchChange={setGlobalSearch}
          collapsed={sidebarCollapsed}
          onRefreshData={fetchGlobalData}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-22 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onNavigateToPrinters={() => setCurrentTab('printers')}
              onNavigateToJobs={() => setCurrentTab('jobs')}
              onNavigateToAnalytics={() => setCurrentTab('analytics')}
              onNavigateToAIAssistant={() => setCurrentTab('ai-assistant')}
              onOpenTroubleshoot={p => setTroubleshootPrinter(p)}
              onOpenAISummary={() => setIsAISummaryOpen(true)}
              onOpenNewJob={() => setIsNewJobOpen(true)}
            />
          )}

          {currentTab === 'printers' && (
            <PrintersPage
              onOpenTroubleshoot={p => setTroubleshootPrinter(p)}
              onViewJobsForPrinter={_id => setCurrentTab('jobs')}
            />
          )}

          {currentTab === 'jobs' && (
            <PrintJobsPage
              onOpenNewJobModal={() => setIsNewJobOpen(true)}
            />
          )}

          {currentTab === 'documents' && <DocumentsPage />}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'ai-assistant' && <AIAssistantPage />}

          {currentTab === 'activity' && <HistoryPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global AI Troubleshooting Modal */}
      <AITroubleshootModal
        printer={troubleshootPrinter}
        isOpen={!!troubleshootPrinter}
        onClose={() => setTroubleshootPrinter(null)}
        onPrinterResolved={() => {
          fetchGlobalData();
          setTroubleshootPrinter(null);
        }}
      />

      {/* Global AI Executive Summary Modal */}
      <AISummaryModal
        isOpen={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
      />

      {/* Global New Print Job Modal */}
      <PrintJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        printers={printers}
        documents={documents}
        onJobCreated={() => {
          fetchGlobalData();
          setIsNewJobOpen(false);
        }}
      />

      {/* Global Add Printer Modal */}
      <PrinterModal
        isOpen={isAddPrinterOpen}
        onClose={() => setIsAddPrinterOpen(false)}
        onSaved={() => {
          fetchGlobalData();
          setIsAddPrinterOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
