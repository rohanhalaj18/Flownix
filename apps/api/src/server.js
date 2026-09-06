import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import diagramRoutes from './routes/diagrams.js';
import shareRoutes from './routes/share.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flownix';

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flownix REST API Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/share', shareRoutes);

// Global 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start Server Immediately
app.listen(PORT, () => {
  console.log(`[Flownix API] Server running on http://localhost:${PORT}`);
});

// Async Database Connection Attempt
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log(`[Flownix API] MongoDB connected successfully to ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`[Flownix API] Warning: MongoDB not connected (${err.message}). API active in standalone mode.`);
  });
