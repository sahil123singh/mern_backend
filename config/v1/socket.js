const CONFIG = require('./config');
let io;

module.exports.initSocket = (httpServer) => {
    if (io) return io; // avoid re-initialization

    io = require('socket.io')(httpServer, {
        path: '/api/v1/connect',
        cors: { 
            origin: CONFIG.cors_whitelist,
            methods: ['GET','POST','PUT','PATCH','DELETE'],
            allowedHeaders: ["*"]
        }
    });

    return io;
}

module.exports.socket = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
}
