import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast';

const SellerLogin = () => {

    const {isSeller, setIsSeller, navigate, axios} = useAppcontext()

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async(event)=>{

        try {
            event.preventDefault();
            const {data} = await axios.post('/api/seller/login', {email, password},{ withCredentials: true })
            if(data.success){
                setIsSeller(true)
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

    <form onSubmit={onSubmitHandler} className='min-h-screen flex item-center text-sm text-gray-600'>

        <div className='flex flex-col gap-5 m-auto item-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
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
        </div>
    </form>
  )
}

export default SellerLogin