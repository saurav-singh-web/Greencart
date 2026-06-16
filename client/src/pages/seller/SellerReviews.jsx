import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

const SellerReviews = () => {
    const { axios, currency } = useAppcontext()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [selectedReviews, setSelectedReviews] = useState([])

    const fetchSellerReviews = async () => {
        try {
            const { data } = await axios.get('/api/product/seller-list')
            if (data.success) {
                const allReviews = [];
                data.products.forEach(product => {
                    if (product.reviews && product.reviews.length > 0) {
                        product.reviews.forEach(review => {
                            allReviews.push({ ...review, product: product });
                        });
                    }
                });
                
                // Sort by date descending (newest first)
                allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                setReviews(allReviews);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSellerReviews()
    }, [])

    const toggleSelection = (index) => {
        if (selectedReviews.includes(index)) {
            setSelectedReviews(selectedReviews.filter(i => i !== index));
        } else {
            setSelectedReviews([...selectedReviews, index]);
        }
    }

    const generateAnalysis = async (mode = 'all') => {
        const reviewsToAnalyze = mode === 'selected' 
            ? reviews.filter((_, i) => selectedReviews.includes(i))
            : reviews;

        if (reviewsToAnalyze.length === 0) return toast.error("No reviews to analyze.");
        
        setAnalyzing(true);
        setAiAnalysis(null);
        try {
            const { data } = await axios.post('/api/seller/review-analysis', { reviews: reviewsToAnalyze });
            if (data.success) {
                setAiAnalysis(data.analysis);
                toast.success("AI Analysis generated successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAnalyzing(false);
        }
    }

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        className={`w-4 h-4 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-800'}`} 
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Customer Reviews</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {reviews.length} total review{reviews.length !== 1 ? 's' : ''} across all your products
                    </p>
                </div>
                
                {reviews.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                        {selectedReviews.length > 0 && (
                            <button 
                                onClick={() => generateAnalysis('selected')}
                                disabled={analyzing}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-extrabold text-sm shadow-md transition-all disabled:opacity-70 w-full sm:w-auto"
                            >
                                {analyzing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                {analyzing ? 'Analyzing...' : `Analyze Selected (${selectedReviews.length})`}
                            </button>
                        )}
                        <button 
                            onClick={() => generateAnalysis('all')}
                            disabled={analyzing}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold text-sm shadow-md transition-all disabled:opacity-70 w-full sm:w-auto"
                        >
                            {analyzing && selectedReviews.length === 0 ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {analyzing && selectedReviews.length === 0 ? 'Analyzing...' : 'Analyze All'}
                        </button>
                    </div>
                )}
            </div>

            {aiAnalysis && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">AI Insights Report</h2>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Overall Sentiment: {aiAnalysis.overallSentiment}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-5 border border-white/20 dark:border-slate-800/20 backdrop-blur-sm">
                                <h3 className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-3 text-sm uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4" /> What Customers Love
                                </h3>
                                <ul className="space-y-2">
                                    {aiAnalysis.whatCustomersLove?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-emerald-500 mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-5 border border-white/20 dark:border-slate-800/20 backdrop-blur-sm">
                                <h3 className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 mb-3 text-sm uppercase tracking-widest">
                                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {aiAnalysis.areasForImprovement?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-rose-500 mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            {/* Review Content */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedReviews.includes(i)}
                                            onChange={() => toggleSelection(i)}
                                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{review.userName || 'Customer'}</h3>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 relative z-10 italic">
                                "{review.comment}"
                            </p>
                            
                            {/* Product Reference */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-1 shrink-0">
                                    <img src={review.product.image[0]} alt={review.product.name} className="max-h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Purchased Item</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{review.product.name}</p>
                                </div>
                            </div>

                            {/* Background decoration */}
                            <MessageSquare className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-50 dark:text-slate-800/30 -z-0 rotate-12 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-500" />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <Star className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No reviews yet</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">When customers leave reviews on your products, they will automatically appear here.</p>
                </div>
            )}
        </div>
    )
}

export default SellerReviews
