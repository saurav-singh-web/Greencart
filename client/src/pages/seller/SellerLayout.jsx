import { NavLink, Outlet, Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppcontext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

const SellerLayout = () => {
    const { axios, navigate, setIsSeller, sellerInfo, setSellerInfo, fetchSeller } = useAppcontext();

    // Fetch seller info when component mounts if not already available
    useEffect(() => {
        if (!sellerInfo) {
            fetchSeller();
        }
    }, []);

    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
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
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="seller-sidebar w-64 h-full border-r border-gray-300 flex flex-col" style={{ backgroundColor: 'var(--seller-sidebar-bg)', borderColor: 'var(--border-color)' }}>
                <div className="p-4 border-b border-gray-300" style={{ borderColor: 'var(--border-color)' }}>
                    <Link to="/">
                        <img className="h-9" src={assets.logo} alt="logo" />
                    </Link>
                </div>
                
                <div className="p-4 border-b border-gray-300" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm text-gray-500" style={{ color: 'var(--text-color)' }}>Welcome,</p>
                    <p className="font-medium" style={{ color: 'var(--text-color)' }}>{sellerInfo?.name || "Seller"}</p>
                </div>
                
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {sidebarLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink 
                                    to={link.path} 
                                    className={({ isActive }) => 
                                        `flex items-center gap-3 p-2 rounded-md transition-colors ${
                                            isActive 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'hover:bg-gray-100 hover:dark:bg-gray-700'
                                        }`
                                    }
                                    style={({ isActive }) => ({
                                        backgroundColor: isActive ? 'rgba(79, 191, 139, 0.1)' : 'transparent',
                                        color: isActive ? 'var(--color-primary)' : 'var(--text-color)'
                                    })}
                                >
                                    <img src={link.icon} alt="" className="w-5 h-5" />
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div className="p-4 border-t border-gray-300" style={{ borderColor: 'var(--border-color)' }}>
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-3 p-2 w-full text-left rounded-md hover:bg-gray-100 hover:dark:bg-gray-700 transition-colors"
                        style={{ color: 'var(--text-color)' }}
                    >
                        <img src={assets.logout_icon} alt="" className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Main content */}
            <div className="seller-content flex-1 overflow-auto" style={{ backgroundColor: 'var(--seller-content-bg)' }}>
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;
