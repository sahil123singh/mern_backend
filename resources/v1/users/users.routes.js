const express = require('express')
const routes = express.Router()

const UserController = require('./users.controller')
const User = new UserController()
const UserValidation = require('./users.validation')
const validation = new UserValidation()
const Authorization = require('../../../middleware/v1/authorize')
const auth = new Authorization()
const UploadUtils = require('../../../utils/upload.utils')
const upload = new UploadUtils()

routes.post('/', validation.createOne, User.createOne)
routes.post('/verify', [validation.verify, User.verify])
routes.post('/login', [validation.login, User.login])
routes.post('/forgot-password', validation.forgotPassword, User.forgotPassword)
routes.post('/reset-password', validation.resetPassword, User.resetPassword)
routes.post('/uploads', validation.uploadFile, upload.uploadFile().single('file'), User.uploadFile)
routes.put('/', [auth.auth, validation.updateProfile], User.updateProfile)
routes.get('/profile', [auth.auth, validation.userProfile], User.userProfile)

module.exports = routes