import React, { useState } from 'react'
import { useAppcontext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const { setShowUserLogin, setUser, axios, navigate } = useAppcontext()
    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            const { data } = await axios.post(`/api/user/${state}`, {
                name, email, password
            }) 
            if (data.success) {
                navigate('/')
                setUser(data.user)
                setShowUserLogin(false)
            } else {
                toast.error(data.message)
            } 
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserLogin(false)} 
            className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300'
        >
            <motion.form 
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onSubmit={onSubmitHandler} 
                onClick={(e) => e.stopPropagation()} 
                className="relative flex flex-col gap-5 m-auto items-start p-8 py-10 w-full max-w-[368px] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100"
            >
                {/* Close Button */}
                <button 
                    type="button" 
                    onClick={() => setShowUserLogin(false)} 
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                    <X className="w-4.5 h-4.5" />
                </button>

                {/* Header */}
                <div className="flex flex-col gap-1 w-full text-center items-center pb-2">
                    <p className="text-2xl font-black tracking-tight">
                        <span className="text-emerald-500">Green</span>Cart {state === "login" ? "Login" : "Sign Up"}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                        {state === "login" ? "Welcome back!" : "Create your free account"}
                    </span>
                </div>

                {/* Name field (Sign Up only) */}
                {state === "register" && (
                    <div className="w-full flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Name</span>
                        <div className="relative flex items-center">
                            <User className="absolute left-4 w-4 h-4 text-slate-400" />
                            <input 
                                onChange={(e) => setName(e.target.value)} 
                                value={name} 
                                placeholder="Your Name" 
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm" 
                                type="text" 
                                required 
                            />
                        </div>
                    </div>
                )}

                {/* Email field */}
                <div className="w-full flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</span>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
                        <input 
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email} 
                            placeholder="email@example.com" 
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm" 
                            type="email" 
                            required 
                        />
                    </div>
                </div>

                {/* Password field */}
                <div className="w-full flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</span>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-4 w-4 h-4 text-slate-400" />
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            placeholder="••••••••" 
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm" 
                            type="password" 
                            required 
                        />
                    </div>
                </div>

                {/* State toggle link */}
                <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                    {state === "register" ? (
                        <p>
                            Already have an account?{' '}
                            <button type="button" onClick={() => setState("login")} className="text-emerald-500 hover:text-emerald-600 underline font-bold transition-colors cursor-pointer">
                                Login here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <button type="button" onClick={() => setState("register")} className="text-emerald-500 hover:text-emerald-600 underline font-bold transition-colors cursor-pointer">
                                Sign up here
                            </button>
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-md cursor-pointer text-sm"
                >
                    {state === "register" ? <UserPlus className="w-4.5 h-4.5" /> : <LogIn className="w-4.5 h-4.5" />}
                    <span>{state === "register" ? "Create Account" : "Sign In"}</span>
                </motion.button>
            </motion.form>
        </motion.div>
    )
}

export default Login

