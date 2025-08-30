'use strict'

require('dotenv').config()

const jwt = require('jsonwebtoken')
const DataHelpers = require('../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();
const ResponseHelper = require('../../helpers/v1/response.helper');
const response = new ResponseHelper();

const UsersResource = require('../../resources/v1/users/users.resources');
const _Users = new UsersResource();

module.exports = class AuthorizationMiddleware {

    async auth(req, res, next) {
        console.log('AuthorizationMiddleware@auth')

        if (!req.headers['authorization']) {
            return response.unauthorized('missing api token', res, false)
        }

        let token = req.headers['authorization']

        try {

            jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
                if (err) {
                    return response.unauthorized(err.message, res, false)
                }
                req.user = await _Users.getOne(decoded.user_id)
                if (req.user === null || req.user === false) {
                    return response.unauthorized("invalid_token", res, false);
                }
                next()

            })
        } catch (error) {
            return response.unauthorized(error.message, res, false)
        }
    }
}