const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  paragraphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paragraph',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contribution', contributionSchema);

