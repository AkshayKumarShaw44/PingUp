import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser, useAuth } from "@clerk/clerk-react"
import { Toaster } from 'react-hot-toast'

// Page Imports
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import { use } from 'react'

function App() {
  const { user } = useUser()
  const { getToken } = useAuth()

  useEffect(() => {
    if (user) {
      getToken().then((token)=>console.log(token))
    }
  },[user])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />

        {/* If user is logged into Clerk, we show Layout. 
            You can now pass 'dbUser' to these components if needed. 
        */}
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App