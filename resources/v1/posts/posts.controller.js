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

        const userId = req.user._id;
        const posts = await Post.getAllByUserId(userId);
        
        if (!posts.length) {
            return response.success("No data found", res, posts);
        }

        // Process all posts in a single loop
        posts.forEach(post => {
            post.likedByMe = post?.likedBy?.some(p => p.userId.toString() === req.user.id) || false;
            post.favorited = post?.addTofav?.some(p => p.userId.toString() === req.user.id) || false;
        });

        return response.success("Data found successfully", res, posts);
    }

    async likePost(req, res) {
        console.log('PostController@likePost');

        const { postId, like } = _.pick(req.body, ['postId', 'like']);
        const checkPost = req.body.post;
        const userId = req.user._id;

        if (!checkPost) {
            return response.badRequest('Post not found', res, false);
        }

        const isLikeAction = like === 'like';
        const isFavAction = like === 'fav';
        
        if (!isLikeAction && !isFavAction) {
            return response.badRequest('Invalid action', res, false);
        }

        const field = isLikeAction ? 'likedBy' : 'addTofav';
        const isAlreadyActioned = checkPost?.[field]?.some(item => 
            item?.userId?.toString() === req.user.id
        );

        const operation = isAlreadyActioned ? '$pull' : '$push';
        const messages = {
            like: { add: 'Post Liked', remove: 'Post disliked!' },
            fav: { add: 'Added to favourite!', remove: 'Removed from favourite!' }
        };

        const dataToUpdate = {
            [operation]: {
                [field]: { userId }
            }
        };

        const msg = isAlreadyActioned 
            ? messages[like].remove 
            : messages[like].add;

        const postLike = await Post.updateOne({ _id: checkPost._id }, dataToUpdate);
        return response.success(msg, res, postLike);
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