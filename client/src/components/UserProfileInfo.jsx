// import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
// import moment from 'moment'
// import React from 'react'

// function UserProfileInfo({user,posts, profileId, setShowEdit}) {
//   return (
//     <div className='relative py-4 md:px-8 bg-white'>
//         <div className='flex flex-col md:flex-row items-start gap-6'>

//             <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full'>
//                 <img src={user.profile_picture} alt="" className='absolute rounded-full z-2' />
//             </div>
//             <div className='w-full pt-16 md:pt-0 md:pl-36'>
//                 <div className='flex flex-col md:flex-row items-start justify-between'>
//                     <div>
//                         <div className='flex items-center gap-3'>
//                             <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
//                             <Verified className='w-6 h-6 text-blue-500'/>
//                         </div>
//                         <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
//                     </div>
//                     {
//                         !profileId &&
//                         <button onClick={()=>setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer'>
//                             <PenBox className='w-4 h-4'/>
//                             Edit
//                         </button>
//                     }
//                 </div>
//                 <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>
//                 <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
//                     <span className='flex items-center gap-1.5'>
//                         <MapPin className='w-4 h-4'/>
//                         {user.location ? user.location : 'Add location'}
//                     </span>
//                     <span className='flex items-center gap-1.5'>
//                         <Calendar className='w-4 h-4'/>
//                         Joined <span>{moment(user.createdAt).fromNow()}</span>
//                     </span>
//                 </div>
//                 <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
//                     <div>
//                         <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
//                         <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
//                     </div>
//                     <div>
//                         <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
//                         <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
//                     </div>
//                     <div>
//                         <span className='sm:text-xl font-bold text-gray-900'>{user.following.length}</span>
//                         <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
//   )
// }

// export default UserProfileInfo
import { Calendar, MapPin, PenBox, Verified, UserPlus, UserCheck, X } from 'lucide-react'
import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import { fetchUser } from '../features/user/userSlice'
import toast from 'react-hot-toast'

function UserProfileInfo({user, posts, profileId, setShowEdit, refreshProfile}) {
    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const [loadingFollow, setLoadingFollow] = useState(false)
    const navigate = useNavigate()

    const isOwner = !profileId || (currentUser && currentUser._id === profileId)
    const [showList, setShowList] = useState(null) // 'followers' | 'following' | null

    const [localFollowing, setLocalFollowing] = useState(new Set(currentUser?.following || []))
    const [localConnections, setLocalConnections] = useState(new Set(currentUser?.connections || []))
    const [localPending, setLocalPending] = useState(new Set())
    const [localIncoming, setLocalIncoming] = useState(false)
    const [loadingMap, setLoadingMap] = useState({})

    useEffect(() => {
        setLocalFollowing(new Set(currentUser?.following || []))
        setLocalConnections(new Set(currentUser?.connections || []))
        // TODO: if you track outgoing pending connection requests in currentUser, initialize localPending here
        // setLocalPending(new Set(currentUser?.pendingOutgoing || []))
        // initialize from viewed profile flags if provided
        if (user) {
            try {
                if (user.pendingOutgoing) {
                    setLocalPending(prev => new Set([...Array.from(prev), (user._id || '').toString()]))
                } else {
                    setLocalPending(prev => {
                        const next = new Set(Array.from(prev))
                        next.delete((user._id || '').toString())
                        return next
                    })
                }
                setLocalIncoming(!!user.pendingIncoming)
                if (user.isConnected) {
                    setLocalConnections(prev => new Set([...Array.from(prev), (user._id || '').toString()]))
                }
            } catch (e) {
                // ignore
            }
        }
    }, [currentUser])

    // keep localIncoming in sync when user prop updates
    useEffect(() => {
        if (user) {
            setLocalIncoming(!!user.pendingIncoming)
            if (user.pendingOutgoing) {
                setLocalPending(prev => new Set([...Array.from(prev), (user._id || '').toString()]))
            }
            if (user.isConnected) {
                setLocalConnections(prev => new Set([...Array.from(prev), (user._id || '').toString()]))
            }
        }
    }, [user])

    const acceptConnectionById = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }))
            const token = await getToken()
            const { data } = await api.post('/api/user/accept', { id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                // mark connected locally
                setLocalConnections(prev => new Set([...Array.from(prev), id.toString()]))
                setLocalIncoming(false)
                // refresh profile and current user
                refreshProfile && refreshProfile()
                dispatch(fetchUser(token))
            } else {
                toast.error(data.message || 'Accept failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingMap(prev => ({ ...prev, [id]: false })) }
    }

    const connectUserById = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }))
            const token = await getToken()
            const { data } = await api.post('/api/user/connect', { id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                // mark as requested locally — server will set actual connection on accept
                setLocalPending(prev => new Set([...Array.from(prev), id.toString()]))
                // refresh profile view and current user
                refreshProfile && refreshProfile()
                dispatch(fetchUser(token))
            } else {
                toast.error(data.message || 'Connection request failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }))
        }
    }

    // derive following state from localFollowing (allows optimistic UI updates)
    const isFollowing = localFollowing.has((user._id || '').toString())

    const handleFollow = async () => {
        try {
            setLoadingFollow(true)
            const token = await getToken()
            const { data } = await api.post('/api/user/follow', { id: user._id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                // optimistic update
                setLocalFollowing(prev => new Set([...Array.from(prev), user._id.toString()]))
                // refresh viewed profile and current user redux
                refreshProfile && refreshProfile()
                dispatch(fetchUser(token))
            } else {
                toast.error(data.message || 'Follow failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingFollow(false) }
    }

    const handleUnfollow = async () => {
        try {
            setLoadingFollow(true)
            const token = await getToken()
            const { data } = await api.post('/api/user/unfollow', { id: user._id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                // optimistic update
                setLocalFollowing(prev => {
                    const next = new Set(Array.from(prev))
                    next.delete(user._id.toString())
                    return next
                })
                refreshProfile && refreshProfile()
                dispatch(fetchUser(token))
            } else {
                toast.error(data.message || 'Unfollow failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingFollow(false) }
    }

    // follow/unfollow by id for rows in modal
    const followUserById = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }))
            const token = await getToken()
            const { data } = await api.post('/api/user/follow', { id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                // update localFollowing immediately for UI responsiveness
                setLocalFollowing(prev => new Set([...Array.from(prev), id.toString()]))
                refreshProfile && refreshProfile()
            } else {
                toast.error(data.message || 'Follow failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingMap(prev => ({ ...prev, [id]: false })) }
    }

    const unfollowUserById = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }))
            const token = await getToken()
            const { data } = await api.post('/api/user/unfollow', { id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                setLocalFollowing(prev => {
                    const next = new Set(Array.from(prev))
                    next.delete(id.toString())
                    return next
                })
                refreshProfile && refreshProfile()
            } else {
                toast.error(data.message || 'Unfollow failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingMap(prev => ({ ...prev, [id]: false })) }
    }

    const disconnectUserById = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }))
            const token = await getToken()
            const { data } = await api.post('/api/user/disconnect', { id }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success(data.message)
                setLocalConnections(prev => {
                    const next = new Set(Array.from(prev))
                    next.delete(id.toString())
                    return next
                })
                refreshProfile && refreshProfile()
                // refresh current user data in the redux store
                dispatch(fetchUser(token))
            } else {
                toast.error(data.message || 'Disconnect failed')
            }
        } catch (err) {
            toast.error(err.message)
        } finally { setLoadingMap(prev => ({ ...prev, [id]: false })) }
    }

    return (
    <>
    <div className='relative px-4 py-6 md:px-8 bg-white rounded-b-2xl'>
        {/* Main Container: Stacks on mobile, Rows on Desktop */}
        <div className='flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6'>

            {/* Profile Picture Container */}
            <div className='relative md:absolute md:-top-16 -mt-20 md:mt-0'>
                <div className='w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl rounded-full overflow-hidden bg-white'>
                    <img 
                        src={user.profile_picture} 
                        alt={user.full_name} 
                        className='w-full h-full object-cover' 
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className='w-full md:pl-44 pt-2 md:pt-0'>
                <div className='flex flex-col md:flex-row items-center md:items-start justify-between gap-4'>
                    
                    {/* Name and Username */}
                    <div className='text-center md:text-left'>
                        <div className='flex items-center justify-center md:justify-start gap-2'>
                            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>{user.full_name}</h1>
                            <Verified className='w-5 h-5 text-blue-500 fill-blue-500/10' />
                        </div>
                        <p className='text-gray-500 font-medium'>
                            {user.username ? `@${user.username}` : 'Add a username'}
                        </p>
                    </div>

                    {/* Action Button */}
                    {isOwner ? (
                        <button 
                            onClick={() => setShowEdit(true)} 
                            className='flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer'
                        >
                            <PenBox className='w-4 h-4' />
                            Edit Profile
                        </button>
                    ) : (
                        <div className='flex items-center gap-3'>
                            <button onClick={isFollowing ? handleUnfollow : handleFollow} disabled={loadingFollow} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isFollowing ? 'bg-white text-slate-700 border border-gray-200 hover:shadow-sm' : 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95'}`}>
                                {loadingFollow ? '...' : (
                                    isFollowing ? (
                                        <>
                                            <UserCheck className='w-4 h-4 text-indigo-600' />
                                            <span>Following</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className='w-4 h-4' />
                                            <span>Follow</span>
                                        </>
                                    )
                                )}
                            </button>
                            {/* Remove direct Message button from profile header; show Disconnect when connected */}
                            {/* Show Disconnect when connected, Requested when pending, otherwise Connect */}
                            {currentUser && currentUser._id !== user._id && (
                                (() => {
                                    const uid = (user._id || '').toString()
                                    if (localIncoming) {
                                        return (
                                            <button onClick={() => acceptConnectionById(uid)} disabled={!!loadingMap[uid]} className='px-3 py-2 rounded-full text-sm border border-indigo-200 text-indigo-700 hover:bg-indigo-50'>
                                                Accept
                                            </button>
                                        )
                                    }
                                    if (localConnections.has(uid)) {
                                        return (
                                            <button onClick={() => disconnectUserById(user._id)} disabled={!!loadingMap[uid]} className='px-3 py-2 rounded-full text-sm border border-red-200 text-red-600 hover:bg-red-50'>
                                                Disconnect
                                            </button>
                                        )
                                    }
                                    if (localPending.has(uid)) {
                                        return (
                                            <button disabled className='px-3 py-2 rounded-full text-sm border border-gray-200 text-gray-500 bg-gray-50'>
                                                Requested
                                            </button>
                                        )
                                    }
                                    return (
                                        <button onClick={() => connectUserById(user._id)} disabled={!!loadingMap[uid]} className='px-3 py-2 rounded-full text-sm bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95'>
                                            Connect
                                        </button>
                                    )
                                })()
                            )}
                        </div>
                    )}
                </div>

                {/* Bio */}
                <p className='text-gray-700 text-sm text-center md:text-left max-w-lg mt-4 leading-relaxed'>
                    {user.bio || "No bio added yet."}
                </p>

                {/* Metadata: Location & Date */}
                <div className='flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                    <span className='flex items-center gap-1.5'>
                        <MapPin className='w-4 h-4 text-gray-400' />
                        {user.location || 'Add location'}
                    </span>
                    <span className='flex items-center gap-1.5'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        Joined {moment(user.createdAt).format('MMMM YYYY')}
                    </span>
                </div>

                {/* Stats Bar */}
                <div className='flex items-center justify-around md:justify-start gap-8 mt-6 border-t border-gray-100 pt-5'>
                                            <div className='text-center md:text-left'>
                                                    <p className='text-lg md:text-xl font-bold text-gray-900'>{posts.length}</p>
                                                    <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Posts</p>
                                            </div>
                                            <div className='text-center md:text-left'>
                                                    <button onClick={() => setShowList('followers')} className='text-left'>
                                                        <p className='text-lg md:text-xl font-bold text-gray-900'>{Array.isArray(user.followers) ? user.followers.length : 0}</p>
                                                        <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Followers</p>
                                                    </button>
                                            </div>
                                            <div className='text-center md:text-left'>
                                                    <button onClick={() => setShowList('following')} className='text-left'>
                                                        <p className='text-lg md:text-xl font-bold text-gray-900'>{Array.isArray(user.following) ? user.following.length : 0}</p>
                                                        <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Following</p>
                                                    </button>
                                            </div>
                </div>
            </div>
        </div>
        </div>
        {showList && (
            <div className='fixed inset-0 z-50 flex items-center justify-center'>
                <div className='absolute inset-0 bg-black/30' onClick={() => setShowList(null)} />
                <div className='relative w-11/12 max-w-2xl bg-white rounded-lg shadow-lg p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <h3 className='font-semibold text-lg'>{showList === 'followers' ? 'Followers' : 'Following'}</h3>
                                <button onClick={() => setShowList(null)} className='text-gray-500 p-1 rounded hover:bg-gray-100'>
                                    <X className='w-4 h-4' />
                                </button>
                            </div>
                    <div className='max-h-80 overflow-y-auto divide-y'>
                        {(showList === 'followers' ? (user.followers || []) : (user.following || [])).map((u) => (
                            <div key={u._id} className='flex items-center gap-3 py-3'>
                                <img src={u.profile_picture} alt='' className='w-10 h-10 rounded-full object-cover' />
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between gap-3'>
                                        <div className='min-w-0'>
                                            <p className='font-medium truncate'>{u.full_name}</p>
                                            <p className='text-xs text-gray-500 truncate'>@{u.username}</p>
                                        </div>
                                    </div>
                                    <p className='text-xs text-gray-600 mt-1 truncate'>{u.bio}</p>
                                </div>
                                                <div className='flex items-center gap-2'>
                                                    {/* Follow / Unfollow button for each user in the list */}
                                                    {currentUser && currentUser._id !== u._id && (
                                                        (() => {
                                                            const uid = u._id.toString()
                                                            const isFollowingRow = localFollowing.has(uid)
                                                            const loading = !!loadingMap[uid]
                                                            const isConnectedRow = localConnections.has(uid)
                                                            return (
                                                                <button onClick={() => (isFollowingRow ? unfollowUserById(uid) : followUserById(uid))} disabled={loading} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition ${isFollowingRow ? 'bg-white text-slate-700 border border-gray-200 hover:shadow-sm' : 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95'}`}>
                                                                    {loading ? '...' : (
                                                                        isFollowingRow ? (
                                                                            <>
                                                                                <UserCheck className='w-4 h-4 text-indigo-600' />
                                                                                <span>Following</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UserPlus className='w-4 h-4' />
                                                                                <span>Follow</span>
                                                                            </>
                                                                        )
                                                                    )}
                                                                </button>
                                                            )
                                                        })()
                                                    )}
                                                    <button onClick={() => navigate(`/messages/${u._id}`)} className='px-3 py-1.5 text-sm rounded-md border border-gray-200 text-slate-700'>Message</button>
                                                    {currentUser && currentUser._id !== u._id && localConnections.has(u._id.toString()) && (
                                                        <button onClick={() => disconnectUserById(u._id)} disabled={!!loadingMap[u._id.toString()]} className='px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50'>Disconnect</button>
                                                    )}
                                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default UserProfileInfo