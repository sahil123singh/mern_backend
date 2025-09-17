const Joi = require('joi');

const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helper');
const response = new ResponseHelper();

const PostResources = require('./posts.resources')
const Post = new PostResources()

module.exports = class PostValidation {

    async createOne(req, res, next) {
        console.log('PostValidation@createOne')

        let schema = {
            title: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().optional()
        }
        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        next();
    }


    async getAllPostByUserId(req, res, next) {
        console.log('PostValidation@getAllPostByUserId')

        next();
    }

    async likePost(req, res, next) {

        let schema = {
            postId: Joi.string().required(),
            like: Joi.string().valid('like', "fav").required()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        // check post details;

        let checkPost = await Post.getByPostId(req.body.postId)
        if (!checkPost) {
            return response.badRequest('No post found', res, false)
        }

        req.body.post = checkPost
        next()
    }

    async deleteOneByUserId(req, res, next) {
        console.log('PostValidation@deleteOne');

        // req.body.postId = req.params.id;

        let schema = {
            id: Joi.string().required()
        }
        let errors = await _DataHelper.joiValidation(req.params, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        // check post

        let checkPost = await Post.getByPostId(req.params.id);
        if (!checkPost) {
            return response.notFound('No data found', res, false)
        }

        next()
    }
}