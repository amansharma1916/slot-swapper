const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(error => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
mongoose.connection.on('error', error => {
  console.error('MongoDB error:', error);
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const marketplaceRoutes = require('./routes/marketplace');
const swapRoutes = require('./routes/swap');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api', swapRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'Slot Swapper API is running'
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});