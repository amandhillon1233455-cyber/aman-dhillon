export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Printer {
  _id: string;
  name: string;
  model: string;
  location: string;
  ipAddress: string;
  status: 'Online' | 'Offline' | 'Printing' | 'Error' | 'Maintenance';
  pagesPrinted: number;
  currentJob?: string;
  lastSeen: string;
  tonerLevel?: number;
  paperLevel?: number;
  currentError?: string;
  createdAt: string;
}

export interface PrintJob {
  _id: string;
  documentName: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  printerId: string;
  printerName?: string;
  pages: number;
  copies: number;
  colorMode: 'Color' | 'Black & White';
  status: 'Queued' | 'Printing' | 'Completed' | 'Failed' | 'Cancelled';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DocumentFile {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  pages: number;
  userId: string;
  userName?: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  userId: string;
  userName?: string;
  action: string;
  description: string;
  relatedJob?: string;
  relatedPrinter?: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalPrinters: number;
  onlinePrinters: number;
  errorPrinters: number;
  offlinePrinters: number;
  maintenancePrinters: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  pagesPrinted: number;
  avgPagesPerJob: number;
  mostUsedPrinter: string;
  uptimePercentage: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  completed: number;
  failed: number;
  pages: number;
}

export interface PrintingAnalytics {
  timeSeries: TimeSeriesPoint[];
  colorDistribution: Array<{ name: string; count: number; percentage: number }>;
}

export interface PrinterUtilStats {
  id: string;
  name: string;
  model: string;
  location: string;
  status: 'Online' | 'Offline' | 'Printing' | 'Error' | 'Maintenance';
  pagesPrinted: number;
  tonerLevel: number;
  paperLevel: number;
  jobCount: number;
  completed: number;
  failed: number;
  active: number;
}

export interface TroubleshootResult {
  printerName: string;
  model: string;
  error: string;
  explanation: string;
  possibleCauses: string[];
  recommendedSteps: string[];
  whenToContactSupport: string;
  confidenceScore: number;
}

export interface SummaryResult {
  period: string;
  generatedAt: string;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pagesPrinted: number;
  activeIssuesCount: number;
  executiveSummary: string;
  printerHealthInsights: string[];
  recommendations: string[];
}
