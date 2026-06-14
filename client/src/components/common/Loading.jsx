import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const Loading = () => {
    const { navigate, axios, fetchUser, setCartItems } = useAppcontext()
    const [statusMsg, setStatusMsg] = useState("Verifying your payment...")
    let { search } = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next')

    useEffect(() => {
        const verify = async () => {
            const pendingOrderId = localStorage.getItem('pendingOrderId')

            if (pendingOrderId) {
                try {
                    setStatusMsg("Verifying your payment...")
                    const { data } = await axios.post('/api/order/verify-stripe', {
                        orderId: pendingOrderId
                    })

                    if (data.success) {
                        setStatusMsg("Payment confirmed! Redirecting...")
                        setCartItems({})
                        localStorage.removeItem('pendingOrderId')
                    } else {
                        setStatusMsg("Payment pending, please wait...")
                    }
                } catch (error) {
                    console.error("Verification error:", error)
                    setStatusMsg("Redirecting...")
                }
            } else {
                setStatusMsg("Redirecting...")
            }

            try {
                await fetchUser()
            } catch (e) {
                console.error("fetchUser error:", e)
            }

            if (nextUrl) {
                setTimeout(() => {
                    navigate(`/${nextUrl}`)
                }, 1500)
            }
        }

        verify()
    }, [nextUrl])

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4 select-none">
            {/* Custom Premium Loader Graphic */}
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-emerald-500 border-r-emerald-500"
                />
                
                {/* Inner counter-rotating ring */}
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                    className="absolute w-14 h-14 rounded-full border-4 border-slate-100 dark:border-slate-800 border-b-emerald-400 border-l-emerald-400 opacity-60"
                />

                {/* Pulsing center dot */}
                <motion.div 
                    animate={{ scale: [0.8, 1.1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                </motion.div>
            </div>

            {/* Status Messages */}
            <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={statusMsg}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wide uppercase"
                    >
                        {statusMsg}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Loading
