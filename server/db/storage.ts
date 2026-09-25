import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface IPrinter {
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

export interface IPrintJob {
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

export interface IDocument {
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

export interface IActivity {
  _id: string;
  userId: string;
  userName?: string;
  action: string;
  description: string;
  relatedJob?: string;
  relatedPrinter?: string;
  createdAt: string;
}

interface DBData {
  users: IUser[];
  printers: IPrinter[];
  jobs: IPrintJob[];
  documents: IDocument[];
  activities: IActivity[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB(): DBData {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse db.json, creating new database state', e);
    }
  }

  const initialData = getInitialSeedData();
  saveDB(initialData);
  return initialData;
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

export function getInitialSeedData(): DBData {
  const adminHashedPassword = bcrypt.hashSync('admin123', 10);
  const userHashedPassword = bcrypt.hashSync('user123', 10);

  const now = new Date();
  const dateStr = (offsetHours: number = 0) => {
    const d = new Date(now.getTime() - offsetHours * 3600 * 1000);
    return d.toISOString();
  };

  const users: IUser[] = [
    {
      _id: 'usr_admin_01',
      name: 'System Administrator',
      email: 'admin@printai.io',
      password: adminHashedPassword,
      role: 'admin',
      createdAt: dateStr(168),
    },
    {
      _id: 'usr_sarah_02',
      name: 'Sarah Jenkins',
      email: 'sarah@printai.io',
      password: userHashedPassword,
      role: 'user',
      createdAt: dateStr(120),
    },
    {
      _id: 'usr_marcus_03',
      name: 'Marcus Chen',
      email: 'marcus@printai.io',
      password: userHashedPassword,
      role: 'user',
      createdAt: dateStr(96),
    },
  ];

  const printers: IPrinter[] = [
    {
      _id: 'prn_01',
      name: 'Executive HP LaserJet Enterprise',
      model: 'HP LaserJet Enterprise M608dn',
      location: 'HQ Floor 4 - Executive Suite',
      ipAddress: '192.168.1.101',
      status: 'Printing',
      pagesPrinted: 14820,
      currentJob: 'Q3_Financial_Forecast_Final.pdf',
      lastSeen: dateStr(0.1),
      tonerLevel: 78,
      paperLevel: 85,
      createdAt: dateStr(300),
    },
    {
      _id: 'prn_02',
      name: 'Design Canon imageRUNNER',
      model: 'Canon imageRUNNER ADVANCE DX C3835i',
      location: 'HQ Floor 2 - Creative Studio',
      ipAddress: '192.168.1.102',
      status: 'Error',
      pagesPrinted: 23410,
      currentJob: 'Brand_Guidelines_Booklet_v2.pdf',
      currentError: 'Paper Jam in Tray 2 - Media Sensor Obstruction [Code: E-102]',
      lastSeen: dateStr(0.2),
      tonerLevel: 42,
      paperLevel: 15,
      createdAt: dateStr(320),
    },
    {
      _id: 'prn_03',
      name: 'Engineering Brother Monochrome',
      model: 'Brother HL-L8360CDW High-Yield',
      location: 'Engineering Lab 3A',
      ipAddress: '192.168.1.103',
      status: 'Online',
      pagesPrinted: 9840,
      lastSeen: dateStr(0.05),
      tonerLevel: 91,
      paperLevel: 94,
      createdAt: dateStr(280),
    },
    {
      _id: 'prn_04',
      name: 'Ops Xerox VersaLink Multifunction',
      model: 'Xerox VersaLink C405/DN',
      location: 'Warehouse Operations Desk',
      ipAddress: '192.168.1.104',
      status: 'Online',
      pagesPrinted: 31200,
      lastSeen: dateStr(0.3),
      tonerLevel: 65,
      paperLevel: 70,
      createdAt: dateStr(350),
    },
    {
      _id: 'prn_05',
      name: 'Marketing Epson WorkForce Pro',
      model: 'Epson WorkForce Pro WF-C5790',
      location: 'HQ Floor 1 - Marketing Annex',
      ipAddress: '192.168.1.105',
      status: 'Maintenance',
      pagesPrinted: 18450,
      currentError: 'Scheduled Fuser Roller Replacement Recommended',
      lastSeen: dateStr(2.5),
      tonerLevel: 12,
      paperLevel: 45,
      createdAt: dateStr(360),
    },
    {
      _id: 'prn_06',
      name: 'Reception Desk Compact',
      model: 'HP LaserJet Pro M404dn',
      location: 'Building Lobby Reception',
      ipAddress: '192.168.1.106',
      status: 'Offline',
      pagesPrinted: 6200,
      currentError: 'Device Unreachable / Network Timeout (No ping response)',
      lastSeen: dateStr(18),
      tonerLevel: 55,
      paperLevel: 60,
      createdAt: dateStr(200),
    },
  ];

  const jobs: IPrintJob[] = [
    {
      _id: 'job_01',
      documentName: 'Q3_Financial_Forecast_Final.pdf',
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      userEmail: 'admin@printai.io',
      printerId: 'prn_01',
      printerName: 'Executive HP LaserJet Enterprise',
      pages: 42,
      copies: 3,
      colorMode: 'Color',
      status: 'Printing',
      createdAt: dateStr(0.2),
    },
    {
      _id: 'job_02',
      documentName: 'Brand_Guidelines_Booklet_v2.pdf',
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah@printai.io',
      printerId: 'prn_02',
      printerName: 'Design Canon imageRUNNER',
      pages: 18,
      copies: 5,
      colorMode: 'Color',
      status: 'Failed',
      errorMessage: 'Paper Jam in Tray 2 - Media Sensor Obstruction [Code: E-102]',
      createdAt: dateStr(0.8),
    },
    {
      _id: 'job_03',
      documentName: 'Microservices_Architecture_v4.pdf',
      userId: 'usr_marcus_03',
      userName: 'Marcus Chen',
      userEmail: 'marcus@printai.io',
      printerId: 'prn_03',
      printerName: 'Engineering Brother Monochrome',
      pages: 12,
      copies: 1,
      colorMode: 'Black & White',
      status: 'Completed',
      createdAt: dateStr(1.5),
      completedAt: dateStr(1.4),
    },
    {
      _id: 'job_04',
      documentName: 'Global_Supply_Chain_Bill_of_Lading_8819.pdf',
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah@printai.io',
      printerId: 'prn_04',
      printerName: 'Ops Xerox VersaLink Multifunction',
      pages: 4,
      copies: 10,
      colorMode: 'Black & White',
      status: 'Completed',
      createdAt: dateStr(3.2),
      completedAt: dateStr(3.1),
    },
    {
      _id: 'job_05',
      documentName: 'Client_NDA_Confidential_B2B.pdf',
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      userEmail: 'admin@printai.io',
      printerId: 'prn_01',
      printerName: 'Executive HP LaserJet Enterprise',
      pages: 6,
      copies: 2,
      colorMode: 'Black & White',
      status: 'Completed',
      createdAt: dateStr(5.0),
      completedAt: dateStr(4.9),
    },
    {
      _id: 'job_06',
      documentName: 'Sprint_Retrospective_Notes.pdf',
      userId: 'usr_marcus_03',
      userName: 'Marcus Chen',
      userEmail: 'marcus@printai.io',
      printerId: 'prn_03',
      printerName: 'Engineering Brother Monochrome',
      pages: 3,
      copies: 4,
      colorMode: 'Black & White',
      status: 'Queued',
      createdAt: dateStr(0.1),
    },
    {
      _id: 'job_07',
      documentName: 'Product_Catalog_Fall2026.pdf',
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah@printai.io',
      printerId: 'prn_05',
      printerName: 'Marketing Epson WorkForce Pro',
      pages: 36,
      copies: 2,
      colorMode: 'Color',
      status: 'Cancelled',
      errorMessage: 'User cancelled job prior to batch spooling',
      createdAt: dateStr(8.5),
    },
    {
      _id: 'job_08',
      documentName: 'Visitor_Badge_Passports.pdf',
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      userEmail: 'admin@printai.io',
      printerId: 'prn_06',
      printerName: 'Reception Desk Compact',
      pages: 2,
      copies: 1,
      colorMode: 'Black & White',
      status: 'Failed',
      errorMessage: 'Communication timeout: Destination host unreachable (192.168.1.106)',
      createdAt: dateStr(17.5),
    },
  ];

  const documents: IDocument[] = [
    {
      _id: 'doc_01',
      fileName: 'Q3_Financial_Forecast_Final.pdf',
      fileType: 'application/pdf',
      fileSize: 2450000,
      filePath: '/uploads/Q3_Financial_Forecast_Final.pdf',
      pages: 42,
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      createdAt: dateStr(24),
    },
    {
      _id: 'doc_02',
      fileName: 'Brand_Guidelines_Booklet_v2.pdf',
      fileType: 'application/pdf',
      fileSize: 6820000,
      filePath: '/uploads/Brand_Guidelines_Booklet_v2.pdf',
      pages: 18,
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      createdAt: dateStr(48),
    },
    {
      _id: 'doc_03',
      fileName: 'Microservices_Architecture_v4.pdf',
      fileType: 'application/pdf',
      fileSize: 1150000,
      filePath: '/uploads/Microservices_Architecture_v4.pdf',
      pages: 12,
      userId: 'usr_marcus_03',
      userName: 'Marcus Chen',
      createdAt: dateStr(72),
    },
    {
      _id: 'doc_04',
      fileName: 'Office_Health_Safety_Checklist.pdf',
      fileType: 'application/pdf',
      fileSize: 420000,
      filePath: '/uploads/Office_Health_Safety_Checklist.pdf',
      pages: 5,
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      createdAt: dateStr(96),
    },
    {
      _id: 'doc_05',
      fileName: 'Equipment_Purchase_Invoice_Oct.pdf',
      fileType: 'application/pdf',
      fileSize: 850000,
      filePath: '/uploads/Equipment_Purchase_Invoice_Oct.pdf',
      pages: 2,
      userId: 'usr_marcus_03',
      userName: 'Marcus Chen',
      createdAt: dateStr(110),
    },
  ];

  const activities: IActivity[] = [
    {
      _id: 'act_01',
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      action: 'Job Dispatched',
      description: 'Submitted 42-page document "Q3_Financial_Forecast_Final.pdf" (3 copies, Color) to Executive HP LaserJet Enterprise.',
      relatedJob: 'job_01',
      relatedPrinter: 'prn_01',
      createdAt: dateStr(0.2),
    },
    {
      _id: 'act_02',
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      action: 'Printer Error Detected',
      description: 'Design Canon imageRUNNER reported "Paper Jam in Tray 2 - Media Sensor Obstruction [Code: E-102]". Job halted.',
      relatedJob: 'job_02',
      relatedPrinter: 'prn_02',
      createdAt: dateStr(0.8),
    },
    {
      _id: 'act_03',
      userId: 'usr_marcus_03',
      userName: 'Marcus Chen',
      action: 'Job Completed',
      description: 'Successfully printed 12 pages of "Microservices_Architecture_v4.pdf" on Engineering Brother Monochrome.',
      relatedJob: 'job_03',
      relatedPrinter: 'prn_03',
      createdAt: dateStr(1.4),
    },
    {
      _id: 'act_04',
      userId: 'usr_sarah_02',
      userName: 'Sarah Jenkins',
      action: 'Job Completed',
      description: 'Completed 40 total pages (10 copies) of "Global_Supply_Chain_Bill_of_Lading_8819.pdf" on Ops Xerox VersaLink.',
      relatedJob: 'job_04',
      relatedPrinter: 'prn_04',
      createdAt: dateStr(3.1),
    },
    {
      _id: 'act_05',
      userId: 'usr_admin_01',
      userName: 'System Administrator',
      action: 'Printer Added',
      description: 'Registered new network printer "Marketing Epson WorkForce Pro" with IP 192.168.1.105.',
      relatedPrinter: 'prn_05',
      createdAt: dateStr(24),
    },
  ];

  return { users, printers, jobs, documents, activities };
}

// In-memory + persisted storage helper
export class DBStorage {
  private static data: DBData = loadDB();

  public static reload() {
    this.data = loadDB();
  }

  public static persist() {
    saveDB(this.data);
  }

  public static resetToSeed() {
    this.data = getInitialSeedData();
    saveDB(this.data);
    return this.data;
  }

  // Users
  public static getUsers(): IUser[] {
    return this.data.users;
  }

  public static findUserById(id: string): IUser | undefined {
    return this.data.users.find(u => u._id === id);
  }

  public static findUserByEmail(email: string): IUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static createUser(user: Omit<IUser, '_id' | 'createdAt'>): IUser {
    const newUser: IUser = {
      ...user,
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // Printers
  public static getPrinters(): IPrinter[] {
    return this.data.printers;
  }

  public static findPrinterById(id: string): IPrinter | undefined {
    return this.data.printers.find(p => p._id === id);
  }

  public static createPrinter(printer: Omit<IPrinter, '_id' | 'createdAt' | 'pagesPrinted' | 'lastSeen'>): IPrinter {
    const newPrinter: IPrinter = {
      ...printer,
      _id: `prn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pagesPrinted: 0,
      lastSeen: new Date().toISOString(),
      tonerLevel: printer.tonerLevel ?? 100,
      paperLevel: printer.paperLevel ?? 100,
      createdAt: new Date().toISOString(),
    };
    this.data.printers.push(newPrinter);
    this.persist();
    return newPrinter;
  }

  public static updatePrinter(id: string, updates: Partial<IPrinter>): IPrinter | null {
    const idx = this.data.printers.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.data.printers[idx] = {
      ...this.data.printers[idx],
      ...updates,
      lastSeen: new Date().toISOString(),
    };
    this.persist();
    return this.data.printers[idx];
  }

  public static deletePrinter(id: string): boolean {
    const initialLen = this.data.printers.length;
    this.data.printers = this.data.printers.filter(p => p._id !== id);
    if (this.data.printers.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Jobs
  public static getJobs(): IPrintJob[] {
    return [...this.data.jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static findJobById(id: string): IPrintJob | undefined {
    return this.data.jobs.find(j => j._id === id);
  }

  public static createJob(job: Omit<IPrintJob, '_id' | 'createdAt'>): IPrintJob {
    const newJob: IPrintJob = {
      ...job,
      _id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.jobs.push(newJob);

    // If assigned to a printer, increment printer stats
    const printer = this.data.printers.find(p => p._id === job.printerId);
    if (printer) {
      printer.lastSeen = new Date().toISOString();
      if (job.status === 'Printing') {
        printer.status = 'Printing';
        printer.currentJob = job.documentName;
      }
    }

    this.persist();
    return newJob;
  }

  public static updateJob(id: string, updates: Partial<IPrintJob>): IPrintJob | null {
    const idx = this.data.jobs.findIndex(j => j._id === id);
    if (idx === -1) return null;

    const oldStatus = this.data.jobs[idx].status;
    const updatedJob: IPrintJob = {
      ...this.data.jobs[idx],
      ...updates,
    };

    if (updates.status === 'Completed' && oldStatus !== 'Completed') {
      updatedJob.completedAt = new Date().toISOString();
      const printer = this.data.printers.find(p => p._id === updatedJob.printerId);
      if (printer) {
        printer.pagesPrinted += (updatedJob.pages * (updatedJob.copies || 1));
        if (printer.paperLevel && printer.paperLevel > 5) {
          printer.paperLevel = Math.max(1, printer.paperLevel - Math.ceil(updatedJob.pages / 10));
        }
        if (printer.status === 'Printing') {
          printer.status = 'Online';
          delete printer.currentJob;
        }
      }
    }

    this.data.jobs[idx] = updatedJob;
    this.persist();
    return updatedJob;
  }

  public static deleteJob(id: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => j._id !== id);
    if (this.data.jobs.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Documents
  public static getDocuments(): IDocument[] {
    return [...this.data.documents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static findDocumentById(id: string): IDocument | undefined {
    return this.data.documents.find(d => d._id === id);
  }

  public static createDocument(doc: Omit<IDocument, '_id' | 'createdAt'>): IDocument {
    const newDoc: IDocument = {
      ...doc,
      _id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.documents.push(newDoc);
    this.persist();
    return newDoc;
  }

  public static deleteDocument(id: string): boolean {
    const initialLen = this.data.documents.length;
    this.data.documents = this.data.documents.filter(d => d._id !== id);
    if (this.data.documents.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Activities
  public static getActivities(): IActivity[] {
    return [...this.data.activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static logActivity(activity: Omit<IActivity, '_id' | 'createdAt'>): IActivity {
    const newAct: IActivity = {
      ...activity,
      _id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.activities.unshift(newAct);
    // Keep max 200 activities
    if (this.data.activities.length > 200) {
      this.data.activities = this.data.activities.slice(0, 200);
    }
    this.persist();
    return newAct;
  }
}
