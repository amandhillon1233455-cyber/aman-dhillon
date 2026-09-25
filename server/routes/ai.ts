import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { DBStorage } from '../db/storage.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const reply = await AIService.chatWithFleetContext(message.trim(), history || []);
    res.json({ reply });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI chat query.' });
  }
});

// POST /api/ai/troubleshoot
router.post('/troubleshoot', async (req: AuthRequest, res) => {
  try {
    const { printerId, error: customError } = req.body;
    if (!printerId) {
      res.status(400).json({ error: 'Printer ID is required for AI troubleshooting.' });
      return;
    }

    const diagnosis = await AIService.troubleshootPrinter(printerId, customError);

    // Optionally log that an AI troubleshooting session was run
    const printer = DBStorage.findPrinterById(printerId);
    if (printer) {
      DBStorage.logActivity({
        userId: req.user?._id || 'usr_anonymous',
        userName: req.user?.name || 'System Operator',
        action: 'AI Troubleshooting',
        description: `Generated AI diagnostics for ${printer.name}: "${diagnosis.error}".`,
        relatedPrinter: printer._id,
      });
    }

    res.json({ diagnosis });
  } catch (error: any) {
    console.error('AI troubleshooting error:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI troubleshooting.' });
  }
});

// POST /api/ai/summary
router.post('/summary', async (req: AuthRequest, res) => {
  try {
    const summary = await AIService.generateSummary();

    DBStorage.logActivity({
      userId: req.user?._id || 'usr_anonymous',
      userName: req.user?.name || 'System Operator',
      action: 'AI Summary Generated',
      description: `Generated automated fleet executive summary (${summary.totalJobs} jobs, ${summary.pagesPrinted} pages).`,
    });

    res.json({ summary });
  } catch (error: any) {
    console.error('AI summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI activity summary.' });
  }
});

export default router;
