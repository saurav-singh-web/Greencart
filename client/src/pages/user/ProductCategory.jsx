import React from 'react'
import { useAppcontext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { categories } from '../../assets/assets'
import ProductCard from '../../components/user/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

const ProductCategory = () => {
    const { products } = useAppcontext()
    const { category } = useParams()

    const searchCategory = categories.find((item) => item.path.toLowerCase() === category)
    const filteredProducts = products.filter((product) => product.category.toLowerCase() === category)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
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
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className='mt-12 min-h-[60vh] flex flex-col'
        >
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-4'>
                {searchCategory && (
                    <div className='flex flex-col gap-1.5'>
                        <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                            {searchCategory.text}
                        </p>
                        <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                    </div>
                )}
                
                <div className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
                    Showing {filteredProducts.length} items
                </div>
            </div>

            {/* Grid / Empty State */}
            <AnimatePresence mode="wait">
                {filteredProducts.length > 0 ? (
                    <motion.div 
                        key="grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6 mt-8'
                    >
                        {filteredProducts.map((product) => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center text-center py-20 px-4 flex-grow"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 dark:text-slate-600 mb-4 shadow-inner">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            No products found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                            There are currently no items in the "{searchCategory?.text || category}" category. Check back soon for fresh arrivals!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ProductCategory
