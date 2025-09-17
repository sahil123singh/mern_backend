const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatHead', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false }, // Seen feature
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Who deleted the message
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
