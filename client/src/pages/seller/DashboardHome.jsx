import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Package, Users, DollarSign, ArrowUpRight, ArrowDownRight, ShoppingBag, Clock } from 'lucide-react'
import { useAppcontext } from '../../context/AppContext'

const DashboardHome = () => {
    const { currency, axios, sellerInfo } = useAppcontext()
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0
    })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // These endpoints are now seller-scoped on the backend
                const [ordersRes, productsRes] = await Promise.all([
                    axios.get('/api/order/seller'),
                    axios.get('/api/product/seller-list'),
                ])

                if (ordersRes.data.success && productsRes.data.success) {
                    const orders = ordersRes.data.orders
                    const products = productsRes.data.products

                    // Build real chart data from last 30 days
                    const now = new Date()
                    const dayMap = {}
                    for (let i = 30; i >= 0; i--) {
                        const d = new Date(now)
                        d.setDate(d.getDate() - i)
                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        dayMap[label] = { name: label, revenue: 0, orders: 0 }
                    }
                    orders.forEach(order => {
                        const label = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        if (dayMap[label]) {
                            dayMap[label].revenue += order.amount
                            dayMap[label].orders += 1
                        }
                    })
                    setChartData(Object.values(dayMap))

                    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)
                    const pendingOrders = orders.filter(o => o.status === 'Order Placed').length

                    setStats({
                        totalRevenue,
                        totalOrders: orders.length,
                        totalProducts: products.length,
                        pendingOrders
                    })
                }
            } catch (error) {
                console.error("Dashboard data error:", error)
            }
        }
        fetchDashboardData()
    }, [])

    const StatCard = ({ title, value, icon: Icon, trend, isPositive, color }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${color}`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
        </motion.div>
    )

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Sales Command Center</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Monitor your business performance at a glance.</p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    Download Report
                </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`${currency}${stats.totalRevenue.toLocaleString()}`} 
                    icon={DollarSign} 
                    trend="+12.5%" 
                    isPositive={true} 
                    color="bg-emerald-500 text-emerald-500" 
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={ShoppingBag} 
                    trend="+5.2%" 
                    isPositive={true} 
                    color="bg-blue-500 text-blue-500" 
                />
                <StatCard 
                    title="Pending Orders" 
                    value={stats.pendingOrders} 
                    icon={Clock} 
                    trend="-2.4%" 
                    isPositive={false} 
                    color="bg-amber-500 text-amber-500" 
                />
                <StatCard 
                    title="Active Products" 
                    value={stats.totalProducts} 
                    icon={Package} 
                    trend="+1.2%" 
                    isPositive={true} 
                    color="bg-indigo-500 text-indigo-500" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
                >
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6">Revenue Overview (Last 30 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-colors-slate-900)' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
                >
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6">Top Products</h3>
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400">
                                    #{i}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Organic Product {i}</h4>
                                    <p className="text-xs text-slate-500">{120 - i * 15} sales</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-emerald-500 text-sm">{currency}{(120 - i * 15) * 45}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default DashboardHome
