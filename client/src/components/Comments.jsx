import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import CommentItem from './CommentItem'

function Comments({ postId, onCountChange }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [showComposer, setShowComposer] = useState(true)
  const [openMenuId, setOpenMenuId] = useState(null)
  const { getToken } = useAuth()

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/comment/post/${postId}`)
      if (data.success) setComments(data.comments)
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchComments() }, [postId])

  // compute total comments including nested replies and notify parent
  useEffect(() => {
    if (typeof onCountChange !== 'function') return
    const countReplies = (nodes) => nodes.reduce((acc, n) => acc + 1 + countReplies(n.replies || []), 0)
    const total = countReplies(comments || [])
    onCountChange(total)
  }, [comments, onCountChange])

  const handleSubmit = async () => {
    if (!text.trim()) return
    try {
      const token = await getToken()
      const { data } = await api.post('/api/comment/create', { postId, content: text, parentCommentId: replyTo }, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setText('')
        setReplyTo(null)
        // re-fetch for simplicity
        fetchComments()
        // collapse top composer after posting to declutter UI
        setShowComposer(false)
      }
    } catch (err) { toast.error(err.message) }
  }

  const handleReply = (parentId) => {
    setReplyTo(parentId)
    // when replying, ensure composer is visible
    setShowComposer(true)
  }

  const onEditLocal = (updated) => {
    // replace comment object in local tree while preserving replies if present
    const walk = (nodes) => nodes.map(n => {
      if (n._id === updated._id) {
        return { ...(updated), replies: n.replies || [] }
      }
      return { ...n, replies: walk(n.replies || []) }
    })
    setComments(prev => walk(prev))
  }

  const onDeleteLocal = (id) => {
    const walk = (nodes) => nodes.filter(n => n._id !== id).map(n => ({ ...n, replies: walk(n.replies || []) }))
    setComments(prev => walk(prev))
  }

  return (
    <div className='mt-4'>
      <div>
        {showComposer ? (
          <div className='relative flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100'>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? 'Replying...' : 'Add a comment'}
              className='flex-1 p-3 pr-4 border border-gray-200 rounded-xl shadow-sm bg-white placeholder-gray-400 resize-none min-h-14 focus:outline-none focus:ring-2 focus:ring-indigo-100'
            />
            <div className='flex flex-col gap-2 items-end'>
              <div className='flex flex-col gap-2'>
                <button onClick={handleSubmit} className='px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition text-sm'>Post</button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setShowComposer(true)} className='px-3 py-1.5 rounded-md border bg-white shadow-sm hover:bg-gray-50 transition text-sm'>Add a comment</button>
          </div>
        )}
      </div>

      <div className='mt-4 space-y-4'>
        {loading ? (<p>Loading comments...</p>) : (
          comments.length === 0 ? <p className='text-gray-500'>No comments yet</p> : (
            comments.map(c => (
              <CommentItem
                key={c._id}
                comment={c}
                replyTo={replyTo}
                onReply={handleReply}
                onReplySubmit={() => { setReplyTo(null); fetchComments() }}
                onEditLocal={onEditLocal}
                onDeleteLocal={onDeleteLocal}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))
          )
        )}
      </div>
    </div>
  )
}

export default Comments
