const mongoose = require('mongoose');

const inventoryLogSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: ['add', 'remove', 'adjust', 'return'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousCount: {
      type: Number,
      required: true,
    },
    newCount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;