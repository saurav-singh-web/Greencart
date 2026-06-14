import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import ProductCard from '../../components/user/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

const AllProducts = () => {
    const { products, searchQuery } = useAppcontext()
    
    // Filtering & Sorting State
    const [filteredProducts, setfilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('relevant')
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const categories = ['All', 'Vegetables', 'Fruits', 'Drinks', 'Instant', 'Dairy', 'Bakery', 'Grains']

    // Combined Filtering & Sorting Logic
    useEffect(() => {
        let tempProducts = [...products]

        // 1. In-Stock Filter
        tempProducts = tempProducts.filter(p => p.inStock)

        // 2. Search Query Filter
        if (searchQuery && typeof searchQuery === 'string' && searchQuery.length > 0) {
            tempProducts = tempProducts.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // 3. Category Filter
        if (selectedCategory !== 'All') {
            tempProducts = tempProducts.filter(product => product.category === selectedCategory)
        }

        // 4. Sorting
        if (sortOption === 'low-high') {
            tempProducts.sort((a, b) => a.offerPrice - b.offerPrice)
        } else if (sortOption === 'high-low') {
            tempProducts.sort((a, b) => b.offerPrice - a.offerPrice)
        }

        setfilteredProducts(tempProducts)
        setCurrentPage(1) // Reset to first page on filter change
    }, [products, searchQuery, selectedCategory, sortOption])

    // Calculate Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className='mt-12 flex flex-col min-h-[60vh] gap-6'
        >
            {/* Header Section */}
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                    <p className='text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase'>
                        All Products
                    </p>
                    <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                </div>

                {/* Filters & Sorting Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    {/* Categories Pill Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                    selectedCategory === cat 
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Sort By:</span>
                        </div>
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 transition-colors font-semibold cursor-pointer"
                        >
                            <option value="relevant">Relevant</option>
                            <option value="low-high">Price: Low to High</option>
                            <option value="high-low">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                
                {/* Product Count Indicator */}
                <div className='text-sm text-slate-500 dark:text-slate-400 font-medium px-1'>
                    {searchQuery && typeof searchQuery === 'string' && searchQuery.length > 0 ? (
                        <span>
                            Showing {filteredProducts.length} results for <span className="text-emerald-500 dark:text-emerald-400 font-semibold">"{searchQuery}"</span>
                        </span>
                    ) : (
                        <span>Showing {filteredProducts.length} organic items</span>
                    )}
                </div>
            </div>

            {/* Products Grid / Empty State */}
            <AnimatePresence mode="wait">
                {paginatedProducts.length > 0 ? (
                    <motion.div 
                        key="grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6 mt-4'
                    >
                        {paginatedProducts.map((product) => (
                            <motion.div key={product._id} variants={itemVariants} className="flex justify-center">
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
                        className="flex flex-col items-center justify-center text-center py-20 px-4"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 dark:text-slate-600 mb-4 shadow-inner">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            No products found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                            We couldn't find any items matching your filters. Try adjusting your category or search query.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const page = idx + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer ${
                                        currentPage === page 
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </motion.div>
    )
}

export default AllProducts

