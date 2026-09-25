import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { DBStorage } from '../db/storage.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please provide all required fields.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = DBStorage.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = DBStorage.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    });

    DBStorage.logActivity({
      userId: newUser._id,
      userName: newUser.name,
      action: 'User Registered',
      description: `New user account created: ${newUser.name} (${newUser.email}) with role [${newUser.role}].`,
    });

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error while processing registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = DBStorage.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    DBStorage.logActivity({
      userId: user._id,
      userName: user.name,
      action: 'User Login',
      description: `${user.name} logged into Printing Dashboard.`,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error while processing login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { password: _, ...userSafe } = req.user;
  res.json({ user: userSafe });
});

// GET /api/auth/users (Admin only)
router.get('/users', authenticate, (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  const users = DBStorage.getUsers().map(({ password, ...u }) => u);
  res.json({ users });
});

export default router;
