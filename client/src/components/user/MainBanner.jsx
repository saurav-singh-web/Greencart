import React from 'react'
import { assets } from "../assets/assets";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

const MainBanner = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    }
  };

  return (
    <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} scale={1.01} transitionSpeed={2500} gyroscope={true}>
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-sm bg-[#e8f5ed] dark:bg-[#0d1c16] transition-colors duration-300">
        {/* Background Banner Images */}
      <img src={assets.main_banner_bg} alt="Main Banner" className="w-full hidden md:block select-none" />
      <img src={assets.main_banner_bg_sm} alt="Main Banner Mobile" className="w-full md:hidden select-none" />
      
      {/* Banner content overlay */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-12 md:pb-0 px-6 md:pl-16 lg:pl-24"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-3xl md:text-4xl lg:text-5xl font-black text-center md:text-left max-w-[18rem] md:max-w-[26rem] lg:max-w-[36rem] leading-tight lg:leading-[3.5rem] tracking-tight text-slate-800 antialiased"
        >
          Freshness You Can Trust, Savings You'll Love!
        </motion.h1>     
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8 font-medium w-full sm:w-auto"
        >
          <motion.div
            whileHover={{ scale: 1.03, translateY: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/products" 
              className="flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0d9668] text-white font-semibold text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 w-full sm:w-auto text-center"
            >
              <span>Shop now</span>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/products" 
              className="group flex items-center justify-center gap-2 px-8 py-3.5 cursor-pointer text-base text-slate-700 font-semibold hover:text-emerald-600 transition-colors w-full sm:w-auto"
            >
              <span>Explore deals</span>
              <ArrowRight className="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
    </Tilt>
  );
};

export default MainBanner;

