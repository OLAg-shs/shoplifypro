const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  // Agent details
  commissionRate: {
    type: Number,
    default: 0.05, // 5% default commission
    min: 0,
    max: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Performance metrics
  totalSales: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
agentSchema.index({ user: 1 });
agentSchema.index({ store: 1 });
agentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Agent', agentSchema);