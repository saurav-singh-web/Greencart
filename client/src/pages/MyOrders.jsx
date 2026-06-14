import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Package, Calendar, CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react'

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const { currency, axios, user } = useAppcontext()
     
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
        }
    }, [user])

    const getStatusBadge = (status) => {
        const normalized = status?.toLowerCase() || '';
        let style = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        
        if (normalized.includes('deliver')) {
            style = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
        } else if (normalized.includes('process') || normalized.includes('shipped')) {
            style = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
        } else if (normalized.includes('pend') || normalized.includes('place')) {
            style = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
        }
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${style}`}>
                {status || 'Placed'}
            </span>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className='mt-12 pb-16 min-h-[60vh]'
        >
            {/* Header */}
            <div className='flex flex-col gap-1.5 mb-8 border-b border-slate-100 dark:border-slate-800 pb-5'>
                <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                    My Orders
                </p>
                <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
            </div>

            {myOrders.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-8 max-w-4xl"
                >
                    {myOrders.map((order) => (
                        <motion.div 
                            key={order._id} 
                            variants={itemVariants}
                            className='border border-slate-100 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-slate-900 shadow-premium p-5 sm:p-6 overflow-hidden'
                        >
                            {/* Order Info Card Header */}
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-5 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400'>
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="truncate">ID: <span className="text-slate-800 dark:text-slate-200">{order._id}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Payment: <span className="text-slate-800 dark:text-slate-200">{order.paymentType}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Total: <span className="text-slate-800 dark:text-slate-200">{currency}{order.amount.toFixed(2)}</span></span>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex flex-col gap-5">
                                {order.items.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 last:pb-0 ${
                                            order.items.length !== index + 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                                        }`}
                                    >
                                        <div className='flex items-center gap-4'>
                                            {/* Item Image */}
                                            <div className='p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800'>
                                                <img src={item.product?.image?.[0]} alt='product' className='max-h-full object-contain w-auto' />
                                            </div>
                                            
                                            {/* Item Name */}
                                            <div className='flex flex-col gap-0.5 min-w-0'>
                                                <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs'>
                                                    {item.product?.name || 'Product deleted'}
                                                </h3>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                                                    Category: {item.product?.category || 'N/A'}
                                                </span>
                                            </div>    
                                        </div>

                                        {/* Status & Info column */}
                                        <div className='flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-4 mt-4 sm:mt-0 text-xs text-slate-500 dark:text-slate-400 font-semibold'>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Qty: {item.quantity || 1}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-0.5">
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>
                                        
                                        {/* Item Cost */}
                                        <div className="text-right mt-3 sm:mt-0">
                                            <p className='text-sm sm:text-base font-extrabold text-emerald-500 dark:text-emerald-400'>
                                                {currency}{item.product?.offerPrice ? (item.product.offerPrice * item.quantity).toFixed(2) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 max-w-4xl">
                    <Package className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No orders placed</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                        You haven't ordered anything yet. Explore our fresh organic selection and place your first order!
                    </p>
                </div>
            )}
        </motion.div>
    )
}

export default MyOrders