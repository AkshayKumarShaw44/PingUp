import React, { useState } from 'react'
import { MoreHorizontal, Edit2, Trash2, CornerUpLeft, Heart } from 'lucide-react'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

function CommentItem({ comment, replyTo, onReply, onReplySubmit, onEditLocal, onDeleteLocal, openMenuId, setOpenMenuId }) {
  const currentUser = useSelector((state) => state.user.value)
  const { getToken } = useAuth()
  const menuOpen = openMenuId === comment._id
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content)
  const [replyText, setReplyText] = useState('')
  const [liking, setLiking] = useState(false)

  const isOwner = currentUser && currentUser._id === comment.user._id
  const likedByMe = currentUser && (
    (Array.isArray(comment.likes) && comment.likes.includes(currentUser._id)) ||
    (Array.isArray(comment.liked_by) && comment.liked_by.includes(currentUser._id))
  )
  const likesCount = Array.isArray(comment.likes) ? comment.likes.length : (typeof comment.likes_count === 'number' ? comment.likes_count : 0)

  // prepare a cleaned, single-line snippet for parent preview to avoid merged timestamps/newlines
  const parentPreviewRaw = comment.parent_preview && comment.parent_preview.content ? String(comment.parent_preview.content) : ''
  const parentPreviewClean = parentPreviewRaw.replace(/\s+/g, ' ').trim()
  const parentPreviewSnippet = parentPreviewClean.slice(0, 220)
  const parentPreviewTruncated = parentPreviewClean.length > parentPreviewSnippet.length

  const handleEdit = async () => {
    try {
      const token = await getToken()
      const { data } = await api.put('/api/comment/' + comment._id, { content: text }, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        onEditLocal(data.comment)
        setEditing(false)
        toast.success('Comment updated')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    try {
      const token = await getToken()
      const { data } = await api.delete('/api/comment/' + comment._id, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        onDeleteLocal(comment._id)
        toast.success('Comment deleted')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleLike = async () => {
    if (!getToken) return
    try {
      setLiking(true)
      const token = await getToken()
      const { data } = await api.post(`/api/comment/${comment._id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        // update local like count
        onEditLocal(data.comment)
      }
    } catch (err) {
      toast.error(err.message)
    } finally { setLiking(false) }
  }

  const submitReply = async () => {
    if (!replyText.trim()) return
    try {
      const token = await getToken()
      const { data } = await api.post('/api/comment/create', { postId: comment.post, content: replyText, parentCommentId: comment._id }, { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setReplyText('')
        onReplySubmit && onReplySubmit()
      }
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className='flex gap-3 items-start'>
      <img src={comment.user.profile_picture} alt='' className='w-9 h-9 rounded-full shadow' />
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <b className='text-sm'>{comment.user.full_name}</b>
              <span className='text-xs text-gray-500 min-w-0'>@{comment.user.username} · {moment(comment.createdAt).fromNow()}</span>
            </div>
            {!editing ? (
              <>
                {/* show quoted parent preview if present */}
                {comment.parent_preview && (
                  <div className='mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-gray-200'>
                    <div className='flex items-start gap-2'>
                      <div className='text-xs font-medium text-gray-700'>@{comment.parent_preview.user.username || comment.parent_preview.user.full_name}</div>
                      <div className='text-xs text-gray-400 ml-auto'>{comment.parent_preview.createdAt ? moment(comment.parent_preview.createdAt).format('h:mm A') : ''}</div>
                    </div>
                    <div className='text-xs text-gray-600 mt-1 whitespace-pre-wrap wrap-break-word max-h-14 overflow-hidden' title={comment.parent_preview.content}>
                      {parentPreviewSnippet}
                      {parentPreviewTruncated ? '…' : ''}
                    </div>
                  </div>
                )}
                <p className='text-sm text-gray-800 mt-1'>{comment.content}</p>
              </>
            ) : (
              <div className='mt-2'>
                <textarea value={text} onChange={(e) => setText(e.target.value)} className='w-full p-2 border rounded-md' />
                <div className='flex gap-2 mt-2'>
                  <button onClick={handleEdit} className='px-3 py-1 bg-indigo-600 text-white rounded'>Save</button>
                  <button onClick={() => { setEditing(false); setText(comment.content) }} className='px-3 py-1 border rounded'>Cancel</button>
                </div>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2 relative shrink-0'>
            <button onClick={handleLike} className={`flex items-center gap-1 p-1 rounded ${liking ? 'opacity-70' : 'hover:bg-gray-100'}`} aria-pressed={likedByMe} aria-label='Like'>
              <Heart className={`w-4 h-4 ${likedByMe ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
              <span className='text-xs'>{likesCount}</span>
            </button>
            <button onClick={() => onReply(comment._id)} className='flex items-center gap-1 p-1 rounded hover:bg-gray-100 text-xs'>
              Reply
            </button>
            {isOwner && (
              <>
                <button onClick={() => setOpenMenuId(menuOpen ? null : comment._id)} className='p-1 rounded-full hover:bg-gray-100'>
                  <MoreHorizontal className='w-4 h-4' />
                </button>
                {menuOpen && (
                  <div className='absolute top-full right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg p-1 z-50'>
                    <div className='flex flex-col'>
                      <button onClick={() => { setEditing(true); setOpenMenuId(null) }} className='flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded'>
                        <Edit2 className='w-4 h-4 text-indigo-600'/> <span>Edit</span>
                      </button>
                      <button onClick={() => { if (confirm('Delete comment?')) handleDelete() }} className='flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-sm text-red-600 rounded'>
                        <Trash2 className='w-4 h-4 text-red-600'/> <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className='mt-3 pl-4 border-l border-gray-100 space-y-3'>
            {comment.replies.map((r) => (
              <CommentItem key={r._id}
                comment={r}
                replyTo={replyTo}
                onReply={onReply}
                onReplySubmit={onReplySubmit}
                onEditLocal={(c) => onEditLocal(c)}
                onDeleteLocal={(id) => onDeleteLocal(id)}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>
        )}

        {/* Inline reply box (near the comment) */}
        {replyTo === comment._id && (
          <div className='mt-3 pl-0'>
            <div className='relative flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm'>
              {/* corner close button removed per UX request */}
              <img src={currentUser?.profile_picture} alt='' className='w-8 h-8 rounded-full' />
              <div className='flex-1'>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className='w-full p-2 border border-gray-200 rounded-lg shadow-sm bg-white placeholder-gray-400 resize-none min-h-12 focus:outline-none focus:ring-2 focus:ring-indigo-100'
                  placeholder='Write a reply...'
                />
                <div className='flex gap-2 mt-2'>
                  <button onClick={submitReply} className='px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition text-sm'>Reply</button>
                  <button onClick={() => { setReplyText(''); onReply(null) }} className='px-3 py-1.5 border rounded-md bg-white hover:bg-gray-50 transition text-sm'>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
