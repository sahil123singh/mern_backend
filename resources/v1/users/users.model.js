const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userInfo: {
        firstName: {
            type: String,
            default: '',
            required: false
        },
        lastName: {
            type: String,
            default: '',
            required: false
        },
        profileImage: {
            type: String,
            default: '',
            required: false
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"], // allowed values
        default: "user"
    },
    token: {
        authToken: {
            type: String,
        }
    },
    otp: {
        type: String,
    },
    isVerified: {
        type: String,
    }
},
    { timestamps: true }
)

const User = mongoose.model("User", UserSchema)
module.exports = User