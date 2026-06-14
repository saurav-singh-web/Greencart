import React from 'react'
import ProductCard from './ProductCard'
import { useAppcontext } from '../../context/AppContext'
import { motion } from 'framer-motion'

const BestSeller = () => {
    const { products } = useAppcontext();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    }

    const itemVariants = {
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
                Best Sellers
            </motion.p>
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8'
            >
                {products.filter((product) => product.inStock).slice(0, 5).map((prod) => (
                    <motion.div key={prod._id} variants={itemVariants}>
                        <ProductCard product={prod} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

export default BestSeller;

