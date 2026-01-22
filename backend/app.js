import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & Performance
/* ========= Middleware ========= */
// app.use(helmet()); // Security headers

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max requests per IP
//   message: 'Too many requests, please try again later.'
// });

// app.use('/api', limiter);

// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({ extended: true }));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ========= CORS ========= */
// Allow only frontend URL (Separate frontend: Vercel/Netlify/local, e.g. https://your-frontend.vercel.app)
const allowedOrigins = [
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    // allow same-origin, Postman, server-to-server
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
    // return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/* ========= API ========= */
app.use('/api', router);


/* ========= Static Build Files | React dist ========= */
// Serve frontend build
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');

  app.use(express.static(distPath));

  // Express 5 safe catch-all
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/* ========= Dev Root ========= */
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Health check (IMPORTANT)
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK', uptime: process.uptime() });
// });

// 404 Handler
app.use((req, res) => {
//  res.status(404).json({ message: 'Route not found' });
    res.status(404).send(`
        <div style="
            min-height:100vh;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            background:#f8fafc;
            font-family:Arial, sans-serif;
            text-align:center;
        ">
            <h1 style="font-size:64px; margin:0; color:#ef4444;">404</h1>
            <h2 style="margin:10px 0; color:#111827;">Page Not Found</h2>
            <p style="color:#6b7280;">The page you are trying to access does not exist.</p>
            <a href="/" style="
            margin-top:20px;
            padding:10px 22px;
            background:#2563eb;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
            font-weight:600;
            ">Go Home</a>
        </div>
    `);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

/* ========= Server ========= */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});