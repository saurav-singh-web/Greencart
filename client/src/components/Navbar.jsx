import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {assets}from '../assets/assets'
import { useAppcontext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
        const [open, setOpen] = React.useState(false)
        const {user, setUser, setShowUserLogin, navigate, setsearchQuery, searchQuery, getCartCount, axios, darkMode, toggleDarkMode, isSeller} = useAppcontext()

        // Moon and sun icons
        const moonIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'%3E%3C/path%3E%3C/svg%3E"
        const sunIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'%3E%3C/path%3E%3C/svg%3E"

        const logout = async() =>{

            try {const {data} = await axios.get('/api/user/logout')
            if(data.success){
                toast.success(data.message)
                setUser(null)
                navigate('/')
            }else{
                toast.error(data.message)
            } 
            } catch (error) {
                toast.error(error.message)   
            }
            
        }

        useEffect(()=>{
            if(searchQuery.length>0){
                navigate("/products")
            }

        },[searchQuery])
        
        // Function to handle seller navigation
        const handleSellerNav = () => {
            if (isSeller) {
                navigate('/seller')
            } else {
                navigate('/seller') // This will show the login page since isSeller is false
            }
            setOpen(false)
        }
  return (
<nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">

            <NavLink to='/' onClick={()=>setOpen(false)}>
                <img className="h-9" src={assets.logo} alt="logo" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to ='/'>Home</NavLink>
                <NavLink to ='/products'>All Product</NavLink>
                <NavLink to ='/contact'>Contact</NavLink>
                <button 
                    onClick={handleSellerNav}
                    className="text-base hover:text-primary transition-colors"
                >
                    {isSeller ? "Seller Dashboard" : "Seller Login"}
                </button>

                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input onChange={(e)=> setsearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                    <img src={assets.search_icon} alt='search' className='w-4 h-4'/>
                </div>

                {/* Dark Mode Toggle */}
                <button 
                    onClick={toggleDarkMode} 
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    <img 
                        src={darkMode ? sunIcon : moonIcon} 
                        alt={darkMode ? "Light mode" : "Dark mode"} 
                        className="w-5 h-5"
                    />
                </button>

                <div onClick = {()=> navigate("/cart")}className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button style={{ backgroundColor: 'var(--color-primary)' }} className="absolute -top-2 -right-3 text-xs text-white w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>

                {!user ? (<button onClick={()=>setShowUserLogin(true)} style={{ backgroundColor: 'var(--color-primary)' }} className="cursor-pointer px-8 py-2 hover:bg-primary-dull transition text-white rounded-full">
                    Login
                </button>)
                :(
                    <div className='relative group'>
                        <img src={assets.profile_icon} className='w-10' alt="" />
                        <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40' style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <li 
                                onClick={()=>navigate("my-orders")} 
                                className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer transition-colors' 
                                style={{ color: 'var(--text-color)' }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
                            >
                                My Order
                            </li>
                            <li  
                                onClick={logout} 
                                className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer transition-colors' 
                                style={{ color: 'var(--text-color)' }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
                            >
                                Logout
                            </li>
                        </ul>
                    </div>
                )}
            </div>
             <div className='flex items-center gap-6 sm:hidden'>
             {/* Dark Mode Toggle for Mobile */}
             <button 
                 onClick={toggleDarkMode} 
                 className="w-8 h-8 flex items-center justify-center"
                 aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
             >
                 <img 
                     src={darkMode ? sunIcon : moonIcon} 
                     alt={darkMode ? "Light mode" : "Dark mode"} 
                     className="w-5 h-5"
                 />
             </button>
             
             <div onClick = {()=> navigate("/cart")}className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button style={{ backgroundColor: 'var(--color-primary)' }} className="absolute -top-2 -right-3 text-xs text-white w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>
            <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="">
                {/* Menu Icon SVG */}
                <img src={assets.menu_icon} alt='menu'/>
            </button>
            </div>
            {/* Mobile Menu */}
            { open && (
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-50`}>
                <NavLink to ='/' onClick={()=> setOpen(false)} className="transition-colors">Home</NavLink>
                <NavLink to ='/products' onClick={()=> setOpen(false)} className="transition-colors">Product</NavLink>
                {user &&
                <NavLink to ='/my-orders' onClick={()=> setOpen(false)} className="transition-colors">MyOrder</NavLink>
                }
                <NavLink to ='/contact' onClick={()=> setOpen(false)} className="transition-colors">Contact</NavLink>
                <button 
                    onClick={handleSellerNav}
                    className="text-left w-full transition-colors"
                >
                    {isSeller ? "Seller Dashboard" : "Seller Login"}
                </button>

                {!user ? (
                    <button onClick={()=>{
                        setOpen(false)
                        setShowUserLogin(true)
                    }} style={{ backgroundColor: 'var(--color-primary)' }} className="cursor-pointer px-6 py-2 mt-2 hover:bg-primary-dull transition text-white rounded-full text-sm">
                    Login
                </button>
                ) : (
                    <button onClick={logout} style={{ backgroundColor: 'var(--color-primary)' }} className="cursor-pointer px-6 py-2 mt-2 hover:bg-primary-dull transition text-white rounded-full text-sm">
                    Logout
                </button>
                )}
                
            </div>
           )}

        </nav>  )
}

export default Navbar
