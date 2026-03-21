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

function App() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [dbUser, setDbUser] = useState(null)

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       // 1. Get the latest session token from Clerk
  //       const token = await getToken()

  //       console.log(user);

  //       if (token) {
  //         // 2. Make the API call to your Vercel backend
  //         // Note: Ensure your backend URL is correct
  //         console.log("🔑 Fetching user data with token:", token)
  //         const response = await axios.get('https://pingup-server-red.vercel.app/api/user/data', {
  //           headers: {
  //             Authorization: `Bearer ${token}`
  //           }
  //         })

  //         console.log(response)
  //         if (response.data.success) {
  //           setDbUser(response.data.data)
  //           console.log("✅ MongoDB User Data:", response.data.data)
  //         } else {
  //           console.log("⚠️ Backend Response:", response.data.message)
  //         }
  //       }
  //     } catch (error) {
  //       console.error("❌ Error fetching user data:", error)
  //     }
  //   }

  //       if (isLoaded && user) {
  //         fetchUserData();
  //       }
  // }, [user,isLoaded, getToken])

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