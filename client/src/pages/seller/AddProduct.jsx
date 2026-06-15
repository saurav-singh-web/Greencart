import React, { useState, useRef, useCallback } from 'react'
import { categories } from '../../assets/assets';
import { useAppcontext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Plus, Package, Tag, DollarSign, ImagePlus, CheckCircle2, Sparkles, CloudUpload } from 'lucide-react';

/* ─────────────────────────────────────────
   Single Image Drop Zone
   Uses a div (not label) so drag events
   work reliably. A ref opens the file input.
───────────────────────────────────────── */
const ImageSlot = ({ index, file, onFile, onRemove, isMain }) => {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const dragCounter = useRef(0); // track enter/leave across children

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setDragOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (!droppedFile.type.startsWith('image/')) {
                toast.error('Only image files are accepted');
                return;
            }
            onFile(index, droppedFile);
        }
    };

    const handleInputChange = (e) => {
        const selected = e.target.files[0];
        if (selected) onFile(index, selected);
        // reset so same file can be re-selected
        e.target.value = '';
    };

    const preview = file ? URL.createObjectURL(file) : null;

    if (isMain) {
        return (
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`relative w-full h-56 rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
                    ${dragOver
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]'
                        : file
                            ? 'border-transparent'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                />

                <AnimatePresence mode="wait">
                    {file ? (
                        <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full group">
                            <img src={preview} alt="main" className="w-full h-full object-cover" />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Replace
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                                >
                                    <X className="w-3.5 h-3.5" /> Remove
                                </button>
                            </div>

                            {/* Main badge */}
                            <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">
                                Main
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 select-none"
                        >
                            <motion.div
                                animate={dragOver ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className={`p-4 rounded-2xl transition-colors ${dragOver ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}
                            >
                                <CloudUpload className={`w-9 h-9 transition-colors ${dragOver ? 'text-emerald-500' : 'text-slate-400'}`} />
                            </motion.div>
                            <div className="text-center">
                                <p className={`text-sm font-bold transition-colors ${dragOver ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {dragOver ? 'Release to upload!' : 'Drag & drop here'}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">or <span className="text-emerald-500 font-semibold underline">browse files</span></p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Main Photo</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drop glow ring */}
                {dragOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 ring-offset-2 pointer-events-none"
                    />
                )}
            </div>
        );
    }

    // Small thumbnail slot
    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative h-24 rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
                ${dragOver
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-105'
                    : file
                        ? 'border-transparent'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
            />

            {file ? (
                <div className="w-full h-full group">
                    <img src={preview} alt={`img-${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    {dragOver ? (
                        <motion.div animate={{ scale: 1.3 }} className="text-emerald-500">
                            <CloudUpload className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <Plus className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    )}
                </div>
            )}

            {dragOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl ring-2 ring-emerald-400 pointer-events-none"
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const AddProduct = () => {
    const [files, setFiles] = useState([null, null, null, null]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const { axios } = useAppcontext();

    const handleFile = useCallback((index, file) => {
        setFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });
    }, []);

    const handleRemove = useCallback((index) => {
        setFiles(prev => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    }, []);

    const discount = price && offerPrice && Number(offerPrice) < Number(price)
        ? Math.round(((price - offerPrice) / price) * 100)
        : 0;

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!files.some(Boolean)) {
            toast.error('Please upload at least one product image');
            return;
        }
        setIsSubmitting(true);
        try {
            const productData = {
                name,
                discription: description.split('\n').filter(Boolean),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
            };
            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            files.forEach(file => { if (file) formData.append('images', file); });

            const { data } = await axios.post('/api/product/add', formData);
            if (data.success) {
                toast.success('Product listed successfully!');
                setName(''); setDescription(''); setCategory('');
                setPrice(''); setOfferPrice('');
                setFiles([null, null, null, null]);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMagicFill = async () => {
        if (!files[0]) {
            toast.error("Please upload the main product image first.");
            return;
        }
        setIsGenerating(true);
        const toastId = toast.loading("AI is analyzing your image...");
        try {
            const formData = new FormData();
            formData.append("image", files[0]);

            const { data } = await axios.post("/api/product/ai-copilot", formData);
            if (data.success && data.data) {
                const aiData = data.data;
                if (aiData.name) setName(aiData.name);
                if (aiData.description) setDescription(aiData.description);
                if (aiData.category) setCategory(aiData.category);
                if (aiData.price) {
                    setPrice(aiData.price);
                    // Set offer price slightly lower if desired, or leave it
                }
                toast.success("Magic Fill complete!", { id: toastId });
            } else {
                toast.error(data.message || "Failed to generate AI data", { id: toastId });
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all";
    const labelClass = "block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2";
    const uploadedCount = files.filter(Boolean).length;

    return (
        <div className="flex flex-col gap-8 pb-12 max-w-5xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Add New Product</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Fill in the details below to list a new product on the marketplace.
                </p>
            </div>

            <form onSubmit={onSubmitHandler}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ── LEFT: Image Uploader ── */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-500">
                                        <ImagePlus className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Product Images</h2>
                                </div>
                                <span className="text-xs font-extrabold text-slate-400 tabular-nums">
                                    {uploadedCount}<span className="text-slate-300 dark:text-slate-700">/4</span>
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(uploadedCount / 4) * 100}%` }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            </div>

                            {/* Main slot */}
                            <div className="mb-4">
                                <ImageSlot index={0} file={files[0]} onFile={handleFile} onRemove={handleRemove} isMain />
                            </div>

                            {/* 3 small slots */}
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(i => (
                                    <ImageSlot key={i} index={i} file={files[i]} onFile={handleFile} onRemove={handleRemove} isMain={false} />
                                ))}
                            </div>

                            <p className="text-center text-[10px] font-medium text-slate-400 mt-4">
                                Drag & drop or click any slot to upload
                            </p>
                        </div>

                        {/* Live Discount Badge */}
                        <AnimatePresence>
                            {discount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 opacity-80" />
                                        <span className="text-xs font-extrabold uppercase tracking-widest opacity-80">Discount Preview</span>
                                    </div>
                                    <p className="text-5xl font-black leading-none">{discount}%</p>
                                    <p className="text-sm font-semibold opacity-70 mt-1">off the original price</p>
                                    <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-4">
                                        <span className="line-through opacity-60 text-sm font-semibold">${Number(price).toFixed(2)}</span>
                                        <span className="text-2xl font-extrabold">${Number(offerPrice).toFixed(2)}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT: Product Details ── */}
                    <div className="xl:col-span-2 flex flex-col gap-6">

                        {/* Magic AI Fill Button */}
                        <motion.button
                            type="button"
                            onClick={handleMagicFill}
                            disabled={!files[0] || isGenerating}
                            whileHover={files[0] && !isGenerating ? { scale: 1.02 } : {}}
                            whileTap={files[0] && !isGenerating ? { scale: 0.98 } : {}}
                            className={`w-full relative overflow-hidden rounded-3xl p-6 flex items-center justify-between shadow-sm border ${
                                files[0]
                                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-transparent text-white cursor-pointer'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed grayscale'
                            }`}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-2xl ${files[0] ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                    <Sparkles className={`w-6 h-6 ${files[0] ? 'text-white animate-pulse' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-lg font-extrabold ${files[0] ? 'text-white' : 'text-slate-500'}`}>
                                        {isGenerating ? "AI is analyzing image..." : "✨ Magic Fill with AI"}
                                    </h3>
                                    <p className={`text-sm font-medium ${files[0] ? 'text-white/80' : 'text-slate-400'} mt-0.5`}>
                                        {files[0] ? "Click to auto-generate title, description, and price." : "Upload a main image first to use AI Copilot."}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Decorative background glow */}
                            {files[0] && !isGenerating && (
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
                            )}
                            
                            {/* Loading overlay */}
                            {isGenerating && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm z-20">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </motion.button>

                        {/* Product Info */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <Package className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Product Information</h2>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass} htmlFor="product-name">Product Name</label>
                                    <input
                                        id="product-name" type="text" required
                                        placeholder="e.g. Organic Basmati Rice 5kg"
                                        value={name} onChange={e => setName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="product-description">
                                        Description
                                        <span className="normal-case text-slate-300 dark:text-slate-600 ml-1 font-medium tracking-normal">
                                            — one bullet point per line
                                        </span>
                                    </label>
                                    <textarea
                                        id="product-description" rows={5}
                                        placeholder={"100% organic certified\nFresh from the farm\nRich in nutrients"}
                                        value={description} onChange={e => setDescription(e.target.value)}
                                        className={`${inputClass} resize-none`}
                                    />
                                    <AnimatePresence>
                                        {description && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 flex flex-wrap gap-2 overflow-hidden"
                                            >
                                                {description.split('\n').filter(Boolean).map((pt, i) => (
                                                    <span key={i} className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                                                        • {pt}
                                                    </span>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Category & Pricing */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Category & Pricing</h2>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass} htmlFor="category">Category</label>
                                    <select
                                        id="category" required
                                        value={category} onChange={e => setCategory(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map((item, i) => (
                                            <option key={i} value={item.path}>{item.path}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'product-price', label: 'Original Price', val: price, set: setPrice, color: 'text-slate-400' },
                                        { id: 'offer-price', label: 'Offer Price', val: offerPrice, set: setOfferPrice, color: 'text-emerald-500' },
                                    ].map(({ id, label, val, set, color }) => (
                                        <div key={id}>
                                            <label className={labelClass} htmlFor={id}>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />{label}
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${color}`}>$</span>
                                                <input
                                                    id={id} type="number" required min="0" step="0.01"
                                                    placeholder="0.00"
                                                    value={val} onChange={e => set(e.target.value)}
                                                    className={`${inputClass} pl-8`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {price && offerPrice && Number(offerPrice) >= Number(price) && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl text-xs font-semibold"
                                        >
                                            <span>⚠️</span> Offer price should be lower than the original price.
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.01, boxShadow: "0 12px 30px -5px rgba(16, 185, 129, 0.35)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-3 text-base"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Publishing Product...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Publish Product
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;