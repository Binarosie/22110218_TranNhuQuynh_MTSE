import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import viewRoutes from './routes/view.routes';
import cors from 'cors';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api', userRoutes);

// View Routes (render HTML pages)
app.get('/', (req, res) => {
  res.render('crud'); // Render crud.ejs
});

app.get('/users', (req, res) => {
  res.render('findAllUser'); // Render findAllUser.ejs
});

app.get('/users/edit', (req, res) => {
  res.render('editUser'); // Render editUser.ejs
});
// Use view routes
app.use('/', viewRoutes);

export default app;