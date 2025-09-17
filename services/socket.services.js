const UserResources = require('../resources/v1/users/users.resources');
const _User = new UserResources();
const ChatResource = require('../resources/v1/chats/chat.resource');
const _Chat = new ChatResource();

const activeUsers = new Map();

module.exports = (io) => {
    console.log('Socket service initialized');

    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(`User connected: ${userId}, Socket: ${socket.id}`);

        if (userId && userId !== "undefined") {
            activeUsers.set(userId, socket.id);
            socket.userId = userId;

            // Update user active status and last seen
            await _User.updateOne(userId, {
                socketId: socket.id,
                isActive: true,
                lastSeen: new Date()
            });

            let chatHeads = await _Chat.getAllChatHead(userId);

            socket.emit('connection', {
                success: true,
                message: 'Connected successfully',
                data: { chatHeads }
            });
        }

        // Join room
        socket.on('join_room', async (data) => {
            if (!data.senderId || !data.receiverId) {
                socket.emit('join_room', { success: false, message: "senderId and receiverId required" });
                return;
            }

            try {
                let chatHead = await _Chat.findChatBetweenUsers(data.senderId, data.receiverId);
                let chatId;

                if (chatHead) {
                    chatId = chatHead._id;
                } else {
                    let newChatHead = await _Chat.createChatHead({
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        lastMessage: ''
                    });
                    chatId = newChatHead._id;
                }

                let room = `chat_${chatId}`;
                socket.join(room);
                socket.currentRoom = room;
                socket.currentChatId = chatId;

                socket.emit('join_room', { success: true, message: "Room joined", data: { chatId, room } });

                // Send chat history (exclude deleted messages for this user)
                let messages = await _Chat.getChatMessages(chatId, data.senderId);
                socket.emit('chat_history', { success: true, data: { messages } });

            } catch (error) {
                socket.emit('join_room', { success: false, message: error.message });
            }
        });

        // Send message
        socket.on('send_message', async (data) => {
            if (!data.senderId || !data.receiverId || !data.message) {
                socket.emit('message_error', { success: false, message: "senderId, receiverId, message required" });
                return;
            }

            try {
                let chatId = data.chatId;

                if (!chatId || chatId.startsWith('temp_')) {
                    const chatHead = await _Chat.findChatBetweenUsers(data.senderId, data.receiverId);
                    if (chatHead) {
                        chatId = chatHead._id;
                    } else {
                        const newChatHead = await _Chat.createChatHead({
                            senderId: data.senderId,
                            receiverId: data.receiverId,
                            lastMessage: ''
                        });
                        chatId = newChatHead._id;
                    }
                }

                let chatMessage = await _Chat.createChatInfo({
                    chatId,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    message: data.message
                });

                await _Chat.updateChatHeadLastMessage(chatId, data.message);

                await chatMessage.populate({ path: 'senderId', select: '_id email userInfo' });
                await chatMessage.populate({ path: 'receiverId', select: '_id email userInfo' });

                const messageData = {
                    success: true,
                    message: "Message sent",
                    data: {
                        messageId: chatMessage._id,
                        chatId,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        message: data.message,
                        timestamp: chatMessage.createdAt,
                        isSeen: chatMessage.isSeen,
                        senderInfo: chatMessage.senderId,
                        receiverInfo: chatMessage.receiverId
                    }
                };

                const room = `chat_${chatId}`;
                io.to(room).emit('new_message', messageData);

            } catch (error) {
                socket.emit('message_error', { success: false, message: error.message });
            }
        });

        // Mark message as seen
        socket.on('mark_seen', async (data) => {
            if (!data.messageId || !data.userId) {
                socket.emit('mark_seen_error', { success: false, message: "messageId and userId required" });
                return;
            }

            try {
                await _Chat.markMessageAsSeen(data.messageId);

                io.to(socket.currentRoom).emit('message_seen', {
                    success: true,
                    messageId: data.messageId,
                    userId: data.userId
                });

            } catch (error) {
                socket.emit('mark_seen_error', { success: false, message: error.message });
            }
        });

        // Delete single message (soft delete)
        socket.on('delete_message', async (data) => {
            if (!data.messageId || !data.userId) {
                socket.emit('delete_message_error', { success: false, message: "messageId and userId required" });
                return;
            }

            try {
                await _Chat.softDeleteMessage(data.messageId, data.userId);

                io.to(socket.currentRoom).emit('message_deleted', {
                    success: true,
                    messageId: data.messageId,
                    userId: data.userId
                });

            } catch (error) {
                socket.emit('delete_message_error', { success: false, message: error.message });
            }
        });

        // Clear entire chat (soft delete by user)
        socket.on('clear_chat', async (data) => {
            if (!data.chatId || !data.userId) {
                socket.emit('clear_chat_error', { success: false, message: "chatId and userId required" });
                return;
            }

            try {
                await _Chat.softDeleteChatHead(data.chatId, data.userId);

                socket.emit('clear_chat_success', {
                    success: true,
                    chatId: data.chatId,
                    userId: data.userId
                });

            } catch (error) {
                socket.emit('clear_chat_error', { success: false, message: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            if (socket.userId) {
                activeUsers.delete(socket.userId);
                await _User.updateOne(socket.userId, {
                    socketId: null,
                    isActive: false,
                    lastSeen: new Date()
                });
                console.log(`User disconnected: ${socket.userId}`);
            }
        });
    });
};
