const ChatHead = require('./chatHead.model');
const ChatInfo = require('./chatInfo.model');

module.exports = class ChatResource {

    async createChatHead(data) {
        console.log('ChatResource@createChatHead');
        if (!data || data === '') {
            throw new Error('data is required');
        }

        let chatHeadData = await ChatHead.create(data);

        if (!chatHeadData) {
            return false;
        }

        return chatHeadData;
    }

    async createChatInfo(data = null) {
        console.log('chatResource@createChatInfo');
        if (!data || data === '') {
            throw new Error('data is required');
        }

        let chatInfoData = await ChatInfo.create(data);

        if (!chatInfoData) {
            return false;
        }

        return chatInfoData;
    }

    // get chatList of particular user(sender/ receiver), excluding deleted ones
    async getAllChatHead(id) {
        console.log('ChatResource@getAllChatHead', id);

        let result = await ChatHead.find({
            $or: [
                { senderId: id },
                { receiverId: id }
            ],
            deletedBy: { $ne: id }  // Exclude chat heads deleted by user
        })
            .populate({ path: 'senderId', select: '_id email userInfo' })
            .populate({ path: 'receiverId', select: '_id email userInfo' })
            .sort({ updatedAt: -1 });

        return result;
    }

    // find existing chat between two users
    async findChatBetweenUsers(senderId, receiverId) {
        console.log('ChatResource@findChatBetweenUsers');

        let chatHead = await ChatHead.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        return chatHead;
    }

    // get messages of a chat, excluding deleted ones for this user
    async getChatMessages(chatId, userId) {
        console.log('ChatResource@getChatMessages');

        let messages = await ChatInfo.find({
            chatId: chatId,
            deletedBy: { $ne: userId }  // Exclude messages deleted by user
        })
            .populate({ path: 'senderId', select: '_id email userInfo' })
            .populate({ path: 'receiverId', select: '_id email userInfo' })
            .sort({ createdAt: 1 });

        return messages;
    }

    // update chat head last message
    async updateChatHeadLastMessage(chatId, message) {
        console.log('ChatResource@updateChatHeadLastMessage');

        let updated = await ChatHead.findByIdAndUpdate(
            chatId,
            { lastMessage: message, lastUpdated: new Date() },
            { new: true }
        );

        return updated;
    }

    // mark message as seen
    async markMessageAsSeen(messageId) {
        console.log('ChatResource@markMessageAsSeen');

        let updated = await ChatInfo.findByIdAndUpdate(
            messageId,
            { isSeen: true },
            { new: true }
        );

        return updated;
    }

    // soft delete message by userId
    async softDeleteMessage(messageId, userId) {
        console.log('ChatResource@softDeleteMessage');

        let updated = await ChatInfo.findByIdAndUpdate(
            messageId,
            { $addToSet: { deletedBy: userId } },  // Avoid duplicates
            { new: true }
        );

        return updated;
    }

    // soft delete chat head by userId (clear chat feature)
    async softDeleteChatHead(chatId, userId) {
        console.log('ChatResource@softDeleteChatHead');

        let updated = await ChatHead.findByIdAndUpdate(
            chatId,
            { $addToSet: { deletedBy: userId } },  // Avoid duplicates
            { new: true }
        );

        return updated;
    }

};
