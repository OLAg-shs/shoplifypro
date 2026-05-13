const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection - connect once per serverless function invocation
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const connection = await mongoose.connect(process.env.MONGODB_URI, options);
  cachedConnection = connection;
  return connection;
}

// Initialize database connection when the module loads
connectToDatabase().catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Eagle Choice API' });
});

app.use('/api/auth', require('../routes/auth'));
app.use('/api/stores', require('../routes/stores'));
app.use('/api/products', require('../routes/products'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/agents', require('../routes/agents'));
app.use('/api/ai', require('../routes/ai'));

// Export for Vercel
module.exports = app;