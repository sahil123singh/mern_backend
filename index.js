const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000;


app.get('/',(req, res) => {
    res.status(200).send({
        msg: 'Everything is working fine',
        host: req.host
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening to the port http://localhost:${PORT}`)
})