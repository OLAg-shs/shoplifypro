const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { supabase } = require('./supabaseClient');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'Welcome to Eagle Choice API',
    config: {
      supabase: !!supabase,
      jwt: !!process.env.JWT_SECRET
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/upload', require('./routes/upload'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({
    message: 'A critical server error occurred',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;