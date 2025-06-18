import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Tier-based rate limiting
const createRateLimit = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting by tier
const freeRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const proRateLimit = createRateLimit(15 * 60 * 1000, 500); // 500 requests per 15 minutes
const businessRateLimit = createRateLimit(15 * 60 * 1000, 2000); // 2000 requests per 15 minutes
const enterpriseRateLimit = createRateLimit(15 * 60 * 1000, 10000); // 10000 requests per 15 minutes

// Mock authentication middleware with rate limiting
const mockAuth = (req: Request, res: Response, next: any) => {
  const user = {
    id: 'user-123',
    email: 'test@example.com',
    tier: (req.headers['x-tier'] as string) || 'free',
    tenantId: 'tenant-456',
    role: 'admin'
  };
  
  (req as any).user = user;
  
  // Apply tier-based rate limiting
  switch (user.tier) {
    case 'enterprise':
      return enterpriseRateLimit(req, res, next);
    case 'business':
      return businessRateLimit(req, res, next);
    case 'pro':
      return proRateLimit(req, res, next);
    default:
      return freeRateLimit(req, res, next);
  }
};

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Enterprise endpoints - THEPLAN.md compliance
app.post('/api/auth/signup', freeRateLimit, (req: Request, res: Response) => {
  const { email, companyName, tier = 'free' } = req.body;
  
  // Mock user creation logic
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    companyName,
    tier,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ 
    success: true, 
    message: 'User created successfully',
    user: newUser,
    onboardingUrl: `/onboard?token=mock_token_${newUser.id}`
  });
});

app.post('/api/teams/setup', mockAuth, (req: Request, res: Response) => {
  const { teamName, domain, maxUsers = 50 } = req.body;
  const user = (req as any).user;
  
  const team = {
    id: `team_${Date.now()}`,
    name: teamName,
    domain,
    tenantId: user.tenantId,
    ownerId: user.id,
    maxUsers,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ 
    success: true, 
    message: 'Team setup completed',
    team,
    inviteUrl: `/invite/${team.id}`
  });
});

app.post('/api/cards/batch', mockAuth, (req: Request, res: Response) => {
  const { cards } = req.body;
  const user = (req as any).user;
  
  const jobId = `job_${Date.now()}`;
  const processedCards = cards.map((card: any, index: number) => ({
    id: `card_${Date.now()}_${index}`,
    status: 'processed',
    extracted: card.mockData || {
      name: 'Sample Name',
      company: 'Sample Company',
      email: 'sample@example.com'
    },
    confidence: 0.95,
    tenantId: user.tenantId
  }));

  res.status(202).json({ 
    success: true, 
    message: 'Batch processing started',
    jobId,
    processed: processedCards.length,
    results: processedCards
  });
});

app.post('/api/integrations/crm', mockAuth, (req: Request, res: Response) => {
  const { provider } = req.body;
  const user = (req as any).user;
  
  const integration = {
    id: `int_${Date.now()}`,
    provider,
    tenantId: user.tenantId,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ 
    success: true, 
    message: 'CRM integration configured',
    integration,
    webhookUrl: `/api/webhooks/crm/${integration.id}`
  });
});

app.get('/api/analytics', mockAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const analytics = {
    overview: {
      totalCards: 150,
      activeUsers: 25,
      avgProcessingTime: 1.2,
      successRate: 0.98
    },
    usage: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cards: Math.floor(Math.random() * 50) + 10
      }))
    },
    tenantId: user.tenantId
  };

  res.json({ 
    success: true, 
    analytics,
    exportUrl: '/api/analytics/export'
  });
});

app.get('/api/admin/users', mockAuth, (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  
  const users = Array.from({ length: Number(limit) }, (_, i) => ({
    id: `user_${i + 1}`,
    email: `user${i + 1}@example.com`,
    tier: ['free', 'pro', 'business', 'enterprise'][Math.floor(Math.random() * 4)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  res.json({ 
    success: true, 
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: 100,
      pages: 10
    }
  });
});

app.get('/api/compliance/export', mockAuth, (req: Request, res: Response) => {
  const { type = 'full' } = req.query;
  const user = (req as any).user;
  
  const report = {
    reportId: `report_${Date.now()}`,
    type,
    tenantId: user.tenantId,
    data: {
      userAccess: { totalUsers: 25, activeUsers: 20 },
      dataProcessing: { totalCards: 150, avgProcessingTime: 1.2 },
      security: { encryptionEnabled: true, backupsEnabled: true },
      privacy: { gdprCompliant: true, dataRetention: '7 years' }
    },
    generatedBy: user.id,
    generatedAt: new Date().toISOString()
  };

  res.json({ 
    success: true, 
    message: 'Compliance export generated',
    report,
    downloadUrl: `/api/compliance/download/${report.reportId}`
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, __next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Enterprise API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

export default app; 