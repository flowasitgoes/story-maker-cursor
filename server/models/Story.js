const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  rootParagraphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paragraph'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Story', storySchema);

