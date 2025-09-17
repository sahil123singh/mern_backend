const mongoose = require('mongoose')
const ObjectId = new mongoose.Types.ObjectId()
const Post = require('./posts.model')
module.exports = class PostResources {

    async createOne(data) {
        console.log('PostResources@createOne')

        let post = await Post.create(data);

        if (!post) {
            return false
        }
        return post
    }

    async getByPostId(postId) {
        console.log('PostController@getByPostId', new mongoose.Types.ObjectId(postId))

        let result = await Post.findOne({ _id: postId });

        if (!result) {
            return false
        }
        return result
    }

    async getAll() { // 👈 make sure you pass logged-in user's id here
        console.log('PostResource@getAll');

        try {
            let result = await Post.aggregate([
                { $sort: { createdAt: -1 } }, // sort
                {
                    $addFields: {
                        likeCount: { $size: { $ifNull: ["$likedBy", []] } }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId",
                    }
                },
                { $unwind: "$userId" },
                {
                    $project: {
                        _id: 1,
                        userId: {
                            _id: '$userId._id',
                            userInfo: '$userId.userInfo',
                        },
                        title: 1,
                        description: 1,
                        image: 1,
                        likedBy: 1,
                        likedByMe: 1,
                        addTofav: 1,
                        likeCount: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        deletedAt: 1
                    }
                }

            ]);

            return result;
        } catch (error) {
            console.error("Error in getAll:", error);
            throw error;
        }
    }

    async getMyFav(userId) {
        try {
            const result = await Post.aggregate([
                {
                    $match: { "addTofav.userId": new mongoose.Types.ObjectId(userId) }
                },
                { $sort: { createdAt: -1 } },
                {
                    $addFields: {
                        likeCount: { $size: { $ifNull: ["$likedBy", []] } }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId"
                    }
                },
                { $unwind: "$userId" },
                {
                    $project: {
                        _id: 1,
                        userId: {
                            _id: "$userId._id",
                            userInfo: "$userId.userInfo"
                        },
                        title: 1,
                        description: 1,
                        image: 1,
                        likedBy: 1,
                        addTofav: 1,
                        likeCount: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        deletedAt: 1
                    }
                }
            ]);

            return result;
        } catch (error) {
            console.error("Error in getMyFav:", error);
            throw error;
        }
    }

    async getAllByUserId(userId) {
        console.log('PostResources@getAllByUserId', userId)

        const result = await Post.aggregate([
            { $match: { userId: userId } },
            { $sort: { createdAt: -1 } }, // sort
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likedBy", []] } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: "$userId" },
            {
                $project: {
                    _id: 1,
                    userId: {
                        _id: "$userId._id",
                        userInfo: "$userId.userInfo"
                    },
                    title: 1,
                    description: 1,
                    image: 1,
                    likedBy: 1,
                    addTofav: 1,
                    likeCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    deletedAt: 1
                }
            }
        ]);

        return result;
    }

    async updateOne(id, data) {
        console.log('PostResource@updateOne')

        let result = await Post.findByIdAndUpdate(id, data, { new: true })

        if (!result) {
            return false
        }
        return result
    }

    async deleteOneByUserId(id, userId) {
        console.log('PostResource@deleteOne')

        let result = await Post.deleteOne({ _id: id, userId: userId });

        if (!result) {
            return false
        }
        return result

    }
}