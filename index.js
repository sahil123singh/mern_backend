require('dotenv').config();

const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000;

//socket
const http = require('http');
const server = http.createServer(app);

const socketFunc = require('./services/socket.services')
const { initSocket } = require('./config/v1/socket')


require('./startup')(app);
// database connection;
const connectDb = require('./config/v1/database')
connectDb();

//socket 
const io = initSocket(server);
socketFunc(io);

server.listen(PORT, '0.0.0.0',async () => {
    await require('./startup/routes')(app);

    console.log(`Server is listening to the port http://localhost:${PORT}`)
})