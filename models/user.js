const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [{
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
