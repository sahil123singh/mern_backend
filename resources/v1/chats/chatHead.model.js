const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatHeadSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }, // For ordering chat heads
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Who deleted the chat head
}, { timestamps: true });

module.exports = mongoose.model('ChatHead', ChatHeadSchema);
