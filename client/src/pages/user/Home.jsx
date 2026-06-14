import React from 'react'
import MainBanner from '../../components/user/MainBanner'
import Categories from '../../components/user/Categories'
import BestSeller from '../../components/user/BestSeller'
import BottoBanner from '../../components/user/BottoBanner'
import NewsLetter from '../../components/user/NewsLetter'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className='mt-10'
    > 
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottoBanner/>
      <NewsLetter />
    </motion.div>
  )
}

export default Home
