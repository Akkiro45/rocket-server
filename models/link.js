const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  url: { type: String },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  logo: { type: String },
  group: { type: String, default: 'None', maxlength: 60 },
  createdAt: { type: Number, required: true },
  hide: { type: Boolean, default: false }
});

const Link = mongoose.model('Link', LinkSchema);

module.exports = Link;
