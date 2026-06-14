import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Tag, Trash2, Calendar, DollarSign, Percent } from 'lucide-react'

const Coupons = () => {
    const { currency, axios } = useAppcontext()
    const [coupons, setCoupons] = useState([])
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        expiryDate: ''
    })

    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get('/api/coupon/list')
            if (data.success) {
                setCoupons(data.coupons)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleCreateCoupon = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post('/api/coupon/create', formData)
            if (data.success) {
                toast.success(data.message)
                setFormData({
                    code: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minPurchaseAmount: '',
                    expiryDate: ''
                })
                fetchCoupons()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeleteCoupon = async (id) => {
        try {
            const { data } = await axios.post('/api/coupon/delete', { id })
            if (data.success) {
                toast.success(data.message)
                fetchCoupons()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Promotions & Discounts</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Create and manage coupon codes to boost sales.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Coupon Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm h-fit"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Tag className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Create Coupon</h2>
                    </div>

                    <form onSubmit={handleCreateCoupon} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Coupon Code</label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. SUMMER50"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors uppercase" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Type</label>
                                <select 
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ({currency})</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Value</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        {formData.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                    </div>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        placeholder="0"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Min Purchase Amount ({currency})</label>
                            <input 
                                type="number" 
                                min="0"
                                placeholder="Leave 0 for no minimum"
                                value={formData.minPurchaseAmount}
                                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" 
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Expiry Date</label>
                            <input 
                                type="date" 
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" 
                            />
                        </div>

                        <button type="submit" className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors">
                            Generate Coupon
                        </button>
                    </form>
                </motion.div>

                {/* Active Coupons List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
                >
                    <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6">Active Coupons</h2>
                    
                    <div className="space-y-4">
                        {coupons.length > 0 ? coupons.map((coupon) => {
                            const isExpired = new Date() > new Date(coupon.expiryDate)
                            
                            return (
                                <div key={coupon._id} className={`flex items-center justify-between p-4 rounded-2xl border ${isExpired ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isExpired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'}`}>
                                            <Tag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{coupon.code}</h3>
                                                {isExpired && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-bold uppercase">Expired</span>}
                                            </div>
                                            <p className="text-sm font-semibold text-emerald-500">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${currency}${coupon.discountValue} OFF`}
                                                {coupon.minPurchaseAmount > 0 && <span className="text-slate-400 ml-1">on orders above {currency}{coupon.minPurchaseAmount}</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                        title="Delete Coupon"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-12">
                                <Tag className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No coupons yet</h3>
                                <p className="text-sm text-slate-500 mt-1">Create your first coupon code to attract more customers.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Coupons
