import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './src/config/env.js';
import { isMockDatabase, getSupabaseClient } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import scoreRoutes from './src/routes/scoreRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import charityRoutes from './src/routes/charityRoutes.js';
import drawRoutes from './src/routes/drawRoutes.js';
import winnerRoutes from './src/routes/winnerRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const app = express();

// Security & Diagnostics Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development for seamless local testing
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

if (ENV.isDev) {
  app.use(morgan('dev'));
}

// Raw body for Stripe webhook must come before express.json()
app.use('/api/webhooks', webhookRoutes);

// JSON Body Parser & API Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', apiLimiter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Digital Heroes Backend API Server',
    version: '1.0.0',
    documentation: 'Digital Heroes PRD Level 1 Implementation',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      scores: '/api/scores',
      subscriptions: '/api/subscriptions',
      charities: '/api/charities',
      draws: '/api/draws',
      winners: '/api/winners',
      admin: '/api/admin'
    }
  });
});

// System Health Check Endpoint (PRD & Plan requirement)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'connected_mock';
  const supabase = getSupabaseClient();
  
  if (supabase && !isMockDatabase()) {
    try {
      const { error } = await supabase.from('charities').select('id').limit(1);
      dbStatus = error ? `supabase_error: ${error.message}` : 'connected_supabase_postgres';
    } catch (err) {
      dbStatus = `supabase_exception: ${err.message}`;
    }
  }

  res.status(200).json({
    status: 'ok',
    service: 'Digital Heroes API Server',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    database: {
      mode: isMockDatabase() ? 'Mock In-Memory Store' : 'Supabase PostgreSQL',
      status: dbStatus
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for Unrecognized Endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `API route ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(ENV.PORT, () => {
  console.log(`
================================================================
   DIGITAL HEROES API SERVER STARTED
   Port: ${ENV.PORT}
   Environment: ${ENV.NODE_ENV}
   Health check: http://localhost:${ENV.PORT}/api/health
   Database Mode: ${isMockDatabase() ? 'In-Memory Mock Store' : 'Supabase PostgreSQL'}
================================================================
  `);
});

export default app;
