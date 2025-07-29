import React from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ProductList = () => {

    const {products, currency, axios, fetchProducts} =useAppcontext()

    const toggleStock = async (id, inStock)=>{
        try {
            const {data} = await axios.post('/api/product/stock', {id, inStock});
            if(data.success){
                fetchProducts();
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
                toast.error(error.message)

        }
    }
  return (
    <div>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-color)' }}>Product List</h1>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300" style={{ borderColor: 'var(--table-border)' }}>
                <thead>
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)' }}>
                            Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)' }}>
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)' }}>
                            Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)' }}>
                            Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--text-color)' }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300" style={{ borderColor: 'var(--table-border)' }}>
                    {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-100 hover:dark:bg-gray-700" style={{ borderColor: 'var(--table-border)' }}>
                            <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--text-color)' }}>
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                        <img className="h-10 w-10 rounded-full" src={product.image[0]} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{product.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-color)' }}>
                                {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-color)' }}>
                                {currency}{product.offerPrice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                    onClick={() => toggleStock(product._id, !product.inStock)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                    {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default ProductList
