const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Joi = require('joi')

module.exports = class DataHelpers {

    async generateToken(data) {
        console.log('DataHelpers@generateToken')

        let token = await jwt.sign(data, process.env.JWT_TOKEN_KEY)

        if (!token) {
            return false
        }
        return token
    }

    async hashPassword(password) {
        console.log('DataHelpers@hashPassword')

        try {
            return await bcrypt.hash(password, 10); // 10 = salt rounds
        } catch (err) {
            console.error("Error hashing password:", err);
            throw err; // rethrow so caller can handle
        }
    }

    async validatePassword(password, hashedPassword) {
        console.log('DataHelpers@validatePassword')

        let validatedPassword = await bcrypt.compare(password, hashedPassword)
        if (!validatedPassword) {
            return false
        }
        return validatedPassword
    }

    async joiValidation(reqBody, schema, language = 'en') {
        console.log('DataHelper@joiValidation');

        try {
             await Joi.object(schema).validateAsync(reqBody, { abortEarly: false });
            return null; // ✅ no errors
        } catch (err) {
            if (err.details) {
                return err.details.map(e => {
                    return e.message.replace(/['"]+/g, "");
                });
            }
            return [err.message.replace(/['"]+/g, "")]; // fallback
        }
    }

    async parseJoiErrors(errors) {
        console.log('DataHelper@parseJoiErrors');
        let parsedErrors = [];

        if (errors.error) {
            errors = errors.error.details

            for (let e = 0; e < errors.length; e++) {
                let msg = errors[e].message
                msg = msg.replace(/["']/g, "")
                parsedErrors.push(msg.replace(/_/g, ' '))
            }
        }

        return parsedErrors;
    }

    async pagination(totalItems = null, pageNo = null, limit = null) {
        console.log('DataHelper@pagination');
        // set a default pageNo if it's not provided
        if (!pageNo) {
            pageNo = 1;
        }

        // set a default limit if it's not provided
        if (!limit) {
            if (totalItems > 50) {
                limit = 50
            } else {
                limit = totalItems;
            }
        } else {
            if (limit > totalItems) {
                limit = totalItems
            }
        }

        let totalPages = Math.ceil(totalItems / limit);
        if (totalPages < 1) {
            totalPages = 1;
        }

        // if the page number requested is greater than the total pages, set page number to total pages
        if (pageNo > totalPages) {
            pageNo = totalPages;
        }

        let offset;
        if (pageNo > 1) {
            offset = (pageNo - 1) * limit;
        } else {
            offset = 0;
        }

        return {
            pageNo,
            totalPages,
            offset,
            limit
        }
    }
}