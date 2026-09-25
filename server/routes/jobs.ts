import { Router } from 'express';
import { DBStorage } from '../db/storage.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/jobs
router.get('/', (req, res) => {
  try {
    const { status, printerId, search, sort = 'desc' } = req.query;
    let jobs = DBStorage.getJobs();

    if (status && typeof status === 'string' && status !== 'All') {
      jobs = jobs.filter(j => j.status.toLowerCase() === status.toLowerCase());
    }

    if (printerId && typeof printerId === 'string' && printerId !== 'All') {
      jobs = jobs.filter(j => j.printerId === printerId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        j =>
          j.documentName.toLowerCase().includes(q) ||
          (j.userName && j.userName.toLowerCase().includes(q)) ||
          (j.printerName && j.printerName.toLowerCase().includes(q))
      );
    }

    if (sort === 'asc') {
      jobs = [...jobs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      jobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to retrieve print jobs.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  try {
    const job = DBStorage.findJobById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Print job not found.' });
      return;
    }
    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve job details.' });
  }
});

// POST /api/jobs (Create print job)
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const { documentName, printerId, pages = 1, copies = 1, colorMode = 'Black & White' } = req.body;

    if (!documentName || !printerId) {
      res.status(400).json({ error: 'Document name and target printer are required.' });
      return;
    }

    const printer = DBStorage.findPrinterById(printerId);
    if (!printer) {
      res.status(400).json({ error: 'Selected printer does not exist.' });
      return;
    }

    if (printer.status === 'Offline') {
      res.status(400).json({ error: `Cannot dispatch to ${printer.name}: Printer is currently Offline.` });
      return;
    }

    const newJob = DBStorage.createJob({
      documentName: documentName.trim(),
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      userEmail: req.user?.email || 'user@printai.io',
      printerId: printer._id,
      printerName: printer.name,
      pages: Math.max(1, Number(pages)),
      copies: Math.max(1, Number(copies)),
      colorMode: colorMode === 'Color' ? 'Color' : 'Black & White',
      status: printer.status === 'Online' ? 'Printing' : 'Queued',
    });

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      action: 'Print Job Queued',
      description: `Dispatched "${newJob.documentName}" (${newJob.pages} pages, ${newJob.copies} copies) to ${printer.name}.`,
      relatedJob: newJob._id,
      relatedPrinter: printer._id,
    });

    res.status(201).json({ message: 'Print job created successfully.', job: newJob });
  } catch (error) {
    console.error('Error creating print job:', error);
    res.status(500).json({ error: 'Failed to create print job.' });
  }
});

// PUT /api/jobs/:id (Update job)
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const job = DBStorage.findJobById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Print job not found.' });
      return;
    }

    const { pages, copies, colorMode, printerId } = req.body;
    const updates: any = {};
    if (pages) updates.pages = Math.max(1, Number(pages));
    if (copies) updates.copies = Math.max(1, Number(copies));
    if (colorMode) updates.colorMode = colorMode;
    if (printerId) {
      const printer = DBStorage.findPrinterById(printerId);
      if (printer) {
        updates.printerId = printer._id;
        updates.printerName = printer.name;
      }
    }

    const updated = DBStorage.updateJob(req.params.id, updates);
    res.json({ message: 'Job updated.', job: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update print job.' });
  }
});

// PATCH /api/jobs/:id/status (Change status: Completed, Cancelled, Failed, etc.)
router.patch('/:id/status', authenticate, (req: AuthRequest, res) => {
  try {
    const { status, errorMessage } = req.body;
    const job = DBStorage.findJobById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Print job not found.' });
      return;
    }

    const updates: any = { status };
    if (errorMessage !== undefined) {
      updates.errorMessage = errorMessage;
    }

    const updated = DBStorage.updateJob(req.params.id, updates);

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      action: `Job Status: ${status}`,
      description: `Job "${job.documentName}" transitioned to status [${status}].${errorMessage ? ` Reason: ${errorMessage}` : ''}`,
      relatedJob: job._id,
      relatedPrinter: job.printerId,
    });

    res.json({ message: `Job marked as ${status}.`, job: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job status.' });
  }
});

// DELETE /api/jobs/:id (Delete print job)
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const job = DBStorage.findJobById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Print job not found.' });
      return;
    }

    const deleted = DBStorage.deleteJob(req.params.id);
    if (!deleted) {
      res.status(500).json({ error: 'Unable to remove job.' });
      return;
    }

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'Authorized User',
      action: 'Job Removed',
      description: `Deleted record for job "${job.documentName}" (ID: ${job._id}).`,
    });

    res.json({ message: 'Print job deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete print job.' });
  }
});

export default router;
