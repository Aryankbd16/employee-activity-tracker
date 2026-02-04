const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const workRoutes = require('./routes/workRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '110mb' }));
app.use(express.urlencoded({ limit: '110mb', extended: true }));

// Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/work', workRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
