const mongoose = require('mongoose');
Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
    userInfo: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        profileImage: { type: String, default: '' }
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    token: { authToken: { type: String } },
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    socketId: { type: String, default: '' },
    isActive: { type: Boolean, default: false }, // User Active/Inactive status
    lastSeen: { type: Date, default: Date.now }, // Last seen timestamp

    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    accountType: { type: String, enum: ['public', 'private'], default: 'public' },

    deletedAt: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
