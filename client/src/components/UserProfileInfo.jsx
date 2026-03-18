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
import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import moment from 'moment'
import React from 'react'

function UserProfileInfo({user, posts, profileId, setShowEdit}) {
  return (
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
                    {!profileId && (
                        <button 
                            onClick={() => setShowEdit(true)} 
                            className='flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer'
                        >
                            <PenBox className='w-4 h-4' />
                            Edit Profile
                        </button>
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
                        <p className='text-lg md:text-xl font-bold text-gray-900'>{user.followers.length}</p>
                        <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Followers</p>
                    </div>
                    <div className='text-center md:text-left'>
                        <p className='text-lg md:text-xl font-bold text-gray-900'>{user.following.length}</p>
                        <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Following</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UserProfileInfo