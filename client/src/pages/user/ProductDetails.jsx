import { useEffect, useState } from "react";
import { useAppcontext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../../components/user/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Star, ShoppingBag, CreditCard, Sparkles, Check, ThumbsUp, Box } from "lucide-react";
import Product3DViewer from "../../components/user/Product3DViewer";

const ProductDetails = () => {
    const { products, navigate, currency, addToCart } = useAppcontext()
    const { id } = useParams()

    const [relatedProduct, setrelatedProduct] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [viewMode, setViewMode] = useState("image");

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (products.length > 0 && product) {
            const categoryProducts = products.filter((item) => product.category === item.category && item._id !== id);
            setrelatedProduct(categoryProducts.slice(0, 5))
        }
    }, [products, product, id])

    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null)
    }, [product])

    if (!product) return null;

    const discount = product.price > product.offerPrice 
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
        : 0;

    const savings = product.price - product.offerPrice;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
        >
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-8">
                <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/products" className="hover:text-emerald-500 transition-colors">Products</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-emerald-500 transition-colors">{product.category}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
            </div>

            {/* Product Gallery & Info Details */}
            <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
                
                {/* Gallery */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 w-full md:w-1/2">
                    {/* Thumbnails */}
                    <div className="flex sm:flex-col gap-3">
                        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible no-scrollbar select-none">
                            {product.image.map((image) => (
                                <motion.div 
                                    key={image} 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setThumbnail(image); setViewMode('image'); }} 
                                    className={`border-2 rounded-2xl overflow-hidden cursor-pointer w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center transition-all ${
                                        thumbnail === image && viewMode === 'image'
                                            ? "border-emerald-500 shadow-md" 
                                            : "border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <img src={image} alt="Thumbnail" className="max-h-full object-contain" />
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* 3D View Toggle Button */}
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode(viewMode === 'image' ? '3d' : 'image')} 
                            className={`border-2 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex flex-col items-center justify-center transition-all font-bold text-xs ${
                                viewMode === '3d'
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-md"
                                    : "border-slate-100 dark:border-slate-800/80 text-slate-500 hover:border-emerald-500 hover:text-emerald-500"
                            }`}
                        >
                            <Box className="w-5 h-5 mb-1" />
                            {viewMode === 'image' ? '3D View' : 'Back to 2D'}
                        </motion.button>
                    </div>

                    {/* Main Image or 3D Viewer */}
                    {viewMode === '3d' ? (
                        <div className="w-full aspect-square max-w-[450px] mx-auto sm:mx-0">
                            <Product3DViewer modelUrl={product.modelUrl} />
                        </div>
                    ) : (
                        <div className="border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center w-full aspect-square max-w-[450px] mx-auto sm:mx-0 relative shadow-sm">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={thumbnail}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    src={thumbnail} 
                                    alt="Selected product" 
                                    className="max-h-80 object-contain w-auto select-none"
                                />
                            </AnimatePresence>
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 bg-emerald-500 text-xs font-bold text-white px-3 py-1 rounded-full shadow-md">
                                    Save {discount}%
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 flex flex-col justify-between">
                    <div>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            {product.category}
                        </span>
                        
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                            {product.name}
                        </h1>

                        {/* Ratings */}
                        <div className="flex items-center gap-1 mt-3">
                            {Array(5).fill('').map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                        i < 4 
                                            ? 'text-amber-400 fill-amber-400' 
                                            : 'text-slate-200 dark:text-slate-700'
                                    }`} 
                                />
                            ))}
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-2">4.0 (24 reviews)</span>
                        </div>

                        {/* Pricing details */}
                        <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 max-w-sm">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through">
                                MRP: {currency} {product.price.toFixed(2)}
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">
                                    {currency}{product.offerPrice.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                    (inclusive of all taxes)
                                </span>
                            </div>
                            
                            {savings > 0 && (
                                <div className="mt-2.5 inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-lg">
                                    You save {currency}{savings.toFixed(2)} instantly!
                                </div>
                            )}
                        </div>

                        {/* Description bullet points */}
                        <div className="mt-8">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Product Details
                            </h3>
                            <ul className="flex flex-col gap-3 mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {product.description.map((desc) => (
                                    <li key={desc} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center mt-10 gap-4 w-full">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(product._id)} 
                            className="flex items-center justify-center gap-2 w-full py-4 font-bold rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-sm shadow-sm"
                        >
                            <ShoppingBag className="w-4 h-4 text-emerald-500" />
                            <span>Add to Cart</span>
                        </motion.button>
                        
                        <motion.button  
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { addToCart(product._id); navigate("/cart"); }} 
                            className="flex items-center justify-center gap-2 w-full py-4 font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all cursor-pointer text-sm shadow-md"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Buy now</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-24 border-t border-slate-200/80 dark:border-slate-800/80 pt-16">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
                    {/* Stats */}
                    <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-6">Customer Reviews</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl font-black text-slate-800 dark:text-slate-100">4.8</span>
                            <div className="flex flex-col">
                                <div className="flex gap-0.5 text-amber-400">
                                    <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-500 mt-1">Based on 124 reviews</span>
                            </div>
                        </div>
                        {/* Progress bars */}
                        <div className="w-full max-w-sm space-y-3 mt-6">
                            {[5, 4, 3, 2, 1].map((star, idx) => {
                                const percentages = [80, 12, 5, 2, 1]; // Dummy distribution
                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <span className="font-bold text-slate-600 dark:text-slate-400 w-2">{star}</span>
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <div className="flex-grow h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${percentages[idx]}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-amber-400 rounded-full" 
                                            />
                                        </div>
                                        <span className="w-8 text-right text-slate-500 font-medium">{percentages[idx]}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Review Comments */}
                    <div className="w-full md:w-2/3 flex flex-col gap-6">
                        {[
                            { name: "Alex Johnson", date: "2 days ago", rating: 5, comment: "Absolutely love this product! The quality is fantastic and it arrived super fast. Would highly recommend." },
                            { name: "Sarah M.", date: "1 week ago", rating: 4, comment: "Great item for the price. The packaging was a bit damaged but the product inside was in perfect condition." },
                            { name: "Michael T.", date: "2 weeks ago", rating: 5, comment: "Exactly what I was looking for. Fits perfectly into my setup and the premium feel is real." }
                        ].map((review, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{review.name}</h4>
                                            <div className="flex gap-0.5 mt-0.5">
                                                {Array(5).fill('').map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">{review.date}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    "{review.comment}"
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer hover:text-emerald-500 transition-colors w-fit">
                                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProduct.length > 0 && (
                <div className="flex flex-col items-center mt-24 border-t border-slate-200/80 dark:border-slate-800/80 pt-16"> 
                    <div className="flex flex-col items-center gap-1.5 mb-10 w-full px-4 md:px-0">
                        <div className="w-full flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                                    You Might Also Like
                                </h2>
                                <div className="w-16 h-1 bg-emerald-500 rounded-full mt-2"></div>
                            </div>
                            <button 
                                onClick={() => { navigate('/products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                className="hidden sm:flex text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors items-center gap-1"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="w-[100vw] md:w-full overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 px-6 md:px-0">
                        <div className="flex gap-4 md:gap-6 w-max items-stretch">
                            {relatedProduct.filter((prod) => prod.inStock).map((prod) => (
                                <div key={prod._id} className="snap-start shrink-0">
                                    <ProductCard product={prod} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProductDetails;

