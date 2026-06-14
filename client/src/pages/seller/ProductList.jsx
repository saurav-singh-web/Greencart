import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'

const ProductList = () => {
    const { currency, axios } = useAppcontext()
    const [sellerProducts, setSellerProducts] = useState([])

    const fetchSellerProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/seller-list')
            if (data.success) {
                setSellerProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchSellerProducts()
    }, [])

    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await axios.post('/api/product/stock', { id, inStock })
            if (data.success) {
                fetchSellerProducts()
                toast.success(data.message)
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">My Products</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {sellerProducts.length} product{sellerProducts.length !== 1 ? 's' : ''} listed by you
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                {sellerProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950">
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Stock</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sellerProducts.map((product, i) => (
                                    <motion.tr
                                        key={product._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    className="h-12 w-12 rounded-xl object-contain border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1"
                                                    src={product.image[0]}
                                                    alt={product.name}
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{product.name}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5 line-through">{currency}{product.price}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-extrabold text-emerald-500">{currency}{product.offerPrice}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-full ${product.inStock ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStock(product._id, !product.inStock)}
                                                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${product.inStock ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                            >
                                                {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <PackageSearch className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No products yet</h3>
                        <p className="text-sm text-slate-500 mt-1">Start by adding your first product from the sidebar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductList
