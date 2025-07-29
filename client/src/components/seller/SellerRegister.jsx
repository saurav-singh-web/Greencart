import React, { useState, useEffect } from 'react';
import { useAppcontext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SellerRegister = () => {
  const { isSeller, setIsSeller, setSellerInfo, navigate, axios } = useAppcontext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      
      // Validate phone number
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }

      const { name, email, password, businessName, phone, address } = formData;
      
      const { data } = await axios.post('/api/seller/register', {
        name, 
        email, 
        password,
        businessName,
        phone,
        address
      }, { withCredentials: true });
      
      if (data.success) {
        setIsSeller(true);
        // Store seller info if available
        if (data.seller) {
          setSellerInfo(data.seller);
        }
        toast.success("Registration successful!");
        navigate('/seller');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller, navigate]);

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

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 m-auto p-8 py-10 w-full max-w-md rounded-lg shadow-xl border border-gray-200'>
        <p className='text-2xl font-medium m-auto mb-2'>
          <span style={{ color: 'var(--color-primary)' }}>Seller</span> Registration
        </p>
        
        <div className='w-full'>
          <p>Full Name</p>
          <input 
            name="name"
            onChange={handleChange} 
            value={formData.name} 
            type='text' 
            placeholder='Enter your full name' 
            className='border border-gray-200 rounded w-full p-2 mt-1' 
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Email</p>
          <input 
            name="email"
            onChange={handleChange} 
            value={formData.email} 
            type='email' 
            placeholder='Enter your email' 
            className='border border-gray-200 rounded w-full p-2 mt-1' 
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Business Name</p>
          <input 
            name="businessName"
            onChange={handleChange} 
            value={formData.businessName} 
            type='text' 
            placeholder='Enter your business name' 
            className='border border-gray-200 rounded w-full p-2 mt-1' 
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Phone Number</p>
          <input 
            name="phone"
            onChange={handleChange} 
            value={formData.phone} 
            type='tel' 
            placeholder='Enter your phone number' 
            className='border border-gray-200 rounded w-full p-2 mt-1' 
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Business Address</p>
          <textarea 
            name="address"
            onChange={handleChange} 
            value={formData.address} 
            placeholder='Enter your business address' 
            className='border border-gray-200 rounded w-full p-2 mt-1 min-h-[80px]' 
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Password</p>
          <input 
            name="password"
            onChange={handleChange} 
            value={formData.password} 
            type='password' 
            placeholder='Create a password' 
            className='border border-gray-200 rounded w-full p-2 mt-1'
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <div className='w-full'>
          <p>Confirm Password</p>
          <input 
            name="confirmPassword"
            onChange={handleChange} 
            value={formData.confirmPassword} 
            type='password' 
            placeholder='Confirm your password' 
            className='border border-gray-200 rounded w-full p-2 mt-1'
            onFocus={e => e.target.style.outline = '2px solid var(--color-primary)'}
            onBlur={e => e.target.style.outline = 'none'} 
            required
          />
        </div>
        
        <button 
          className='text-white w-full py-2 rounded-md cursor-pointer mt-2' 
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Register as Seller
        </button>
        
        <p className="text-center mt-2">
          Already have a seller account?{' '}
          <Link 
            to="/seller" 
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SellerRegister;
