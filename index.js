// index.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// Route imports
import AuthRoute from './routes/Auth.route.js';
import UserRoute from './routes/User.route.js';
import CategoryRoute from './routes/Category.route.js';
import BlogRoute from './routes/Blog.route.js';
import CommentRoute from './routes/Comment.route.js';
import BlogLikeRoute from './routes/Bloglike.route.js';

// Model import
import Subscriber from './models/Subscriber.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Main Routes
app.use('/api/auth', AuthRoute);
app.use('/api/user', UserRoute);
app.use('/api/category', CategoryRoute);
app.use('/api/blog', BlogRoute);
app.use('/api/comment', CommentRoute);
app.use('/api/blog-like', BlogLikeRoute);

// Subscription Route
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error subscribing', error: err.message });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_CONN)
  .then(() => console.log('✅ Database connected.'))
  .catch(err => console.error('❌ Database connection failed:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
