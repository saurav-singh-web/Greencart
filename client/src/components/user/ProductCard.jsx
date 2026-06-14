import React from "react";
import { useAppcontext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Plus, Minus, Heart, Eye } from "lucide-react";
import Tilt from "react-parallax-tilt";

const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems, navigate, wishlistItems, toggleWishlist, setQuickViewProduct } = useAppcontext();

    if (!product) return null;

    const discount = product.price > product.offerPrice 
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
        : 0;

    const quantity = cartItems[product._id] || 0;
    const isWishlisted = wishlistItems?.includes(product._id);

    return (
        <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.02} transitionSpeed={2500} gyroscope={true} className="w-full flex justify-center">
            <motion.div 
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => {
                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="group cursor-pointer border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-premium hover:shadow-premium-hover transition-all duration-300 relative flex flex-col justify-between w-full h-full"
            >
            {/* Image Container */}
            <div className="relative bg-slate-50 dark:bg-slate-950 rounded-xl p-4 flex items-center justify-center aspect-square overflow-hidden select-none">
                <motion.img 
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                    className="max-h-36 object-contain w-auto" 
                    src={product.image[0]} 
                    alt={product.name} 
                />
                
                {/* Discount Badge */}
                {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* Hover Actions (Wishlist & Quick View) */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className="w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors group/btn"
                    >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300 group-hover/btn:text-rose-500'}`} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                        className="w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors group/btn"
                    >
                        <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300 group-hover/btn:text-emerald-500" />
                    </button>
                </div>
            </div>

            {/* Content Details */}
            <div className="mt-4 flex flex-col flex-grow justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {product.category}
                    </span>
                    <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm mt-1 truncate hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                        {product.name}
                    </h4>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-2">
                        {Array(5).fill('').map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3 h-3 ${
                                    i < 4 
                                        ? 'text-amber-400 fill-amber-400' 
                                        : 'text-slate-200 dark:text-slate-700'
                                }`} 
                            />
                        ))}
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 ml-1.5">(4)</span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                            {currency}{product.price}
                        </span>
                        <span className="text-base font-extrabold text-emerald-500 dark:text-emerald-400 leading-none">
                            {currency}{product.offerPrice}
                        </span>
                    </div>

                    {/* Cart Controls */}
                    <div onClick={(e) => e.stopPropagation()} className="h-8 flex items-center">
                        {quantity === 0 ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-300" 
                                onClick={() => addToCart(product._id)} 
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                            </motion.button>
                        ) : (
                            <div className="flex items-center justify-between border border-emerald-500/30 dark:border-emerald-500/40 rounded-full bg-emerald-500 text-white font-bold h-8 overflow-hidden w-20 shadow-sm shadow-emerald-500/10 select-none">
                                <button 
                                    onClick={() => removeFromCart(product._id)} 
                                    className="cursor-pointer text-xs px-2.5 h-full hover:bg-emerald-600 transition-colors flex items-center justify-center w-full"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-center w-5">{quantity}</span>
                                <button 
                                    onClick={() => addToCart(product._id)} 
                                    className="cursor-pointer text-xs px-2.5 h-full hover:bg-emerald-600 transition-colors flex items-center justify-center w-full"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
        </Tilt>
    );
};

export default ProductCard;

