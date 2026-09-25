import { Router } from 'express';
import { DBStorage } from '../db/storage.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/activities
router.get('/', (req, res) => {
  try {
    const { search, limit = '50', page = '1' } = req.query;
    let activities = DBStorage.getActivities();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      activities = activities.filter(
        a =>
          a.action.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.userName && a.userName.toLowerCase().includes(q))
      );
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const total = activities.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = activities.slice(startIndex, startIndex + limitNum);

    res.json({
      activities: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve activities.' });
  }
});

// POST /api/activities/seed-reset (Reset database to initial seed)
router.post('/seed-reset', authenticate, (req: AuthRequest, res) => {
  try {
    DBStorage.resetToSeed();
    res.json({ message: 'Database reset to initial demo state successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset database.' });
  }
});

// POST /api/simulate/job-progress (Advance queued/printing jobs for live realism)
router.post('/simulate/job-progress', authenticate, (req: AuthRequest, res) => {
  try {
    const jobs = DBStorage.getJobs();
    const active = jobs.find(j => j.status === 'Printing');

    if (active) {
      // Mark as completed
      DBStorage.updateJob(active._id, { status: 'Completed' });
      DBStorage.logActivity({
        userId: req.user?._id || 'usr_anonymous',
        userName: req.user?.name || 'Print Daemon',
        action: 'Job Completed',
        description: `Automated spooler completed printing "${active.documentName}" on ${active.printerName}.`,
        relatedJob: active._id,
        relatedPrinter: active.printerId,
      });

      // If there is a queued job, start printing it
      const nextQueued = DBStorage.getJobs().find(j => j.status === 'Queued');
      if (nextQueued) {
        DBStorage.updateJob(nextQueued._id, { status: 'Printing' });
      }

      res.json({ message: `Job "${active.documentName}" completed!`, completedJob: active });
      return;
    }

    const queued = jobs.find(j => j.status === 'Queued');
    if (queued) {
      DBStorage.updateJob(queued._id, { status: 'Printing' });
      res.json({ message: `Job "${queued.documentName}" is now printing!`, printingJob: queued });
      return;
    }

    res.json({ message: 'No queued jobs to advance. All jobs completed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to advance job simulation.' });
  }
});

export default router;
