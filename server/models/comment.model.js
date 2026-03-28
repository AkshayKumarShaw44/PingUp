import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
        post: { type: String, ref: 'Post', required: true },
        user: { type: String, ref: 'User', required: true },
        content: { type: String, required: true },
        parentComment: { type: String, ref: 'Comment', default: null },
        likes: [
            { type: String, ref: 'User' }
        ]
}, { timestamps: true })

export const Comment = mongoose.model('Comment', commentSchema)
