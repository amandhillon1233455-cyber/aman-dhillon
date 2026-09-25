import mongoose, { Schema } from 'mongoose';

// User Schema
export interface IUserDocument {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

// Printer Schema
export interface IPrinterDocument {
  name: string;
  model: string;
  location: string;
  ipAddress: string;
  status: 'Online' | 'Offline' | 'Printing' | 'Error' | 'Maintenance';
  pagesPrinted: number;
  currentJob?: string;
  lastSeen: Date;
  tonerLevel?: number;
  paperLevel?: number;
  currentError?: string;
  createdAt: Date;
}

const PrinterSchema = new Schema<IPrinterDocument>({
  name: { type: String, required: true },
  model: { type: String, required: true },
  location: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Online', 'Offline', 'Printing', 'Error', 'Maintenance'],
    default: 'Online'
  },
  pagesPrinted: { type: Number, default: 0 },
  currentJob: { type: String },
  lastSeen: { type: Date, default: Date.now },
  tonerLevel: { type: Number, default: 100 },
  paperLevel: { type: Number, default: 100 },
  currentError: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const PrinterModel = mongoose.models.Printer || mongoose.model<IPrinterDocument>('Printer', PrinterSchema);

// PrintJob Schema
export interface IPrintJobDocument {
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
  createdAt: Date;
  completedAt?: Date;
}

const PrintJobSchema = new Schema<IPrintJobDocument>({
  documentName: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String },
  userEmail: { type: String },
  printerId: { type: String, required: true },
  printerName: { type: String },
  pages: { type: Number, required: true, min: 1 },
  copies: { type: Number, default: 1, min: 1 },
  colorMode: { type: String, enum: ['Color', 'Black & White'], default: 'Black & White' },
  status: { 
    type: String, 
    enum: ['Queued', 'Printing', 'Completed', 'Failed', 'Cancelled'], 
    default: 'Queued' 
  },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const PrintJobModel = mongoose.models.PrintJob || mongoose.model<IPrintJobDocument>('PrintJob', PrintJobSchema);

// Document Schema
export interface IDocFileDocument {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  pages: number;
  userId: string;
  userName?: string;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocFileDocument>({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  pages: { type: Number, default: 1 },
  userId: { type: String, required: true },
  userName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocFileDocument>('Document', DocumentSchema);

// Activity Schema
export interface IActivityDocument {
  userId: string;
  userName?: string;
  action: string;
  description: string;
  relatedJob?: string;
  relatedPrinter?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivityDocument>({
  userId: { type: String, required: true },
  userName: { type: String },
  action: { type: String, required: true },
  description: { type: String, required: true },
  relatedJob: { type: String },
  relatedPrinter: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const ActivityModel = mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', ActivitySchema);
