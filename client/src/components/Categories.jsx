import React from 'react'
import { categories } from '../assets/assets'
import { useAppcontext } from '../context/AppContext'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'

const Categories = () => {
    const { navigate, darkMode } = useAppcontext()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    }

    return (
        <div className='mt-20'>
            <motion.p 
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className='text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100'
            >
                Shop by Category
            </motion.p>
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-8 gap-5'
            >
                {categories.map((cat, index) => (
                    <Tilt key={index} tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2000} gyroscope={true}>
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ 
                                y: -6, 
                                boxShadow: darkMode 
                                    ? `0 10px 25px -5px ${cat.bgColor}15` 
                                    : `0 10px 20px -5px rgba(0,0,0,0.04)`
                            }}
                            whileTap={{ scale: 0.98 }}
                            className='group cursor-pointer py-6 px-4 gap-3 rounded-2xl flex flex-col justify-center items-center text-center transition-all duration-300 border border-transparent'
                            style={{
                                backgroundColor: darkMode ? 'var(--card-bg)' : cat.bgColor,
                                borderColor: darkMode ? `${cat.bgColor}20` : 'transparent',
                            }}
                            onClick={() => {
                                navigate(`/products/${cat.path.toLocaleLowerCase()}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <div className="p-2 bg-white/40 dark:bg-slate-800/40 rounded-full w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-3">
                                <img 
                                    src={cat.image} 
                                    alt={cat.text} 
                                    className='w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300' 
                                />
                            </div>
                            <p className='text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors'>
                                {cat.text}
                            </p>
                        </motion.div>
                    </Tilt>
                ))}
            </motion.div>
        </div>
    )
}

export default Categories