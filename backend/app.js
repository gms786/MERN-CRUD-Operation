require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const router = require('./routes/route');


// ======= Security & Performance =======

// Allow only frontend URL
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// App Level Middleware
app.use(cors(corsOptions));
// app.use(helmet()); // Security headers

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max requests per IP
//   message: 'Too many requests, please try again later.'
// });

// app.use('/api', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({ extended: true }));

//Static Files
app.use(express.static('public'));

// Static Build
// =================================================
const path = require('path');

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// =================================================

app.use('/api', router);

// Health check (IMPORTANT)
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK', uptime: process.uptime() });
// });

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

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

const PORT = process.env.PORT;

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