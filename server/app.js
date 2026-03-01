require('dotenv').config();

// Environment Validation
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'REFRESH_SECRET', 'REDIS_URL'];
REQUIRED_ENV.forEach((env) => {
  if (!process.env[env]) {
    console.error(`[FATAL] Missing required environment variable: ${env}`);
    process.exit(1);
  }
});
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { recordRateLimitBreach } = require('./services/threatEngine');

// Routes
const authRoutes = require('./routes/auth');
const threatRoutes = require('./routes/threat');
const trafficRoutes = require('./routes/traffic');
const waterRoutes = require('./routes/water');
const powerRoutes = require('./routes/power');
const monitoringRoutes = require('./routes/monitoring');
const testingRoutes = require('./routes/testing');
const emergencyRoutes = require('./routes/emergency');
const lightRoutes = require('./routes/lights');
const securitySimRoutes = require('./routes/securitySim');
const simulationEngine = require('./services/SecuritySimulationEngine');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Trust proxy for Render/Vercel deployments to get correct client IP for rate limiting
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'https://smart-city-aegis.vercel.app'
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id']
}));

// Body Parser with strict limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// NoSQL Injection — strip $ operators, disallow dots, reject __proto__ keys
app.use(mongoSanitize({ allowDots: false, replaceWith: '_' }));

// HTTP Parameter Pollution protection
app.use(hpp());

// Reject payloads containing prototype pollution keys
app.use((req, res, next) => {
  const body = JSON.stringify(req.body || {});
  if (body.includes('__proto__') || body.includes('constructor') || body.includes('prototype')) {
    return res.status(400).json({ message: 'Malformed request' });
  }
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await recordRateLimitBreach(req.user?.username || 'Guest', req.ip);
    res.status(429).json({ message: 'Request limit exceeded. Threat recorded.' });
  }
});

// Stricter limiter for Auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 20,
  message: 'Too many refresh requests'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: 'Too many registration attempts'
});

app.use('/auth/login', authLimiter);
app.use('/auth/refresh', refreshLimiter);
app.use('/auth/register', registerLimiter);
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/threat', threatRoutes);
app.use('/traffic', trafficRoutes);
app.use('/water', waterRoutes);
app.use('/power', powerRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/testing', testingRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/lights', lightRoutes);
app.use('/security', securitySimRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler (Hiding Stack Traces)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({
    message: 'A system error occurred. Security team notified.',
    errorCode: err.code || 'INTERNAL_ERROR'
  });
});

const PORT = process.env.PORT || 5000;
const seedDefaultUsers = require('./utils/seedDefaultUsers');

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultUsers();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });

    app.set('io', io);

    server.listen(PORT, () => console.log(`[CORE] Production security active on port ${PORT}`));
  } catch (error) {
    console.error('Core failure:', error);
    process.exit(1);
  }
};

startServer();
