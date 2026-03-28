import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from_user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    to_user_id: {
        type: String,
        required: true,
        ref: 'User'     
    },
    text: {
        type: String,
        trim: true
    },
    message_type: {
        type: String,
        enum: ['text', 'image'],
    },
    media_url: {
        type: String,
    },
    parentMessageId: {
        type: String,
        ref: 'Message',
    },
    seen: {
        type: Boolean,
        default: false
    }
},{ timestamps: true, minimize: false});

export const Message = mongoose.model('Message', messageSchema);

