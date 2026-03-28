import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { ImageIcon, SendHorizonal, MoreHorizontal, Edit2, Trash2, CornerUpLeft, X } from 'lucide-react'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {useAuth} from '@clerk/clerk-react'
import { addMessage, fetchMessages, resetMessages, updateMessage, removeMessage } from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'
import api from '../api/axios'


function ChatBox() {
  const {messages} = useSelector((state)=>state.messages)
  const currentUser = useSelector((state) => state.user.value)
  const { userId } =useParams()
  const dispatch = useDispatch()
  const { getToken } = useAuth()
  const [text, setText] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [replyToMsg, setReplyToMsg] = useState(null)
  const [image, setImages] = useState(null)
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const {connections} = useSelector((state) => state.connections)

  const fetchUserMessages = async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({token, userId}))
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendMessage = async() => {
    try {
      if(!text && !image){
        return 
      }
      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text',text)
      // include parent message id when replying
      if (replyToMsg && replyToMsg.id) formData.append('parentMessageId', replyToMsg.id)
      image && formData.append('image',image)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}`}
      })
      if(data.success){
        setText('')
        setImages(null)
        setReplyToMsg(null)
        dispatch(addMessage(data.message))
      }
      else{
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchUserMessages()
    return ()=>{
      dispatch(resetMessages)
    }
  },[userId])

  useEffect(()=>{
    const user = connections.find(connection => connection._id === userId)
    setUser(user)
  },[connections,userId])

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behaviour: "smooth"})
  },[messages])

  useEffect(() => {
    if (replyToMsg) {
      // focus composer input when replying
      inputRef.current?.focus()
    }
  }, [replyToMsg])

  return user && (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
        </div>
      </div>

      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {
            messages.slice().sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt)).map((message, index)=>{
              const fromId = message && typeof message.from_user_id === 'object' ? message.from_user_id._id : message.from_user_id
              const isOwner = currentUser && fromId === currentUser._id
              const alignClass = isOwner ? 'items-end' : 'items-start'
              const bubbleRound = isOwner ? 'rounded-br-none' : 'rounded-bl-none'
              return (
                <div key={message._id || index} className={`flex flex-col ${alignClass} w-full min-w-0`}>
                  <div className={`p-2 text-sm max-w-sm w-full overflow-visible wrap-break-word ${isOwner ? 'bg-indigo-50 text-slate-900' : 'bg-white text-slate-700'} rounded-lg shadow ${bubbleRound}`}>
                    {
                      message.message_type === 'image' && <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                    }
                      {/* message content or edit box */}
                    {editingId === message._id ? (
                      <div>
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className='w-full p-2 border rounded-md' />
                        <div className='flex gap-2 mt-2'>
                          <button onClick={async () => {
                            try {
                              const token = await getToken()
                              const { data } = await api.put(`/api/message/${message._id}`, { text: editText }, { headers: { Authorization: `Bearer ${token}` } })
                              if (data.success) {
                                dispatch(updateMessage(data.message))
                                setEditingId(null)
                                setEditText('')
                                toast.success('Message updated')
                              } else {
                                throw new Error(data.message || 'Update failed')
                              }
                            } catch (err) {
                              toast.error(err.message)
                            }
                          }} className='px-3 py-1 bg-indigo-600 text-white rounded'>Save</button>
                          <button onClick={() => { setEditingId(null); setEditText('') }} className='px-3 py-1 border rounded'>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* show sender name on incoming messages */}
                        {!isOwner && typeof message.from_user_id === 'object' && (
                          <div className='text-xs text-gray-500 font-medium mb-1'>@{message.from_user_id.username}</div>
                        )}
                        {/* if this message replies to another, show a small quoted block */}
                        {message.parentMessageId && (
                          <div className='mb-2 p-2 bg-gray-100 rounded text-xs text-gray-600 border-l-4 border-indigo-200'>
                            <div className='flex items-start gap-2'>
                              {/* avatar of original message sender (small) */}
                              {typeof message.parentMessageId === 'object' && message.parentMessageId.from_user_id && message.parentMessageId.from_user_id.profile_picture ? (
                                <img src={message.parentMessageId.from_user_id.profile_picture} alt='' className='w-6 h-6 rounded-sm object-cover' />
                              ) : (
                                <div className='w-6 h-6 rounded-sm bg-gray-200' />
                              )}
                              <div className='flex-1'>
                                <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
                                  <div className='font-medium text-gray-700'>
                                    @{(typeof message.parentMessageId === 'object' && message.parentMessageId.from_user_id && (message.parentMessageId.from_user_id.username || message.parentMessageId.from_user_id.full_name)) || ''}
                                  </div>
                                  <div className='ml-2 text-gray-400' title={typeof message.parentMessageId === 'object' && message.parentMessageId.createdAt ? moment(message.parentMessageId.createdAt).fromNow() : ''}>
                                    {typeof message.parentMessageId === 'object' && message.parentMessageId.createdAt ? moment(message.parentMessageId.createdAt).format('h:mm A') : ''}
                                  </div>
                                </div>
                                <div className='text-xs text-gray-600 wrap-break-word break-all whitespace-pre-wrap max-w-full overflow-hidden' title={(typeof message.parentMessageId === 'object' ? message.parentMessageId.text : '')}>
                                  {(typeof message.parentMessageId === 'object' ? message.parentMessageId.text : '')}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {(() => {
                          let displayText = message.text || ''
                          // if this message is a reply and the text begins with an @mention of the replied user,
                          // strip it from the displayed text to avoid duplication (we already show the quoted block)
                          try {
                            const repliedUser = message.parentMessageId && message.parentMessageId.from_user_id && message.parentMessageId.from_user_id.username
                            if (message.parentMessageId && repliedUser && displayText.startsWith(`@${repliedUser} `)) {
                              displayText = displayText.replace(new RegExp(`^@${repliedUser}\\s+`), '')
                            }
                          } catch (e) {
                            // ignore and show original text
                          }
                          return <p className='whitespace-pre-wrap break-words break-all max-w-full'>{displayText}</p>
                        })()}
                        <div className='flex items-center gap-2 text-xs text-gray-400 mt-1'>
                          <span title={moment(message.createdAt).fromNow()}>{moment(message.createdAt).format('h:mm A')}</span>
                          <div className='relative'>
                            <button onClick={() => setOpenMenuId(openMenuId === message._id ? null : message._id)} className='p-1 rounded-full hover:bg-gray-100'>
                              <MoreHorizontal className='w-4 h-4' />
                            </button>
                            {openMenuId === message._id && (
                              <div className='absolute top-full right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-2 z-50'>
                                <div className='flex justify-end'>
                                  <button onClick={() => setOpenMenuId(null)} className='p-1 rounded hover:bg-gray-100 text-gray-500'>
                                    <X className='w-3 h-3' />
                                  </button>
                                </div>
                                <div className='flex flex-col mt-1'>
                                  {/* Reply option visible to everyone */}
                                  <button onClick={() => {
                                    let username = ''
                                    if (message && typeof message.from_user_id === 'object') {
                                      username = message.from_user_id.username || message.from_user_id.full_name || ''
                                    } else {
                                      username = (message.from_user_id === currentUser?._id) ? (currentUser?.username || currentUser?.full_name || '') : (user?.username || user?.full_name || '')
                                    }
                                    setReplyToMsg({ id: message._id, username, text: message.text || '' })
                                    if (username) setText(`@${username} `)
                                    inputRef.current?.focus()
                                    setOpenMenuId(null)
                                  }} className='flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded'>
                                    <CornerUpLeft className='w-4 h-4 text-indigo-600'/> <span>Reply</span>
                                  </button>

                                  {/* Owner-only actions */}
                                  {isOwner && (
                                    <>
                                      <button onClick={() => { setEditingId(message._id); setEditText(message.text); setOpenMenuId(null) }} className='flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded'>
                                        <Edit2 className='w-4 h-4 text-indigo-600'/> <span>Edit</span>
                                      </button>
                                      <button onClick={async () => {
                                        if (!confirm('Delete message?')) { setOpenMenuId(null); return }
                                        try {
                                          const token = await getToken()
                                          const { data } = await api.delete(`/api/message/${message._id}`, { headers: { Authorization: `Bearer ${token}` } })
                                          if (data.success) {
                                            dispatch(removeMessage(message._id))
                                            toast.success('Message deleted')
                                          } else {
                                            throw new Error(data.message || 'Delete failed')
                                          }
                                        } catch (err) {
                                          toast.error(err.message)
                                        } finally { setOpenMenuId(null) }
                                      }} className='flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-sm text-red-600 rounded'>
                                        <Trash2 className='w-4 h-4 text-red-600'/> <span>Delete</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          }
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className='px-4'>
          <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <div className='flex-1'>
            {replyToMsg && (
                <div className='text-xs text-gray-500 mb-1'>
                <div className='flex items-center justify-between'>
                  <span>Replying to @{replyToMsg.username}</span>
                  <button onClick={() => setReplyToMsg(null)} className='p-1 rounded hover:bg-gray-200 text-gray-400'>
                    <X className='w-3 h-3' />
                  </button>
                </div>
                {replyToMsg.text && (
                  <div className='text-xs text-gray-600 italic mt-1 max-w-full truncate'>{replyToMsg.text}</div>
                )}
              </div>
            )}
            <input ref={inputRef} type="text" className='w-full outline-none text-slate-700' placeholder='Type a message...' onKeyDown={e=>e.key === 'Enter' && sendMessage()} onChange={(e)=>setText(e.target.value)} value={text} />
          </div>
          <label htmlFor="image">
            {
              image 
              ? <img src={URL.createObjectURL(image)} alt="" className='h-8 rounded' />
              :
              <ImageIcon className='size-6 text-gray-400 cursor-pointer '/>
            }
            <input type="file" id="image" accept='image/*' hidden onChange={(e)=>setImages(e.target.files[0])} />
          </label>
          <button onClick={sendMessage} className='bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full'>
            <SendHorizonal size={18}/>
          </button>
        </div>

      </div>
    </div>
  )
}

export default ChatBox