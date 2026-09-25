import {
  User,
  Printer,
  PrintJob,
  DocumentFile,
  Activity,
  AnalyticsOverview,
  PrintingAnalytics,
  PrinterUtilStats,
  TroubleshootResult,
  SummaryResult,
} from '../types/index.ts';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('printai_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (payload: { name: string; email: string; password: string; confirmPassword?: string }) =>
      request<{ token: string; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMe: () => request<{ user: User }>('/auth/me'),

    getUsers: () => request<{ users: User[] }>('/auth/users'),
  },

  // Printers
  printers: {
    getAll: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      return request<{ printers: Printer[] }>(`/printers?${q.toString()}`);
    },

    getById: (id: string) => request<{ printer: Printer }>(`/printers/${id}`),

    getJobs: (id: string) => request<{ jobs: PrintJob[] }>(`/printers/${id}/jobs`),

    create: (data: { name: string; model: string; location: string; ipAddress: string; status?: string; tonerLevel?: number; paperLevel?: number }) =>
      request<{ printer: Printer; message: string }>('/printers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Printer>) =>
      request<{ printer: Printer; message: string }>(`/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string, currentError?: string) =>
      request<{ printer: Printer; message: string }>(`/printers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, currentError }),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/printers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Print Jobs
  jobs: {
    getAll: (params?: { status?: string; printerId?: string; search?: string; sort?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.printerId) q.append('printerId', params.printerId);
      if (params?.search) q.append('search', params.search);
      if (params?.sort) q.append('sort', params.sort);
      return request<{ jobs: PrintJob[] }>(`/jobs?${q.toString()}`);
    },

    getById: (id: string) => request<{ job: PrintJob }>(`/jobs/${id}`),

    create: (data: { documentName: string; printerId: string; pages: number; copies: number; colorMode: 'Color' | 'Black & White' }) =>
      request<{ job: PrintJob; message: string }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<PrintJob>) =>
      request<{ job: PrintJob; message: string }>(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string, errorMessage?: string) =>
      request<{ job: PrintJob; message: string }>(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, errorMessage }),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/jobs/${id}`, {
        method: 'DELETE',
      }),
  },

  // Documents
  documents: {
    getAll: () => request<{ documents: DocumentFile[] }>('/documents'),

    upload: (file: File, pages?: number) => {
      const formData = new FormData();
      formData.append('file', file);
      if (pages) formData.append('pages', String(pages));
      return request<{ document: DocumentFile; message: string }>('/documents', {
        method: 'POST',
        body: formData,
      });
    },

    delete: (id: string) =>
      request<{ message: string }>(`/documents/${id}`, {
        method: 'DELETE',
      }),
  },

  // Analytics
  analytics: {
    getOverview: () => request<AnalyticsOverview>('/analytics/overview'),

    getPrintingTrends: (range: '7d' | '30d' = '7d') =>
      request<PrintingAnalytics>(`/analytics/printing?range=${range}`),

    getPrinterStats: () => request<{ printers: PrinterUtilStats[] }>('/analytics/printers'),
  },

  // AI Services
  ai: {
    chat: (message: string, history?: Array<{ role: 'user' | 'assistant'; text: string }>) =>
      request<{ reply: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),

    troubleshoot: (printerId: string, error?: string) =>
      request<{ diagnosis: TroubleshootResult }>('/ai/troubleshoot', {
        method: 'POST',
        body: JSON.stringify({ printerId, error }),
      }),

    generateSummary: () =>
      request<{ summary: SummaryResult }>('/ai/summary', {
        method: 'POST',
      }),
  },

  // Activity & Simulation
  activity: {
    getAll: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      return request<{ activities: Activity[]; total: number; page: number; totalPages: number }>(`/activities?${q.toString()}`);
    },

    resetSeedData: () =>
      request<{ message: string }>('/activities/seed-reset', {
        method: 'POST',
      }),

    advanceJobSimulation: () =>
      request<{ message: string; completedJob?: PrintJob; printingJob?: PrintJob }>('/simulate/job-progress', {
        method: 'POST',
      }),
  },
};
