import React from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { dummyUserData} from '../assets/assets'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

function Layout() {
  const user=useSelector((state)=>state.user.value)
  const [sideBarOpen, setSidebarOpen] = React.useState(false)
  return user ? (
    <div className='w-full h-screen flex'>
      <SideBar sideBarOpen={sideBarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className='flex-1 bg-slate-50'>
        <Outlet/>
      </div>
      {
        sideBarOpen ?
        <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={()=>setSidebarOpen(false)}/>
        :
        <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={()=>setSidebarOpen(true)}/>
      }
    </div>
  ) : (
    <Loading/>
  )
}

export default Layout