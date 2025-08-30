const User = require('./users.model')

module.exports = class UserResources {

    async createOne(data) {
        console.log('UserResources@createOne')

        let user = await User.insertOne(data)
        if (!user) {
            return false
        }
        return user
    }

    async getOne(id) {
        console.log('UserResources@getOne')

        let result = await User.findOne({ _id: id })

        if (!result) {
            return false
        }
        return result
    }

    async getByEmail(email) {
        console.log('UserResources@getByEmail')

        let result = await User.findOne({ email: email })

        if (!result) {
            return false
        }
        return result;
    }

    async updateOne(id, data) {
        console.log('UserResources@updateOne', id, data)
        if ((!id || id === '') || (!data || data === '')) {
            throw new Error('data is required');
        }
        let result = await User.updateOne({ _id: id }, data)

        if (!result) {
            return false;
        }

        return result;
    }


    async getAll() {
        console.log('UserResources@getAll')

        let result = await User.find()

        if (!result.length) {
            return false
        }
        return result
    }


    async getFormattedData(userObj = null) {
        console.log('UsersResource@getFormattedData');
        if (!userObj || userObj === '') {
            throw new Error('userObj is required');
        }

        let result = {
            id: userObj._id,
            userId: userObj.userId,
            email: userObj.email,
            token: userObj?.token?.authToken,
            // fcmToken: userObj.tokens.fcmToken,
            userInfo: userObj.userInfo,
            role: userObj.role,
            createdBy: userObj.createdBy,
            isVerified: userObj.isVerified,
            // isActive: userObj.isActive,
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt,
            deletedAt: userObj.deletedAt,
        }
        return result
    }
}