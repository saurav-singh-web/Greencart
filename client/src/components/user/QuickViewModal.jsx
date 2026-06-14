import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppcontext } from '../../context/AppContext';
import { X, Star, ShoppingBag, Plus, Minus, Heart } from 'lucide-react';

const QuickViewModal = () => {
    const { quickViewProduct, setQuickViewProduct, currency, addToCart, cartItems, removeFromCart, wishlistItems, toggleWishlist, navigate } = useAppcontext();

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setQuickViewProduct(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setQuickViewProduct]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (quickViewProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [quickViewProduct]);

    if (!quickViewProduct) return null;

    const discount = quickViewProduct.price > quickViewProduct.offerPrice 
        ? Math.round(((quickViewProduct.price - quickViewProduct.offerPrice) / quickViewProduct.price) * 100) 
        : 0;

    const quantity = cartItems[quickViewProduct._id] || 0;
    const isWishlisted = wishlistItems?.includes(quickViewProduct._id);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setQuickViewProduct(null)}
                    className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Content Wrapper */}
                <div className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/80 dark:border-slate-800/80"
                        onClick={(e) => e.stopPropagation()}
                    >
                    {/* Close Button */}
                    <button 
                        onClick={() => setQuickViewProduct(null)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center relative min-h-[300px]">
                        {discount > 0 && (
                            <span className="absolute top-6 left-6 bg-emerald-500 text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm z-10">
                                -{discount}%
                            </span>
                        )}
                        <button 
                            onClick={() => toggleWishlist(quickViewProduct._id)}
                            className="absolute top-6 right-6 md:right-auto md:left-24 z-10 w-9 h-9 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <Heart className={`w-4.5 h-4.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300 group-hover:text-rose-500'}`} />
                        </button>
                        
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            src={quickViewProduct.image[0]} 
                            alt={quickViewProduct.name} 
                            className="max-h-[300px] w-auto object-contain drop-shadow-xl"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
                            {quickViewProduct.category}
                        </span>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-4">
                            {quickViewProduct.name}
                        </h2>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                {Array(5).fill('').map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-slate-500">(24 reviews)</span>
                        </div>
                        
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">
                                {currency}{quickViewProduct.offerPrice}
                            </span>
                            {discount > 0 && (
                                <span className="text-lg text-slate-400 dark:text-slate-500 line-through font-medium mb-1">
                                    {currency}{quickViewProduct.price}
                                </span>
                            )}
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                            {quickViewProduct.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                            {quantity === 0 ? (
                                <button 
                                    onClick={() => addToCart(quickViewProduct._id)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            ) : (
                                <div className="w-full sm:w-1/2 flex items-center justify-between border-2 border-emerald-500 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 h-[52px]">
                                    <button 
                                        onClick={() => removeFromCart(quickViewProduct._id)} 
                                        className="w-12 h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors rounded-l-xl"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{quantity}</span>
                                    <button 
                                        onClick={() => addToCart(quickViewProduct._id)} 
                                        className="w-12 h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors rounded-r-xl"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            <button 
                                onClick={() => {
                                    setQuickViewProduct(null);
                                    navigate(`/products/${quickViewProduct.category.toLowerCase()}/${quickViewProduct._id}`);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full ${quantity > 0 ? 'sm:w-1/2' : ''} py-3.5 px-6 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-all`}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default QuickViewModal;


