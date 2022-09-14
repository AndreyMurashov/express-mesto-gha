const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, 'Слишком коротко'],
    maxlength: [30, 'Слишком длинно'],
  },
  about: {
    type: String,
    required: true,
    minlength: [2, 'Слишком коротко'],
    maxlength: [30, 'Слишком длинно'],
  },
  avatar: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('user', userSchema);
