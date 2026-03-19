import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useUser, useAuth} from "@clerk/clerk-react"
import Layout  from './pages/Layout'
import {Toaster} from 'react-hot-toast'
import { use } from 'react'
import { useEffect } from 'react'
function App() {
  const { user } = useUser()
  // for testing purpose only, you can remove this after confirming that authentication is working correctly
  // const { getToken } = useAuth()
  // useEffect(() => {
  //   if (user) {
  //     getToken().then((token) => 
  //       console.log(token)
  //     )}
  // }, [user])
  return (
    <>
      <Toaster />
      <Routes>
        {/* 2. Added the standalone route for Sign Up */}
        <Route path="/sign-up" element={<SignUp />} />

        {/* Your existing logic remains exactly the same */}
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