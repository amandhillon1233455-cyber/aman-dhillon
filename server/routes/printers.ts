import { Router } from 'express';
import { DBStorage } from '../db/storage.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/printers
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;
    let printers = DBStorage.getPrinters();

    if (status && typeof status === 'string' && status !== 'All') {
      printers = printers.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      printers = printers.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.ipAddress.includes(q)
      );
    }

    res.json({ printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    res.status(500).json({ error: 'Failed to retrieve printers.' });
  }
});

// GET /api/printers/:id
router.get('/:id', (req, res) => {
  try {
    const printer = DBStorage.findPrinterById(req.params.id);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found.' });
      return;
    }
    res.json({ printer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve printer details.' });
  }
});

// GET /api/printers/:id/jobs
router.get('/:id/jobs', (req, res) => {
  try {
    const jobs = DBStorage.getJobs().filter(j => j.printerId === req.params.id);
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve printer jobs.' });
  }
});

// POST /api/printers (Add printer)
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const { name, model, location, ipAddress, status } = req.body;

    if (!name || !model || !location || !ipAddress) {
      res.status(400).json({ error: 'Please provide printer name, model, location, and IP address.' });
      return;
    }

    // IP address validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress.trim())) {
      res.status(400).json({ error: 'Please enter a valid IPv4 address (e.g. 192.168.1.50).' });
      return;
    }

    const newPrinter = DBStorage.createPrinter({
      name: name.trim(),
      model: model.trim(),
      location: location.trim(),
      ipAddress: ipAddress.trim(),
      status: status || 'Online',
      tonerLevel: req.body.tonerLevel ?? 100,
      paperLevel: req.body.paperLevel ?? 100,
      currentError: req.body.currentError || undefined,
    });

    DBStorage.logActivity({
      userId: req.user?._id || 'system',
      userName: req.user?.name || 'Authorized User',
      action: 'Printer Added',
      description: `Added printer "${newPrinter.name}" (${newPrinter.model}) at ${newPrinter.location} [IP: ${newPrinter.ipAddress}].`,
      relatedPrinter: newPrinter._id,
    });

    res.status(201).json({ message: 'Printer added successfully.', printer: newPrinter });
  } catch (error) {
    console.error('Error creating printer:', error);
    res.status(500).json({ error: 'Failed to create printer.' });
  }
});

// PUT /api/printers/:id (Edit printer)
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const printer = DBStorage.findPrinterById(req.params.id);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found.' });
      return;
    }

    const { name, model, location, ipAddress, status, tonerLevel, paperLevel, currentError } = req.body;

    const updated = DBStorage.updatePrinter(req.params.id, {
      ...(name ? { name: name.trim() } : {}),
      ...(model ? { model: model.trim() } : {}),
      ...(location ? { location: location.trim() } : {}),
      ...(ipAddress ? { ipAddress: ipAddress.trim() } : {}),
      ...(status ? { status } : {}),
      ...(tonerLevel !== undefined ? { tonerLevel: Number(tonerLevel) } : {}),
      ...(paperLevel !== undefined ? { paperLevel: Number(paperLevel) } : {}),
      ...(currentError !== undefined ? { currentError } : {}),
    });

    DBStorage.logActivity({
      userId: req.user?._id || 'system',
      userName: req.user?.name || 'Authorized User',
      action: 'Printer Updated',
      description: `Updated configuration for printer "${printer.name}".`,
      relatedPrinter: printer._id,
    });

    res.json({ message: 'Printer updated successfully.', printer: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update printer.' });
  }
});

// PATCH /api/printers/:id/status (Change status / quick action)
router.patch('/:id/status', authenticate, (req: AuthRequest, res) => {
  try {
    const { status, currentError } = req.body;
    const printer = DBStorage.findPrinterById(req.params.id);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found.' });
      return;
    }

    const updates: any = { status };
    if (status === 'Online') {
      updates.currentError = null;
    } else if (currentError) {
      updates.currentError = currentError;
    }

    const updated = DBStorage.updatePrinter(req.params.id, updates);

    DBStorage.logActivity({
      userId: req.user?._id || 'system',
      userName: req.user?.name || 'Authorized User',
      action: 'Printer Status Changed',
      description: `Changed status of "${printer.name}" to ${status}${updates.currentError ? ` (${updates.currentError})` : ''}.`,
      relatedPrinter: printer._id,
    });

    res.json({ message: 'Printer status updated.', printer: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change printer status.' });
  }
});

// DELETE /api/printers/:id (Delete printer)
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const printer = DBStorage.findPrinterById(req.params.id);
    if (!printer) {
      res.status(404).json({ error: 'Printer not found.' });
      return;
    }

    const deleted = DBStorage.deletePrinter(req.params.id);
    if (!deleted) {
      res.status(500).json({ error: 'Unable to remove printer.' });
      return;
    }

    DBStorage.logActivity({
      userId: req.user?._id || 'system',
      userName: req.user?.name || 'Authorized User',
      action: 'Printer Removed',
      description: `Removed printer "${printer.name}" (${printer.model}) from fleet.`,
    });

    res.json({ message: 'Printer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete printer.' });
  }
});

export default router;
