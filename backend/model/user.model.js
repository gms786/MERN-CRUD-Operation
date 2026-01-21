const mongo = require('mongoose');
const { Schema } = mongo;
const dotenv = require('dotenv');
dotenv.config({ quiet: true });

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
        required: true,
        
    },
    dob: String,
    gender: String,
    address: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongo.model('user', userSchema);
