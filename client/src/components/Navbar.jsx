import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppcontext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sun, Moon, ShoppingCart, Menu, X, User, LogOut, Package, LayoutDashboard, Heart } from 'lucide-react'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const { user, setUser, setShowUserLogin, navigate, setsearchQuery, searchQuery, getCartCount, axios, darkMode, toggleDarkMode, isSeller, products, wishlistItems, currency } = useAppcontext()

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout')
            if (data.success) {
                toast.success(data.message)
                setUser(null)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleSellerNav = () => {
        navigate('/seller')
        setOpen(false)
    }

    const cartCount = getCartCount()
    const wishlistCount = wishlistItems?.length || 0;

    // NavLink classes helper
    const getNavLinkClass = (isActive) => 
        `relative py-2 text-sm font-medium transition-all duration-300 ${
            isActive 
                ? 'text-emerald-500 dark:text-emerald-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`

    const searchResults = searchQuery && typeof searchQuery === 'string' && searchQuery.length > 0
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-16 lg:px-24 xl:px-32 border-b border-slate-200/80 dark:border-slate-800/80 glass-panel shadow-sm transition-all duration-300">
            <NavLink to='/' onClick={() => setOpen(false)} className="flex items-center">
                <motion.img 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="h-8 md:h-9 object-contain dark:brightness-0 dark:invert" 
                    src={assets.logo} 
                    alt="GreenCart" 
                />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <nav className="flex items-center gap-6">
                    <NavLink to='/' className={({ isActive }) => getNavLinkClass(isActive)}>
                        {({ isActive }) => (
                            <>
                                Home
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeNavLine" 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                    <NavLink to='/products' className={({ isActive }) => getNavLinkClass(isActive)}>
                        {({ isActive }) => (
                            <>
                                Products
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeNavLine" 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                    <NavLink to='/contact' className={({ isActive }) => getNavLinkClass(isActive)}>
                        {({ isActive }) => (
                            <>
                                Contact
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeNavLine" 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                    <button 
                        onClick={handleSellerNav}
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                        {isSeller ? "Dashboard" : "Sell"}
                    </button>
                </nav>

                {/* Smart Search Bar */}
                <div className="relative hidden lg:flex items-center text-sm gap-2 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full bg-slate-50/50 dark:bg-slate-900/30 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-300 w-48 xl:w-60 z-50">
                    <input 
                        onChange={(e) => setsearchQuery(e.target.value)} 
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow clicking results
                        value={typeof searchQuery === 'string' ? searchQuery : ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                navigate('/products');
                                setIsSearchFocused(false);
                            }
                        }}
                        className="py-0.5 w-full bg-transparent outline-none placeholder-slate-400 text-slate-800 dark:text-slate-200 text-xs" 
                        type="text" 
                        placeholder="Search products..." 
                    />
                    <Search className='w-4 h-4 text-slate-400 shrink-0 cursor-pointer' onClick={() => navigate('/products')} />
                    
                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {isSearchFocused && searchQuery && searchQuery.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-premium overflow-hidden z-50"
                            >
                                {searchResults.length > 0 ? (
                                    <div className="flex flex-col py-2">
                                        {searchResults.map(product => (
                                            <div 
                                                key={product._id} 
                                                onClick={() => {
                                                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                                    setsearchQuery('');
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                            >
                                                <img src={product.image[0]} alt={product.name} className="w-8 h-8 rounded-md object-cover bg-slate-100 dark:bg-slate-800" />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{product.name}</span>
                                                    <span className="text-[10px] text-emerald-500 font-bold">{currency}{product.offerPrice}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => navigate('/products')}
                                            className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 mt-1 py-2 text-center border-t border-slate-100 dark:border-slate-800"
                                        >
                                            View all results
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                        No products found
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-1">
                    {/* Dark Mode Toggle */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleDarkMode} 
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {darkMode ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px]" />}
                    </motion.button>

                    {/* Wishlist Icon */}
                    <div onClick={() => navigate("/wishlist")} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors">
                        <Heart className='w-5 h-5' />
                        <AnimatePresence>
                            {wishlistCount > 0 && (
                                <motion.span 
                                    key={wishlistCount}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    className="absolute top-0 right-0 bg-rose-500 text-[9px] font-bold text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Cart Icon */}
                    <div onClick={() => navigate("/cart")} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                        <ShoppingCart className='w-5 h-5' />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span 
                                    key={cartCount}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    className="absolute top-0 right-0 bg-emerald-500 text-[9px] font-bold text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User Authentication Menu */}
                {!user ? (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUserLogin(true)} 
                        className="cursor-pointer px-6 py-2 bg-emerald-500 hover:bg-emerald-600 transition-all text-white font-medium rounded-full text-sm shadow-sm"
                    >
                        Login
                    </motion.button>
                ) : (
                    <div 
                        className='relative'
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <button className="flex items-center focus:outline-none">
                            <motion.img 
                                whileHover={{ scale: 1.05 }}
                                src={assets.profile_icon} 
                                className='w-9 h-9 rounded-full border-2 border-emerald-500/20 object-cover shadow-sm cursor-pointer' 
                                alt="Profile" 
                            />
                        </button>
                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className='absolute right-0 mt-2 bg-white dark:bg-slate-900 shadow-premium border border-slate-200/80 dark:border-slate-800/80 py-2 w-44 rounded-2xl text-sm z-50 overflow-hidden'
                                >
                                    <button 
                                        onClick={() => { navigate("/my-orders"); setShowDropdown(false); }}
                                        className='flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors'
                                    >
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        My Orders
                                    </button>
                                    
                                    {isSeller && (
                                        <button 
                                            onClick={() => { navigate("/seller"); setShowDropdown(false); }}
                                            className='flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors'
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                                            Dashboard
                                        </button>
                                    )}

                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                                    <button  
                                        onClick={() => { logout(); setShowDropdown(false); }}
                                        className='flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors'
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Mobile Actions Container */}
            <div className='flex items-center gap-4 sm:hidden'>
                {/* Dark Mode Toggle Mobile */}
                <button 
                    onClick={toggleDarkMode} 
                    className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </button>
                
                {/* Cart Mobile */}
                <div onClick={() => navigate("/cart")} className="relative cursor-pointer text-slate-700 dark:text-slate-300 p-1">
                    <ShoppingCart className='w-5.5 h-5.5' />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-emerald-500 text-[9px] font-bold text-white w-4.5 h-4.5 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setOpen(!open)} 
                    className="p-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-5 flex flex-col gap-4 px-6 text-sm sm:hidden z-50 overflow-hidden"
                    >
                        <NavLink to='/' onClick={() => setOpen(false)} className={({ isActive }) => `font-medium py-1 ${isActive ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            Home
                        </NavLink>
                        <NavLink to='/products' onClick={() => setOpen(false)} className={({ isActive }) => `font-medium py-1 ${isActive ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            Products
                        </NavLink>
                        {user && (
                            <NavLink to='/my-orders' onClick={() => setOpen(false)} className={({ isActive }) => `font-medium py-1 ${isActive ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                My Orders
                            </NavLink>
                        )}
                        <NavLink to='/contact' onClick={() => setOpen(false)} className={({ isActive }) => `font-medium py-1 ${isActive ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            Contact
                        </NavLink>
                        <button 
                            onClick={handleSellerNav}
                            className="text-left font-medium py-1 text-slate-700 dark:text-slate-300 hover:text-emerald-500"
                        >
                            {isSeller ? "Dashboard" : "Sell"}
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                        {!user ? (
                            <button 
                                onClick={() => {
                                    setOpen(false)
                                    setShowUserLogin(true)
                                }} 
                                className="w-full text-center py-2.5 bg-emerald-500 hover:bg-emerald-600 transition text-white font-medium rounded-full text-sm shadow-sm"
                            >
                                Login
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    setOpen(false)
                                    logout()
                                }} 
                                className="w-full text-center py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition font-medium rounded-full text-sm"
                            >
                                Logout
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
