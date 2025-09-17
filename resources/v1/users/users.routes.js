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
// routes.put('/')
routes.get('/profile', [auth.auth, validation.userProfile], User.userProfile)
// follow unfollow

routes.post('/follow/', [auth.auth, validation.userFollowUnfollow], User.userFollowUnfollow)
routes.get('/follow-list', [auth.auth, validation.getFollowerFollowingList], User.getFollowerFollowingList)
routes.get('/:id', [auth.auth, validation.getByUserId], User.getOneById)

module.exports = routes