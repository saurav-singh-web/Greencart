import React from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

const NewsLetter = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle subscription
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="flex flex-col items-center justify-center text-center mt-24 pb-14 px-4"
        >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                Never Miss a Deal!
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mt-3 mb-8 leading-relaxed">
                Subscribe to get the latest organic offers, fresh arrivals, and exclusive member discounts.
            </p>
            
            <form 
                onSubmit={handleSubmit}
                className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-1.5 rounded-full shadow-premium focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 max-w-xl w-full"
            >
                <input
                    className="bg-transparent pl-5 pr-2 outline-none w-full text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400"
                    type="email"
                    placeholder="Enter your email address..."
                    required
                />
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 md:px-8 py-3 rounded-full text-sm transition-colors duration-200 shrink-0 cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                </motion.button>
            </form>
        </motion.div>
    )
}

export default NewsLetter;

