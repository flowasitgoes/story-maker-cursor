const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rootParagraphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paragraph',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Branch', branchSchema);

