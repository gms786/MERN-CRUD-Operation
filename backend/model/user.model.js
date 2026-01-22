import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ silent: true }); // quiet mode

const { Schema } = mongoose;

const userSchema = new Schema({
  profile: String,
  fullname: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  dob: String,
  gender: String,
  address: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('user', userSchema);

export default User;