const _ = require('lodash')
const DataHelper = require('../../../helpers/v1/data.helpers')
const _DataHelper = new DataHelper()
const ResponseHelper = require('../../../helpers/v1/response.helper')
const response = new ResponseHelper()
const UserResources = require('./users.resources')
const Users = new UserResources()

module.exports = class UserController {

    async createOne(req, res) {
        console.log('UserController@createOne')

        let data = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'profileImage', 'role']);


        let hashedPassword = await _DataHelper.hashPassword(data.password)

        let dataToInsert = {
            email: data.email,
            password: hashedPassword,
            role: data.role || 'user',
            userInfo: {
                firstName: data.firstName || "",
                lastName: data.lastName || "",

                profileImage: data.profileImage || ""
            },
            otp: '1111'
        }

        let userDetails = await Users.createOne(dataToInsert)

        // generate token
        let token = await _DataHelper.generateToken({ user_id: userDetails._id, email: userDetails.email, name: userDetails?.userInfo?.firstName + userDetails?.userInfo?.lastName })
        let dataToUpdate = {
            token: {
                authToken: token
            }
        }
        await Users.updateOne(userDetails._id, dataToUpdate)

        if (!userDetails) {
            return response.badRequest('Unable to create user', res, false)
        }
        // to-do    send mail otp to user

        //get formatted data
        userDetails = await Users.getOne(userDetails._id)
        let result = await Users.getFormattedData(userDetails)
        return response.success('User created successfully', res, result)
    }

    async verify(req, res) {
        console.log('UserController@verify')

        let data = _.pick(req.body, ['email', 'otp'])

        let user = await Users.getByEmail(data.email);
        if (!user) {
            return response.conflict(`Email Id doesn't exist`, res, null);
        }
        if (user && user.otp !== data.otp) {
            return response.conflict('Invalid OTP', res, null);
        }
        let updatedUserObj = await Users.updateOne(user._id, { isVerified: true })
        updatedUserObj = await Users.getOne(user._id)

        let result = await Users.getFormattedData(updatedUserObj);
        return response.success("OTP verified", res, { email: result.email });

    }

    async login(req, res) {
        console.log('UserController@login')

        let userDetails = req.user

        let token = await _DataHelper.generateToken({ user_id: userDetails._id, email: userDetails.email, name: userDetails?.userInfo?.firstName + userDetails?.userInfo?.lastName })

        let userData = {
            token: {
                authToken: token
            }
        }

        let user = await Users.updateOne(userDetails._id, userData)
        if (!user) {
            return response.badRequest('Unable to login user!', res, null);
        }
        user = await Users.getOne(userDetails._id)
        const result = await Users.getFormattedData(user);
        return response.success("Logged in successfully", res, result);
    }

    async updateProfile(req, res) {
        console.log('UserController@updaetProfile')

        let data = _.pick(req.body, ['firstName', 'lastName', 'profileImage'])

        let dataToUpdate = {
            userInfo: {
                firstName: data.firstName,
                lastName: data.lastName,
                profileImage: data.profileImage
            }
        }
        let updateProfile = await Users.updateOne(req.user._id, dataToUpdate)

        if (!updateProfile) {
            return response.badRequest('Unable to update profile', res, false)
        }

        return response.success('Profile updated successfully', res, false)
    }

    async forgotPassword(req, res) {
        console.log('UserController@forgotPassword');

        let data = _.pick(req.body, ['email']);
        let otp = '1234'

        let updatedUserObj = await Users.updateOne(req.user._id, { otp: otp })

        if (!updatedUserObj) {
            return response.badRequest('Unable to send OTP', res);
        }

        // TODO ->send otp via email to the user
        return response.success("Forgot password OTP send successfully", res, { email: data.email });

    }

    async resetPassword(req, res) {
        console.log('UserController@resetPassword')

        let data = _.pick(req.body, ['password', 'confirmPassword', 'email'])

        let hashedPassword = await _DataHelper.hashPassword(data.password)
        let updateUser = await Users.updateOne(req.user._id, { password: hashedPassword })

        if (!updateUser) {
            return response.badRequest('Unable reset your password.', res, null);
        }
        return response.success("password changed successfully.", res, true)

    }

    async userProfile(req, res) {
        console.log('UserController@userProfile')

        let user = req.user;

        let userDetails = await Users.getOne(user._id)
        if (!userDetails) {
            return response.success('Unable to find user', res, false)
        }

        userDetails = await Users.getFormattedData(userDetails);

        return response.success('User details find successfully', res, userDetails)
    }

    async uploadFile(req, res) {
        console.log('UserController@uploadFile')

        if (req.file == undefined) {
            return response.badRequest('invalid request data. Please add file to request', res);
        }

        let fileUrl = {
            fileUrl: `${process.env.API_URL}` + "/" + `${req.file.path}`
        }
        console.log('fileurl========>>', fileUrl)
        return response.success("File uploaded successfully", res, fileUrl)
    }


    async getOneById(req, res) {
        console.log('UserController@getOneById')

        let userId
        if (req.params.id) {
            userId = req.params.id;
        }else {
            userId = req.user.id
        }
        // req.params.id ? userId = req.params.id : userId = req.user._id
        let userDetails = await Users.getOneById(userId);

        if (!userDetails) {
            return response.success('Unable to find user details', res, false)
        }

        if (userDetails?.postDetails.length) {

            for (let post of userDetails?.postDetails) {
                post.likeCount = post?.likedBy.length
                let checkLike = post?.likedBy?.some((p) => {
                    return p.userId.toString() === req.user.id
                })
                checkLike ? post.likedByMe = true : post.likedByMe = false
                let checkFav = post?.addTofav?.some((p) => {
                    return p.userId.toString() === req.user.id
                })
                checkFav ? post.favorited = true : post.favorited = false
            }
        }
        return response.success('User details found successfully', res, userDetails);

    }

    async userFollowUnfollow(req, res) {
        console.log('UserController@userFollowUnfollow')

        let data = _.pick(req.body, ['userId', 'type', 'userDetails'])

        const currentUserId = req.user._id.toString();
        const targetUserId = data.userId;
        if (currentUserId === targetUserId) {
            return response.success('Cannot follow/unfollow yourself', res, false);
        }

        let dataToUpdate;

        // check current user following list
        if (req.user?.following && req.user.following.length) {
            var isFollowing = req.user.following.includes(targetUserId);
        }
        let updateCurrentUser, updateTargetUser;


        //  todo check others user following list(userDetails)

        if (data.type === 'follow') {
            if (isFollowing) {
                return response.success('Already following this user', res, false);

            } else {
                updateCurrentUser = { $push: { following: targetUserId } };
                updateTargetUser = { $push: { followers: currentUserId } };
            }
        } else if (data.type === 'unfollow') {
            if (!isFollowing) {
                return response.success('Already unfollowed', res, false);
            }
            updateCurrentUser = { $pull: { following: targetUserId } };
            updateTargetUser = { $pull: { followers: currentUserId } };

        } else {
            return response.success('Invalid type provided', res, false);
        }
        // Update current user's following list
        const currentUserUpdateResult = await Users.updateOne(currentUserId, updateCurrentUser);
        // Update target user's followers list
        const targetUserUpdateResult = await Users.updateOne(targetUserId, updateTargetUser);
        if (!currentUserUpdateResult || !targetUserUpdateResult) {
            return response.error('Unable to perform follow/unfollow operation', res);
        }
        return response.success('Operation successful', res, true);

    }

    async getFollowerFollowingList(req, res) {
        console.log('UserController@getFollowerFollowingList')

        let user = await Users.getOneById(req.user._id);
        if (!user) {
            return response.success("Unable to find data", res, false)
        }
        return response.success('Successfull', res, user)
    }
}