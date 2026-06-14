import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Calendar, CreditCard, DollarSign, Clock, MapPin, User, Settings, Shield, Bell, Heart, LayoutDashboard, ChevronRight } from 'lucide-react'

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const [activeTab, setActiveTab] = useState('orders') // 'orders', 'addresses', 'settings'
    // Use shared address state from AppContext — synced with Cart page
    const { currency, axios, user, navigate, addresses, fetchAddresses } = useAppcontext()
     
    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user', {
                params: { userId: user._id }
            })
            if (data.success) {
                setMyOrders(data.orders)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders()
            // Re-fetch addresses so this page always reflects latest (including adds from Cart)
            fetchAddresses(user._id)
        } else {
            navigate('/')
        }
    }, [user])

    const getStatusBadge = (status) => {
        const normalized = status?.toLowerCase() || '';
        let style = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        
        if (normalized.includes('deliver')) {
            style = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
        } else if (normalized.includes('process') || normalized.includes('shipped')) {
            style = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
        } else if (normalized.includes('pend') || normalized.includes('place')) {
            style = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
        }
        
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${style}`}>
                {status || 'Placed'}
            </span>
        );
    }

    const OrderTracking = ({ status }) => {
        const normalized = status?.toLowerCase() || 'placed';
        const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
        let currentStep = 0;
        
        if (normalized.includes('process')) currentStep = 1;
        if (normalized.includes('shipped')) currentStep = 2;
        if (normalized.includes('deliver')) currentStep = 3;

        return (
            <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-700"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                    
                    {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors duration-500 ${
                                    isCompleted 
                                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                        : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                </div>
                                <span className={`absolute -bottom-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                                    isCurrent ? 'text-emerald-500' : (isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400')
                                }`}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="h-6"></div>
            </div>
        )
    }

    const tabs = [
        { id: 'orders', name: 'Order History', icon: Package },
        { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
        { id: 'settings', name: 'Account Settings', icon: Settings },
    ]

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className='mt-8 pb-16 min-h-[60vh] flex flex-col lg:flex-row gap-8 lg:gap-12'
        >
            <div className="w-full lg:w-64 shrink-0">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 sticky top-24">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-lg font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="font-extrabold text-slate-800 dark:text-slate-100 truncate">{user?.name}</h2>
                            <p className="text-xs font-semibold text-emerald-500">Premium Member</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold w-full text-left ${
                                        isActive 
                                            ? 'bg-emerald-500 text-white shadow-md' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-100' : ''}`} />
                                    {tab.name}
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </button>
                            )
                        })}
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button 
                                onClick={() => navigate('/wishlist')}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Heart className="w-4 h-4" />
                                My Wishlist
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl">
                <AnimatePresence mode="wait">
                    
                    {activeTab === 'orders' && (
                        <motion.div 
                            key="orders"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-8"
                        >
                            <div className='flex flex-col gap-1.5 mb-2'>
                                <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                                    Order History
                                </p>
                                <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                            </div>

                            {myOrders.length > 0 ? (
                                myOrders.map((order) => (
                                    <motion.div 
                                        key={order._id} 
                                        className='border border-slate-100 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-slate-900 shadow-premium p-6 sm:p-8 overflow-hidden'
                                    >
                                        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80'>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order #{order._id.slice(-8)}</p>
                                                <p className="text-sm font-semibold text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="text-lg font-black text-emerald-500">{currency}{order.amount.toFixed(2)}</p>
                                                </div>
                                                <button className="px-4 py-2 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-xl text-xs font-bold transition-colors">
                                                    Invoice
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex flex-col">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                                        <div className='bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800/80'>
                                                            <img src={item.product?.image?.[0]} alt='product' className='max-h-full object-contain w-auto drop-shadow-sm' />
                                                        </div>
                                                        <div className='flex flex-col flex-1'>
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className='font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg mb-1'>
                                                                        {item.product?.name || 'Product deleted'}
                                                                    </h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Qty: {item.quantity || 1}</p>
                                                                </div>
                                                                {getStatusBadge(order.status)}
                                                            </div>
                                                        </div>    
                                                    </div>
                                                    
                                                    {index === order.items.length - 1 && <OrderTracking status={order.status} />}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
                                    <Package className="w-16 h-16 text-emerald-500/50 mb-4" />
                                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">No orders placed</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm text-center mt-2 leading-relaxed">
                                        You haven't ordered anything yet. Explore our fresh organic selection and place your first order!
                                    </p>
                                    <button 
                                        onClick={() => navigate('/products')}
                                        className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-full font-bold shadow-md hover:bg-emerald-600 transition-colors"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'addresses' && (
                        <motion.div 
                            key="addresses"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-6"
                        >
                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex flex-col gap-1.5'>
                                    <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                                        Saved Addresses
                                    </p>
                                    <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                                </div>
                                <button 
                                    onClick={() => navigate('/add-address')}
                                    className="px-5 py-2.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full font-bold text-sm shadow-md hover:bg-slate-700 dark:hover:bg-white transition-colors"
                                >
                                    + Add New
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {addresses.length > 0 ? addresses.map((addr, i) => (
                                    <div key={i} className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm relative group hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                                        {i === 0 && (
                                            <span className="absolute top-4 right-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md">Default</span>
                                        )}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{addr.firstName} {addr.lastName}</h4>
                                                <p className="text-xs text-slate-500 font-semibold mt-0.5">{addr.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                            <p>{addr.street}</p>
                                            <p>{addr.city}, {addr.state} {addr.zipcode}</p>
                                            <p>{addr.country}</p>
                                        </div>
                                        <div className="flex gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-xs font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-widest">Edit</button>
                                            <button className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest">Delete</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
                                        <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No addresses saved</h3>
                                        <p className="text-sm text-slate-500 mt-1 mb-6">Add a shipping address to speed up checkout.</p>
                                        <button onClick={() => navigate('/add-address')} className="px-6 py-2 border-2 border-emerald-500 text-emerald-500 rounded-full font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                                            Add Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-8"
                        >
                            <div className='flex flex-col gap-1.5 mb-2'>
                                <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                                    Account Settings
                                </p>
                                <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Personal Info</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                            <input type="text" defaultValue={user?.name} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                                            <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                                        </div>
                                        <button className="mt-2 w-full py-2.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Security</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">New Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                                        </div>
                                        <button className="mt-2 w-full py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Bell className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">Email Notifications</h4>
                                            <p className="text-sm text-slate-500 font-medium">Receive updates on your orders and promotions.</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer ml-auto sm:ml-0 shrink-0">
                                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default MyOrders
