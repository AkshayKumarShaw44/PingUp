import { Comment } from '../models/comment.model.js'
import { User } from '../models/user.model.js'

// Create comment or reply (parentComment optional)
export const createComment = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { postId, content, parentCommentId } = req.body

    if (!postId || !content) return res.status(400).json({ success: false, message: 'postId and content required' })

    const comment = await Comment.create({ post: postId, user: userId, content, parentComment: parentCommentId || null })
    const populated = await comment.populate('user')
    // include likes count
    const obj = populated.toObject()
    obj.likes_count = (populated.likes || []).length
    // if this comment is a reply, include a parent_preview so the client can render quoted info immediately
    if (parentCommentId) {
      try {
        const parent = await Comment.findById(parentCommentId).populate('user')
        if (parent) {
          obj.parent_preview = {
            user: parent.user,
            content: parent.content,
            createdAt: parent.createdAt
          }
        }
      } catch (e) {
        console.warn('createComment: failed to build parent_preview', e.message)
      }
    }
    return res.status(201).json({ success: true, comment: obj })
  } catch (error) {
    console.error('createComment error', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get comments for a post and return nested tree
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params
    if (!postId) return res.status(400).json({ success: false, message: 'postId required' })

  const comments = await Comment.find({ post: postId }).sort({ createdAt: 1 }).populate('user')

    // Build tree
  const map = {}
  comments.forEach(c => { const o = c.toObject(); o.likes_count = (c.likes || []).length; map[c._id] = { ...o, replies: [] } })
    const roots = []
    // attach replies and also attach a small parent preview on replies so clients can render quoted blocks
    comments.forEach(c => {
      if (c.parentComment) {
        const parent = map[c.parentComment]
        if (parent) {
          parent.replies.push(map[c._id])
          // add parent preview to the child
          map[c._id].parent_preview = {
            user: parent.user,
            content: parent.content,
            createdAt: parent.createdAt
          }
        } else roots.push(map[c._id])
      } else {
        roots.push(map[c._id])
      }
    })

    return res.json({ success: true, comments: roots })
  } catch (error) {
    console.error('getCommentsByPost error', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Edit comment
export const editComment = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { id } = req.params
    const { content } = req.body
    const comment = await Comment.findById(id)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })
    if (comment.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Forbidden' })
    comment.content = content
    await comment.save()
    const populated = await comment.populate('user')
    const obj = populated.toObject()
    obj.likes_count = (populated.likes || []).length
    return res.json({ success: true, comment: obj })
  } catch (error) {
    console.error('editComment error', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Delete comment (soft delete? here full delete and keep replies as is)
export const deleteComment = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { id } = req.params
    const comment = await Comment.findById(id)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })
    if (comment.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Forbidden' })
    await Comment.deleteOne({ _id: id })
    return res.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    console.error('deleteComment error', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Toggle like on a comment
export const toggleLikeComment = async (req, res) => {
  try {
    const { userId } = await req.auth()
    const { id } = req.params
    const comment = await Comment.findById(id)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })
    const idx = comment.likes.findIndex(u => u.toString() === userId)
    if (idx >= 0) {
      comment.likes.splice(idx, 1)
    } else {
      comment.likes.push(userId)
    }
    await comment.save()
    const populated = await comment.populate('user')
    const obj = populated.toObject()
    obj.likes_count = (populated.likes || []).length
    return res.json({ success: true, comment: obj })
  } catch (error) {
    console.error('toggleLikeComment error', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
