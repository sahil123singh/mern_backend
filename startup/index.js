const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const CONFIG = require('../config/v1/config');

module.exports = (app) => {
    console.log('loading startup files..');

    app.use((req, res, next) => {
        req.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        next()
    })

    app.use('/uploads', express.static('uploads'))
    app.use('/public', express.static('public'))

    // dev environment configurations
    if (CONFIG.env === 'dev' || CONFIG.env === 'development') {
        // app.use(morgan('tiny'));

        console.log('approved domains for development: ', CONFIG.cors_whitelist);
        console.log('development mode active....');

        app.use(cors({ origin: CONFIG.cors_whitelist }))
        app.use(cors({origin: 'http://10.242.213.8:3000'}))
        app.use(bodyParser.json({ limit: '10mb' }));
        app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    }
}