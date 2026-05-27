import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'

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
                        // Clear cart from frontend state immediately
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

            // Refresh user from server (syncs cart state from DB)
            try {
                await fetchUser()
            } catch (e) {
                console.error("fetchUser error:", e)
            }

            // Navigate after verification
            if (nextUrl) {
                setTimeout(() => {
                    navigate(`/${nextUrl}`)
                }, 1500)
            }
        }

        verify()
    }, [nextUrl])

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div
                className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300"
                style={{ borderTopColor: 'var(--color-primary)' }}
            ></div>
            <p className="text-gray-500 text-sm animate-pulse">{statusMsg}</p>
        </div>
    )
}

export default Loading