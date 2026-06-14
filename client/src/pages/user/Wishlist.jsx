import React, { useEffect } from 'react';
import { useAppcontext } from '../../context/AppContext';
import ProductCard from '../../components/user/ProductCard';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';

const Wishlist = () => {
    const { wishlistItems, products, navigate } = useAppcontext();

    // Filter products to only those in the wishlist
    const wishlistedProducts = products.filter(product => wishlistItems.includes(product._id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                        My Wishlist
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
            </motion.div>

            {wishlistedProducts.length > 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                >
                    {wishlistedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-premium"
                >
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Your wishlist is empty</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center max-w-sm">
                        Save items you love so you can easily find them later when you're ready to buy.
                    </p>
                    <button 
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md shadow-emerald-500/20"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Start Shopping
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default Wishlist;

