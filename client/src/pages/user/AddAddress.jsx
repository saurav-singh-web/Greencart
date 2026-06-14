import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'

// input field component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input 
        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-none bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-sm"
        type={type} 
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
    />
)

const AddAddress = () => {
    const { axios, user, navigate, fetchAddresses } = useAppcontext()

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '', 
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value, 
        }))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/address/add', {
                address: {
                    ...address,
                    userId: user._id
                }
            })
            
            if (data.success) {
                toast.success(data.message)
                // Refresh shared address state so Cart and MyOrders see the new address immediately
                await fetchAddresses(user._id)
                navigate('/cart')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (!user) {
            navigate('/cart')
        }
    }, [])

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className='mt-12 pb-16'
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button 
                    onClick={() => navigate('/cart')} 
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-pointer"
                    aria-label="Back to Cart"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <h1 className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                        Add Shipping Address
                    </h1>
                </div>
            </div>

            <div className='flex flex-col-reverse md:flex-row justify-between items-start gap-12 mt-6'>
                {/* Form Card */}
                <div className='w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-premium'>
                    <form onSubmit={onSubmitHandler} className='space-y-4 text-sm'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='firstName' type="text" placeholder='First Name' />
                            <InputField handleChange={handleChange} address={address} name='lastName' type="text" placeholder='Last Name' />
                        </div>
                        
                        <InputField handleChange={handleChange} address={address} name='email' type="email" placeholder='Email address' />
                        <InputField handleChange={handleChange} address={address} name='street' type="text" placeholder='Street Address' />

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='city' type="text" placeholder='City' />    
                            <InputField handleChange={handleChange} address={address} name='state' type="text" placeholder='State' />                                                        
                        </div>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='zipcode' type="number" placeholder='Zip code' />    
                            <InputField handleChange={handleChange} address={address} name='country' type="text" placeholder='Country' />                                                        
                        </div>
                        
                        <InputField handleChange={handleChange} address={address} name='phone' type="number" placeholder='Phone Number' />     

                        <motion.button 
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.2)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full mt-6 text-white py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-full font-bold transition-all duration-300 uppercase tracking-wider text-xs cursor-pointer shadow-md"
                        >
                            Save Shipping Address
                        </motion.button>                                                   
                    </form>
                </div>
                
                {/* Graphic Banner */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-full max-w-sm mx-auto md:mx-0 select-none hidden md:block shrink-0"
                >
                    <img className='w-full object-contain' src={assets.add_address_iamge} alt='Shipping' />
                </motion.div>
            </div>
        </motion.div>
    )
}

export default AddAddress


