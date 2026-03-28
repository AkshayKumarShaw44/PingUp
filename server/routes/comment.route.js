import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createComment, getCommentsByPost, editComment, deleteComment, toggleLikeComment } from '../controllers/comment.controller.js'

const router = express.Router()

router.post('/create', protect, createComment)
router.get('/post/:postId', getCommentsByPost)
router.post('/:id/like', protect, toggleLikeComment)
router.put('/:id', protect, editComment)
router.delete('/:id', protect, deleteComment)

export default router
