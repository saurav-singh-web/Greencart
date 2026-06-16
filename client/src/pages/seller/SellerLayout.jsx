import { NavLink, Outlet, Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppcontext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { LayoutDashboard, PlusCircle, List, PackageOpen, LogOut, Tag, Star } from 'lucide-react';

const SellerLayout = () => {
    const { axios, navigate, setIsSeller, sellerInfo, setSellerInfo, fetchSeller } = useAppcontext();

    // Fetch seller info when component mounts if not already available
    useEffect(() => {
        if (!sellerInfo) {
            fetchSeller();
        }
    }, []);

    const sidebarLinks = [
        { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
        { name: "Add Product", path: "/seller/add-product", icon: PlusCircle },
        { name: "Product List", path: "/seller/product-list", icon: List },
        { name: "Orders", path: "/seller/orders", icon: PackageOpen },
        { name: "Coupons", path: "/seller/coupons", icon: Tag },
        { name: "Reviews", path: "/seller/reviews", icon: Star },
    ];

    const logout = async () => {
        try {
            const {data} = await axios.get('/api/seller/logout');
            if(data.success){
                toast.success(data.message)
                setIsSeller(false)
                setSellerInfo(null) // Clear seller info on logout
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            {/* Sidebar */}
            <div className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <Link to="/">
                        <img className="h-9 dark:brightness-0 dark:invert transition-all" src={assets.logo} alt="logo" />
                    </Link>
                </div>
                
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
                        {sellerInfo?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seller</p>
                        <p className="font-extrabold truncate w-32">{sellerInfo?.name || "Dashboard"}</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {sidebarLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <li key={index}>
                                    <NavLink 
                                        to={link.path} 
                                        end={link.path === '/seller'}
                                        className={({ isActive }) => 
                                            `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                                isActive 
                                                    ? 'bg-emerald-500 text-white shadow-md' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-100' : ''}`} />
                                                {link.name}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl font-bold text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;
