const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  jobTitle: { type: String },
  company: { type: String },
  phoneNumber: { type: String },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },
  profileImage: { type: String } // путь к изображению профиля
});

const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;
