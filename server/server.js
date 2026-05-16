const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { supabase } = require('./supabaseClient');

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ── CORS Whitelist ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.CLIENT_ORIGIN, // e.g. https://shoplify-pro-8vbw-psxa2trt3-olagshs.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow Vercel preview deployments (*.vercel.app) + whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  abortOnLimit: true,
}));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Eagle Choice API v1.0',
    environment: isDev ? 'development' : 'production',
    services: {
      supabase: !!supabase,
      jwt: !!process.env.JWT_SECRET,
    },
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/stores',   require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/agents',   require('./routes/agents'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/billing',  require('./routes/billing'));
app.use('/api/ai',       require('./routes/assistant').router);


// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred',
    ...(isDev && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`✅ Eagle Choice API running on port ${PORT} [${isDev ? 'dev' : 'production'}]`);
});

module.exports = app;