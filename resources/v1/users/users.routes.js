const express = require('express')
const routes = express.Router()

const UserController = require('./users.controller')
const User = new UserController()
const UserValidation = require('./users.validation')
const validation = new UserValidation()
const Authorization = require('../../../middleware/v1/authorize')
const auth = new Authorization()

routes.post('/', validation.createOne, User.createOne)
routes.post('/verify', [validation.verify, User.verify])
routes.post('/login', [validation.login, User.login])
routes.put('/', [auth.auth, validation.updateProfile], User.updateProfile)

module.exports = routes