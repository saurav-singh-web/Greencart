import React from 'react'
import { assets, features } from '../assets/assets'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'

const BottoBanner = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    }

    return (
        <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01} transitionSpeed={3000} gyroscope={true} className='relative mt-24 overflow-hidden rounded-2xl md:rounded-3xl shadow-sm'>
            {/* Background Images */}
            <img src={assets.bottom_banner_image} alt="Why GreenCart" className='w-full hidden md:block select-none' />
            <img src={assets.bottom_banner_image_sm} alt="Why GreenCart" className='w-full md:hidden select-none' />
            
            {/* Overlay Container */}
            <div className='absolute inset-0 flex flex-col items-center md:items-end md:justify-center p-6 md:pr-16 lg:pr-24'>
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center md:items-start glass-panel p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl max-w-md w-full backdrop-blur-md"
                >
                    <motion.h2 
                        variants={itemVariants}
                        className='text-2xl md:text-3xl font-extrabold mb-6 text-emerald-500 dark:text-emerald-400 text-center md:text-left w-full'
                    >
                        Why We Are the Best?
                    </motion.h2>

                    <div className="flex flex-col gap-4.5 w-full">
                        {features.map((feature, index) => (
                            <motion.div 
                                key={index} 
                                variants={itemVariants}
                                whileHover={{ x: 4 }}
                                className='flex items-start gap-4 text-left w-full'
                            >
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl shrink-0">
                                    <img src={feature.icon} alt={feature.title} className='w-9 h-9 object-contain' />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className='text-base md:text-lg font-bold text-slate-800 dark:text-slate-100'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed'>
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Tilt>
    )
}

export default BottoBanner
