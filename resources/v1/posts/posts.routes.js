const express = require('express')
const routes = express.Router()
const Authorization = require('../../../middleware/v1/authorize')
const auth = new Authorization()

const PostController = require('./posts.controller')
const Post = new PostController();
const PostValidation = require('./posts.validation')
const validation = new PostValidation()

routes.post('/', [auth.auth, validation.createOne], Post.createOne)
routes.post('/like', [auth.auth, validation.likePost], Post.likePost)
routes.get('/all', [auth.auth], Post.getAll)
routes.get('/my', [auth.auth], Post.getAllPostByUserId)
routes.get('/fav', [auth.auth], Post.myFavPost)
routes.get('/:id', [auth.auth], Post.getById)
routes.delete('/:id', [auth.auth, validation.deleteOneByUserId], Post.deleteOneByUserId)

module.exports = routes;