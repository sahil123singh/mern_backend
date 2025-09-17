let mongoose = require("mongoose")
Schema = mongoose.Schema

const PostSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    likedBy: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    addTofav: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }

        }],
    deletedAt: { type: String, default: '' }

},
    { timestamps: true }
)

const Posts = mongoose.model("Post", PostSchema)
module.exports = Posts