require('dotenv').config()

let CONFIG = {}

CONFIG.env = process.env.ENV || 'dev'
CONFIG.port = process.env.APPLICATION_PORT || '4000';
CONFIG.api_ver = process.env.API_VER;

if (process.env.ENV === 'prod' || process.env.ENV === 'production') {
    CONFIG.cors_whitelist = ['http://localhost:4000', 'http://localhost:3000','http://10.242.213.8:3000','http://10.242.213.8:4000']
} else if (process.env.ENV === 'stag' || process.env.ENV === 'staging') {
    CONFIG.cors_whitelist = ['http://localhost:4000', 'http://localhost:3000','http://10.242.213.8:3000', 'http://10.242.213.8:4000']
} else {
    CONFIG.cors_whitelist = ['http://localhost:4000', 'http://localhost:3000','http://10.242.213.8:3000', 'http://10.242.213.8:4000']
}

module.exports = CONFIG;

