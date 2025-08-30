const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000;

require('./startup')(app);

const connectDb = require('./config/v1/database')
connectDb();


app.listen(PORT, async () => {
    await require('./startup/routes')(app);

    console.log(`Server is listening to the port http://localhost:${PORT}`)
})