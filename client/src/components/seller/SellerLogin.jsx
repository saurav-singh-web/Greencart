import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SellerLogin = () => {

    const {isSeller, setIsSeller, setSellerInfo, navigate, axios} = useAppcontext()

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async(event)=>{

        try {
            event.preventDefault();
            const {data} = await axios.post('/api/seller/login', {email, password},{ withCredentials: true })
            if(data.success){
                setIsSeller(true)
                // Store seller info if available
                if (data.seller) {
                    setSellerInfo(data.seller)
                }
                navigate('/seller')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
        
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(isSeller){
            navigate("/seller")
        }
    },[isSeller])



  return !isSeller && (
    <div className="min-h-screen flex flex-col items-center text-sm text-gray-600">
        {/* Back to Home button */}
        <Link 
            to="/" 
            className="self-start mt-4 ml-4 flex items-center gap-2 text-base hover:text-primary transition-colors"
            style={{ color: 'var(--color-primary)' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </Link>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 m-auto item-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
            <p className='text-2xl font-medium m-auto'>
                <span style={{ color: 'var(--color-primary)' }}>
                    Seller
                </span>
                Login
            </p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} type='email' placeholder='enter you email' 
                className='border border-gray-200 rounded w-full p-2 mt-1' 
                onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
                onBlur={e => e.target.style.outline = 'none'} required/>
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type='password' placeholder='enter your password'
                className='border border-gray-200 rounded w-full p-2 mt-1'
                onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
                onBlur={e => e.target.style.outline = 'none'} required/>
            </div>
            <button className='text-white w-full py-2 rounded-md cursor-pointer' style={{ backgroundColor: 'var(--color-primary)' }}>Login</button>
            
            {/* Add registration link */}
            <p className="text-center mt-2">
                Don't have a seller account?{' '}
                <Link 
                    to="/seller/register" 
                    className="hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                >
                    Register here
                </Link>
            </p>
        </form>
    </div>
  )
}

export default SellerLogin

