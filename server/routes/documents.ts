import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DBStorage } from '../db/storage.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMime.includes(file.mimetype) || file.originalname.match(/\.(pdf|png|jpe?g|webp|txt|docx?)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, PNG, JPG, or TXT documents.'));
    }
  },
});

// GET /api/documents
router.get('/', (req, res) => {
  try {
    const documents = DBStorage.getDocuments();
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve documents.' });
  }
});

// POST /api/documents
router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const pages = req.body.pages ? Number(req.body.pages) : Math.max(1, Math.round(req.file.size / 60000));
    const newDoc = DBStorage.createDocument({
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: `/uploads/${req.file.filename}`,
      pages,
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
    });

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      action: 'Document Uploaded',
      description: `Uploaded document "${newDoc.fileName}" (${(newDoc.fileSize / (1024 * 1024)).toFixed(2)} MB, ~${newDoc.pages} pages).`,
    });

    res.status(201).json({ message: 'Document uploaded successfully.', document: newDoc });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'File upload failed.' });
  }
});

// GET /api/documents/:id (preview / info)
router.get('/:id', (req, res) => {
  try {
    const doc = DBStorage.findDocumentById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    const physicalPath = path.resolve(process.cwd(), doc.filePath.replace(/^\//, ''));
    if (fs.existsSync(physicalPath)) {
      res.sendFile(physicalPath);
    } else {
      res.json({ document: doc, note: 'Sample document metadata preview' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve document file.' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const doc = DBStorage.findDocumentById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    const physicalPath = path.resolve(process.cwd(), doc.filePath.replace(/^\//, ''));
    if (fs.existsSync(physicalPath)) {
      try {
        fs.unlinkSync(physicalPath);
      } catch (e) {
        console.warn('Could not remove physical file:', e);
      }
    }

    DBStorage.deleteDocument(req.params.id);

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      action: 'Document Deleted',
      description: `Deleted document "${doc.fileName}".`,
    });

    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});

export default router;
