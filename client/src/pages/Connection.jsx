import React, {useEffect, useState} from 'react'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'


function Connection() {
  const [currentTab, setCurrentTab] = useState('Followers')
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const {connections, pendingConnections, followers, following } = useSelector((state)=>state.connections)

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus },
  ]

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/unfollow', {id: userId}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      }
      else{
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post('/api/user/accept', {id: userId}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      }
      else{
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    getToken().then((token)=>{
      dispatch(fetchConnections(token))
    })
  },[])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>

        {/* stats */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6'>
          {dataArray.map((item, index)=> (
            <div key={index} className='flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100'>
              <div className='w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600'>
                <item.icon className='w-5 h-5' />
              </div>
              <div>
                <div className='text-lg font-semibold text-slate-800'>{item.value.length}</div>
                <div className='text-xs text-slate-500'>{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className='mb-6'>
          <div className='inline-flex bg-white shadow-sm rounded-full p-1 border border-gray-100'>
            {dataArray.map((tab)=> (
              <button key={tab.label} onClick={()=> setCurrentTab(tab.label)} className={`px-4 py-2 text-sm rounded-full transition ${currentTab === tab.label ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
                <div className='flex items-center gap-2'>
                  <tab.icon className='w-4 h-4' />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {dataArray.find((item)=>item.label === currentTab).value.map((user)=> (
            <div key={user._id} className='flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 items-center'>
              <img src={user.profile_picture} alt="" className='rounded-full w-14 h-14 shadow-md object-cover' />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='font-semibold text-slate-800 truncate'>{user.full_name}</p>
                    <p className='text-xs text-slate-500 truncate'>@{user.username}</p>
                  </div>
                  <div className='text-xs text-slate-400'>{/* placeholder for mutuals or time */}</div>
                </div>
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{user.bio}</p>

                <div className='flex flex-wrap gap-2 mt-4'>
                  <button onClick={()=> navigate(`/profile/${user._id}`)} className='px-3 py-1.5 text-sm rounded-md bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition'>
                    View Profile
                  </button>
                  {currentTab === 'Following' && (
                    <button onClick={() => handleUnfollow(user._id)} className='px-3 py-1.5 text-sm rounded-md border border-gray-200 text-slate-700 hover:bg-gray-50'>
                      Unfollow
                    </button>
                  )}
                  {currentTab === 'Pending' && (
                    <button onClick={() => acceptConnection(user._id)} className='px-3 py-1.5 text-sm rounded-md border border-gray-200 text-slate-700 hover:bg-gray-50'>
                      Accept
                    </button>
                  )}
                  {currentTab === 'Connections' && (
                    <button onClick={()=> navigate(`/messages/${user._id}`)} className='px-3 py-1.5 text-sm rounded-md border border-gray-200 text-slate-800 hover:bg-gray-50 flex items-center gap-2'>
                      <MessageSquare className='w-4 h-4'/> Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Connection