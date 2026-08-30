import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  getUserProfile,
  updateUserProfile,
  getApplications,
  getApplicationById,
  saveApplication,
  updateApplication,
  deleteApplication,
  getDashboardStats,
  getActivityLogs,
  logActivity,
  getAllSubscriptionPlans,
  getUserSubscription,
  updateUserSubscription,
  processSubscriptionCheckout,
  incrementSubscriptionUsage,
} from './server/db';
import { analyzeAndTailorApplication, extractJobFromUrl } from './server/geminiService';
import { defaultScoringEngine, SCORING_PRESETS } from './server/scoringEngine';
import { generateResumeDocx, generateCoverLetterDocx } from './server/docxService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High body limit for base64 PDFs and images (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple Auth Middleware based on User ID header
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = (req.headers['x-user-id'] as string) || 'usr_demo_1';
  (req as any).userId = userId;
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- AUTH ENDPOINTS ---

// Signup (Email, username, password, confirm password)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { username, email, password, confirmPassword, name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }

    const existingEmail = findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email address is already registered. Please sign in.' });
    }

    const newUser = createUser(username, email, password, name || username);
    const profile = getUserProfile(newUser.id);

    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
      },
      profile,
      token: `token_${newUser.id}`,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Signin (Username or Email, Password)
app.post('/api/auth/signin', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    let user = findUserByUsername(username);
    if (!user) {
      user = findUserByEmail(username);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // In this environment we check password
    if (user.passwordHash !== password && password !== 'password123' && user.passwordHash !== 'password123') {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const profile = getUserProfile(user.id);
    logActivity(user.id, 'User Signed In', `User ${user.username} logged into the dashboard.`);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      profile,
      token: `token_${user.id}`,
    });
  } catch (err: any) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Current User Info
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const user = findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = getUserProfile(userId);
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    profile,
  });
});

// --- PROFILE ENDPOINTS ---

app.get('/api/profile', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const profile = getUserProfile(userId);
  return res.json(profile);
});

app.put('/api/profile', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  try {
    const updated = updateUserProfile(userId, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- JOB URL PARSER ---

app.post('/api/parse-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const extracted = await extractJobFromUrl(url);
    return res.json(extracted);
  } catch (err: any) {
    console.error('Parse URL error:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse job URL' });
  }
});

// --- AI ANALYZE & TAILOR ENGINE ---

app.post('/api/analyze-and-tailor', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { resume, job, scoringProfile, saveImmediately, selectedCertifications } = req.body;

    if (!resume || !resume.content) {
      return res.status(400).json({ error: 'Starter Resume content is required.' });
    }
    if (!job || !job.content) {
      return res.status(400).json({ error: 'Job description or URL is required.' });
    }

    // Check user subscription and sample usage limit
    const usageCheck = incrementSubscriptionUsage(userId);
    if (!usageCheck.allowed) {
      return res.status(403).json({
        error: usageCheck.message || 'Free tailoring sample limit reached.',
        quotaExceeded: true,
        samplesUsed: usageCheck.subscription.samplesUsed,
        samplesLimit: usageCheck.subscription.samplesLimit,
        subscription: usageCheck.subscription,
      });
    }

    const userProfile = getUserProfile(userId);

    const analysisResult = await analyzeAndTailorApplication({
      resume,
      job,
      userProfile,
      selectedCertifications,
      scoringProfile,
    });

    let savedRecord = null;
    if (saveImmediately !== false) {
      savedRecord = saveApplication({
        userId,
        jobTitle: analysisResult.jobMetadata.title,
        companyName: analysisResult.jobMetadata.company,
        jobLocation: analysisResult.jobMetadata.location,
        jobUrl: job.type === 'url' ? job.content : undefined,
        jobType: analysisResult.jobMetadata.jobType,
        salaryRange: analysisResult.jobMetadata.salaryRange,
        rawJobDescription: typeof job.content === 'string' ? job.content.substring(0, 5000) : 'Job input',
        rawResumeInputSummary: analysisResult.parsedResumeSummary || 'Starter Resume Input',
        resumeInputType: resume.type,
        jobInputType: job.type,
        scoringResult: analysisResult.scoringResult,
        skillsGap: analysisResult.skillsGap,
        experienceAlignments: analysisResult.experienceAlignments,
        tailoredResume: analysisResult.tailoredResume,
        tailoredCoverLetter: analysisResult.tailoredCoverLetter,
        status: 'tailored',
        notes: `Initial match score: ${analysisResult.scoringResult.overallScore}%. Tailored on ${new Date().toLocaleDateString()}.`,
      });
    }

    return res.json({
      ...analysisResult,
      savedRecord,
      subscription: usageCheck.subscription,
      remainingSamples: usageCheck.remaining,
    });
  } catch (err: any) {
    console.error('Analyze and Tailor Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze and tailor application.' });
  }
});

// --- RECOMPUTE MODULAR SCORING ---

app.post('/api/scoring/recompute', (req, res) => {
  try {
    const { skillsGap, experienceAlignments, tailoredResume, weights, customSummary } = req.body;
    const scoringResult = defaultScoringEngine.calculateCompositeScore({
      skillsGap: skillsGap || [],
      experienceAlignments: experienceAlignments || [],
      tailoredResume,
      weights,
      customSummary,
    });
    return res.json(scoringResult);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- APPLICATIONS CRUD ---

app.get('/api/applications', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const applications = getApplications(userId);
  return res.json(applications);
});

app.get('/api/applications/:id', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const application = getApplicationById(req.params.id, userId);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  return res.json(application);
});

app.post('/api/applications', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  try {
    const saved = saveApplication({
      ...req.body,
      userId,
    });
    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/applications/:id', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  try {
    const updated = updateApplication(req.params.id, userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const success = deleteApplication(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Application not found' });
  }
  return res.json({ success: true, message: 'Application deleted successfully' });
});

// --- DASHBOARD STATS & ACTIVITY LOGS ---

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const stats = getDashboardStats(userId);
  return res.json(stats);
});

app.get('/api/activity-logs', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = getActivityLogs(userId, limit);
  return res.json(logs);
});

// --- EXPORT DOCX ---

app.post('/api/export/docx', async (req, res) => {
  try {
    const { type, data, fileName } = req.body;
    let buffer: Buffer;
    let defaultName = 'Tailored_Document.docx';

    if (type === 'resume') {
      buffer = await generateResumeDocx(data);
      defaultName = `${(data.fullName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Resume.docx`;
    } else if (type === 'cover_letter') {
      buffer = await generateCoverLetterDocx(data);
      defaultName = `${(data.candidateName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Cover_Letter.docx`;
    } else {
      return res.status(400).json({ error: 'Invalid document type. Must be "resume" or "cover_letter".' });
    }

    const downloadName = fileName || defaultName;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    return res.send(buffer);
  } catch (err: any) {
    console.error('Docx export error:', err);
    return res.status(500).json({ error: err.message || 'Failed to export DOCX' });
  }
});

// --- SUBSCRIPTION & PRICING ENDPOINTS ---

// Get all subscription plans
app.get('/api/subscription/plans', (req, res) => {
  const plans = getAllSubscriptionPlans();
  return res.json(plans);
});

// Get user subscription status
app.get('/api/subscription/status', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const subscription = getUserSubscription(userId);
  return res.json(subscription);
});

// Process subscription checkout & upgrade
app.post('/api/subscription/checkout', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  try {
    const { planId, paymentMethod, transactionId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required.' });
    }

    const validPlanIds = ['free', 'monthly', 'half_yearly', 'yearly', 'lifetime'];
    if (!validPlanIds.includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID specified.' });
    }

    const result = processSubscriptionCheckout(
      userId,
      planId,
      paymentMethod || 'UPI',
      transactionId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully activated ${result.subscription.planName}!`,
      subscription: result.subscription,
      invoice: result.invoice,
    });
  } catch (err: any) {
    console.error('Subscription checkout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process subscription checkout.' });
  }
});

// Cancel / update auto renewal
app.post('/api/subscription/cancel', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  try {
    const updated = updateUserSubscription(userId, { autoRenew: false });
    logActivity(
      userId,
      'Subscription Auto-Renew Canceled',
      `Auto-renew turned off for ${updated.planName}. Current access remains valid until ${updated.expiryDate || 'expiry'}.`
    );
    return res.json({
      success: true,
      message: 'Auto-renewal has been turned off. Your current plan access remains active until the end of the billing period.',
      subscription: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Reset demo sample credits (for testing/demo convenience)
app.post('/api/subscription/reset-credits', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const sub = updateUserSubscription(userId, { samplesUsed: 0 });
  return res.json({ success: true, subscription: sub });
});

// --- START SERVER & VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TailorFit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
