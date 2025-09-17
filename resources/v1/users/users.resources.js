const User = require('./users.model')
const mongoose = require('mongoose')
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
        console.log('UserResources@updateOne', id)
        if ((!id || id === '') || (!data || data === '')) {
            throw new Error('data is required');
        }
        if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
            id = new mongoose.Types.ObjectId(id)
        }
        console.log('aaaaaaaaaaaaaaaaaaaa============', id)

        let result = await User.updateOne({ _id: id }, data, { new: true })

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

    async getOneById(id) {
        console.log('UserResource@getOneById', id);

        let result = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'postDetails'
                }
            },
            // {
            //     $unwind: "$postDetails"
            // },
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$postDetails.likedBy", []] } } // optional: safe count
                }
            },
            {
                $project: {
                    _id: 1,
                    userInfo: 1,
                    followers: 1,
                    following: 1,
                    postDetails: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);

        if (!result[0]) {
            return false
        }
        return result[0]
    }

    async getByColumnAndValue(column = '', value = '') {
        console.log('UserResource@getByColumnAndValue')
        if ((!column || column === '') || (!value || value === '')) {
            throw new Error('value is required');
        }

        let result = await User.findOne({ [column]: value })
        if (!result) {
            return false;
        }

        return result;

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
            socketId: userObj.socketId,
            // isActive: userObj.isActive,
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt,
            deletedAt: userObj.deletedAt,
        }
        return result
    }
}