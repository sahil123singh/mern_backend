const Joi = require('joi');

const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helper');
const response = new ResponseHelper();

const UsersResource = require("./users.resources");
const _Users = new UsersResource();

module.exports = class UsersValidation {


    async createOne(req, res, next) {
        console.log('UserValidation@createOne')

        let schema = {
            email: Joi.string().email(),
            password: Joi.string().required(),
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            profileImage: Joi.string().optional(),
            role: Joi.string().valid('user', 'admin').required(),

        }
        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        let user = await _Users.getByEmail(req.body.email);
        if (user) {
            return response.conflict('Email already exists', res, false);
        };

        next();
    }

    async verify(req, res, next) {
        console.log('UsersValidation@verify');

        let schema = {
            email: Joi.string().email(),
            otp: Joi.string().required(),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        next();
    }

    async login(req, res, next) {
        console.log('UserValidation@login')

        let schema = {
            email: Joi.string().required(),
            password: Joi.string().required()
        }
        let errors = await _DataHelper.joiValidation(req.body, schema);

        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }
        let user = await _Users.getByEmail(req.body.email);
        if (!user) {
            return response.badRequest('Invalid login credentials1', res, false);
        }

        let isPasswordValid = await _DataHelper.validatePassword(req.body.password, user.password)
        if (!isPasswordValid) {
            return response.badRequest("Invalid login credentials2", res, false);
        }
        if (user.isVerified != 'true') {
            return response.success("Not verified yet", res, false);
        }

        req.user = user
        next()
    }

    async updateProfile(req, res, next) {
        console.log('UserValidation@updateProfile')

        let schema = {
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            profileImage: Joi.string().optional()
        }
        let errors = await _DataHelper.joiValidation(req.body, schema);

        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        next()
    }

    async forgotPassword(req, res, next) {
        console.log('UserValidation@forgotPassword');

        let schema = {
            email: Joi.string().required()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        // check email is exist or not
        let user = await _Users.getByEmail(req.body.email)
        if (!user) {
            return response.notFound('User does not exist with this email', res, false);
        }
        req.user = user;
        next()
    }

    async resetPassword(req, res, next) {
        console.log('UserValidation@resetPassword')

        let schema = {
            password: Joi.string().required(),
            confirmPassword: Joi.string().required(),
            email: Joi.string().required()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);
        if (errors) {
            return response.badRequest('Invalid request', res, errors);
        }

        if (req.body.password !== req.body.confirmPassword) {
            return response.badRequest('Confirm password must be same as password', res, false)
        }

        let user = await _Users.getByEmail(req.body.email)
        if (!user) {
            return response.notFound('User not exists', res, false);
        }
        req.user = user;

        next()
    }

    async userProfile(req, res, next) {
        console.log('UserValidation@userProfile')

        next()
    }

    async uploadFile(req, res, next) {
        console.log('UserValidation@uploadFile')
        next()
    }

}