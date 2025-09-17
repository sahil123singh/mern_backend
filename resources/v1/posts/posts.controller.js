const _ = require('lodash')
const DataHelper = require('../../../helpers/v1/data.helpers')
const _DataHelper = new DataHelper()
const ResponseHelper = require('../../../helpers/v1/response.helper')
const response = new ResponseHelper()
const PostResources = require('./posts.resources')
const Post = new PostResources()

module.exports = class PostController {

    async createOne(req, res) {
        console.log('PostController@createOne')

        let data = _.pick(req.body, ['title', 'description', 'image'])

        let dataToInsert = {
            userId: req.user._id,
            title: data.title,
            description: data.description,
            image: data.image
        }

        let post = await Post.createOne(dataToInsert);
        if (!post) {
            return response.badRequest('Unable to create post', res, false)
        }
        return response.success('Post created successfully!', res, post)
    }

    async getAll(req, res) {
        console.log('PostController@getAll')

        let allPosts = await Post.getAll()

        if (!allPosts) {
            return response.success("No data found", res, allPosts)
        }

        // check liked by me
        for (let post of allPosts) {
            let checkLike = post?.likedBy?.some((p) => {
                return p.userId.toString() === req.user.id
            })
            checkLike ? post.likedByMe = true : post.likedByMe = false
        }

        // check fav by me
        for (let post of allPosts) {
            let checkFav = post?.addTofav?.some((p) => {
                var check = p.userId.toString() === req.user.id
                return check
            }
            )
            checkFav ? post.favorited = true : post.favorited = false
        }

        return response.success("Data found successfully", res, allPosts)
    }

    async getAllPostByUserId(req, res) {
        console.log('PostController@getAllPostByUserId')

        let userId = req.user._id;

        let posts = await Post.getAllByUserId(userId);
        if (!posts.length) {
            return response.success("No data found", res, posts)

        }
        for (let post of posts) {
            let checkLike = post?.likedBy?.some((p) => {
                return p.userId.toString() === req.user.id
            })
            checkLike ? post.likedByMe = true : post.likedByMe = false
        }

        for (let post of posts) {
            let checkFav = post?.addTofav?.some((p) => {
                return p.userId.toString() === req.user.id
            })
            checkFav ? post.favorited = true : post.favorited = false
        }
        return response.success("Data found successfully", res, posts)

    }

    async likePost(req, res) {
        console.log('PostController@likePost');

        let data = _.pick(req.body, ['postId', 'like'])

        let checkPost = req.body.post;
        let msg;
        let dataToUpdate;

        if (data.like === 'like') {
            msg = 'Post Liked'
            const likedByMe = checkPost?.likedBy?.some((like) => {
                return like?.userId?.toString() === req.user.id

            })
            // if already liked then dislike
            if (likedByMe) {
                msg = 'Post disliked!';

                dataToUpdate = {
                    $pull: {
                        likedBy: { userId: req.user._id },
                    }
                }

            } else {
                dataToUpdate = {
                    $push: {
                        likedBy: { userId: req.user._id },
                    }
                }
            }
        } else if (data.like === 'fav') {
            // for add to fav post
            const checkFav = checkPost?.addTofav?.some((fav) => {
                return fav?.userId?.toString() === req.user.id

            })
            if (checkFav) {
                msg = 'Removed from favourite!';
                dataToUpdate = {
                    $pull: {
                        addTofav: { userId: req.user._id }
                    }
                }
            } else {
                msg = 'Added to favourite!';
                dataToUpdate = {
                    $push: {
                        addTofav: { userId: req.user._id }
                    }
                }
            }
        }
        let postLike = await Post.updateOne({ _id: checkPost._id }, dataToUpdate)
        return response.success(msg, res, postLike)
    }

    async getById(req, res) {
        console.log('PostController@getById')
        let post = await Post.getByPostId(req.params.id)

        if (!post) {
            return response.badRequest('Post not found', res, false)
        }
        return response.success('Post found successfully', res, post)
    }

    async myFavPost(req, res) {
        console.log('PostController@myFavPost')

        let userId = req.query.id 
        console.log('userId====>>', userId)
        let myFavPost = await Post.getMyFav(userId)
        if (!myFavPost.length) {
            return response.success('No data found', res, myFavPost)
        }
        for (let post of myFavPost) {
            let checkLike = post?.likedBy?.some((p) => {
                return p.userId.toString() === req.user.id
            })
            checkLike ? post.likedByMe = true : post.likedByMe = false
        }

        for (let post of myFavPost) {
            let checkFav = post?.addTofav?.some((p) => {
                return p.userId.toString() === req.user.id
            })
            checkFav ? post.favorited = true : post.favorited = false
        }
        return response.success('My Fav Post', res, myFavPost)
    }

    async deleteOneByUserId(req, res) {
        console.log('PostController@deleteOne')

        let postId = req.params.id

        let result = await Post.deleteOneByUserId(postId, req.user._id)

        if (!result) {
            return response.badRequest('Unable to delete post', res, false)
        }
        return response.success('Post deleted successfully!', res, false)
    }
}