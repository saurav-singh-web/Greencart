import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios';


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;
    const [delivery_fee, setdelivery_fee] = useState(0)
    const navigate = useNavigate();
    const [user,setUser]= useState(null)
    const [isSeller,setIsSeller]= useState(false)
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null)
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products,setProducts]= useState([])
    const [cartItems,setCartItems]= useState({})
    const [wishlistItems, setWishlistItems] = useState(() => {
        const saved = localStorage.getItem('wishlist')
        return saved ? JSON.parse(saved) : []
    })
    const [quickViewProduct, setQuickViewProduct] = useState(null)
    const [searchQuery,setsearchQuery]= useState({})
    
    // ── Dark Mode ──────────────────────────────────
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode')
        return savedMode ? JSON.parse(savedMode) : false
    })

    const toggleDarkMode = () => {
        setDarkMode(prevMode => {
            const newMode = !prevMode
            localStorage.setItem('darkMode', JSON.stringify(newMode))
            return newMode
        })
    }
    
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode')
        } else {
            document.documentElement.classList.remove('dark-mode')
        }
    }, [darkMode])

    // ── Shared Address State ────────────────────────
    // Centralized so Cart and MyOrders always see the same list
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)

    const fetchAddresses = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { data } = await axios.get('/api/address/get', {
                params: { userId }
            });
            if (data.success) {
                setAddresses(data.addresses);
                // Auto-select first address only if nothing selected yet
                setSelectedAddress(prev => {
                    if (prev) return prev; // keep current selection
                    return data.addresses.length > 0 ? data.addresses[0] : null;
                });
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    }, []);

    // Re-fetch when user changes
    useEffect(() => {
        if (user?._id) {
            fetchAddresses(user._id);
        } else {
            setAddresses([]);
            setSelectedAddress(null);
        }
    }, [user]);

    // ── Shared Coupon State ────────────────────────
    // Persisted to sessionStorage so it survives page reloads within the session
    const [appliedCoupon, setAppliedCouponState] = useState(() => {
        try {
            const saved = sessionStorage.getItem('appliedCoupon');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [discountAmount, setDiscountAmountState] = useState(() => {
        try {
            const saved = sessionStorage.getItem('discountAmount');
            return saved ? Number(saved) : 0;
        } catch { return 0; }
    });

    const setAppliedCoupon = (coupon) => {
        setAppliedCouponState(coupon);
        if (coupon) {
            sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        } else {
            sessionStorage.removeItem('appliedCoupon');
        }
    };

    const setDiscountAmount = (amount) => {
        setDiscountAmountState(amount);
        if (amount > 0) {
            sessionStorage.setItem('discountAmount', String(amount));
        } else {
            sessionStorage.removeItem('discountAmount');
        }
    };

    const clearCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
    };

    // Clear coupon only when the cart becomes empty AFTER initial load.
    // On mount, cartItems starts as {} before fetchUser resolves — without this guard
    // clearCoupon() would fire immediately on every page reload and wipe sessionStorage.
    const cartLoadedRef = useRef(false);
    useEffect(() => {
        if (!cartLoadedRef.current) {
            // First run: cart hasn't loaded from server yet, skip.
            if (Object.keys(cartItems).length === 0) return;
            // Cart has items — mark as loaded so future empty-checks are real.
            cartLoadedRef.current = true;
            return;
        }
        // Subsequent runs: user genuinely emptied the cart.
        if (Object.keys(cartItems).length === 0) {
            clearCoupon();
        }
    }, [cartItems]);

    // ── Seller Auth ────────────────────────────────
    const fetchSeller = async ()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth')
            if (data.success){
                setIsSeller(true)
                if (data.seller) {
                    setSellerInfo(data.seller)
                } else if (data.isAdmin) {
                    setSellerInfo({ name: "Admin" })
                }
            }else{
                setIsSeller(false)
                setSellerInfo(null)
            }
        } catch (error) {
            setIsSeller(false)
            setSellerInfo(null)
        }
    } 

    // ── User Auth ──────────────────────────────────
    const fetchUser = async ()=>{
        try {
            const {data}= await axios.get('/api/user/is-auth',{
                withCredentials: true,
            })
            if (data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }
        } catch (error) {
            setUser(null)
        }
    }

    // ── Products ───────────────────────────────────
    const fetchProducts = async()=>{
        try {
            const {data} = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }   

    // ── Cart Actions ───────────────────────────────
    const addToCart = (itemId, quantity = 1)=>{
        setCartItems(prev => {
            let cartData = structuredClone(prev);
            if (cartData[itemId]){
                cartData[itemId] += quantity;
            }else{
                cartData[itemId] = quantity
            }
            return cartData;
        });
        toast.success(`Added ${quantity > 1 ? quantity + " items" : "item"} to Cart`)
    }

    const updateCartItem = (itemId,quantity)=>{
        setCartItems(prev => {
            let cartData = structuredClone(prev);
            if (quantity <= 0) {
                delete cartData[itemId];
                toast.success("Removed from Cart");
            } else {
                cartData[itemId] = quantity;
                toast.success("Cart Updated");
            }
            return cartData;
        });
    }

    const removeFromCart = (itemId) =>{
        setCartItems(prev => {
            let cartData = structuredClone(prev)
            if(cartData[itemId]){
                cartData[itemId] -= 1;
                if(cartData[itemId] === 0){
                    delete cartData[itemId]
                }
            }
            return cartData;
        });
        toast.success("Remove from Cart")
    }

    // ── Wishlist ───────────────────────────────────
    const toggleWishlist = (itemId) => {
        setWishlistItems(prev => {
            let newList;
            if (prev.includes(itemId)) {
                newList = prev.filter(id => id !== itemId)
                toast.success("Removed from Wishlist")
            } else {
                newList = [...prev, itemId]
                toast.success("Added to Wishlist", { icon: '❤️' })
            }
            localStorage.setItem('wishlist', JSON.stringify(newList))
            return newList;
        })
    }

    // ── Cart Calculations ──────────────────────────
    const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        };
        return totalCount;
    }

    const getCartAmount = () =>{
        let totalAmount = 0;
        for (const item in cartItems){
            let itemInfo = products.find((product)=> product._id === item)
            if(itemInfo && cartItems[item] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[item]
            } 
        }
        return Math.floor(totalAmount * 100) /100;
    }

    // ── Init ───────────────────────────────────────
    useEffect(()=>{
        fetchUser()
        fetchSeller();
        fetchProducts()
    },[]);

    // ── Sync cart to DB (debounced) ────────────────
    useEffect(()=>{
        if (!user) return;
        const timeout = setTimeout(() => {
            const updateCart = async () => {
                try {
                    await axios.post('/api/cart/update', { userId: user._id, cartItems });
                } catch (error) {
                    console.error('Failed to update cart:', error);
                }
            };
            updateCart();
        }, 500);
        return () => clearTimeout(timeout);
    },[cartItems])
 
    const value = {
        navigate, 
        user, 
        setUser,
        isSeller,
        setIsSeller,
        isChatbotOpen,
        setIsChatbotOpen,
        sellerInfo,
        setSellerInfo,
        showUserLogin,
        setShowUserLogin,
        products,
        setProducts, 
        currency,
        fetchProducts, 
        fetchUser,
        addToCart, 
        updateCartItem, 
        removeFromCart,
        cartItems,
        setCartItems, 
        wishlistItems,
        toggleWishlist,
        quickViewProduct,
        setQuickViewProduct,
        searchQuery,
        setsearchQuery,
        getCartAmount,
        getCartCount, 
        axios,
        toggleDarkMode,
        darkMode,
        fetchSeller,
        // Shared address state
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        fetchAddresses,
        // Shared coupon state
        appliedCoupon,
        setAppliedCoupon,
        discountAmount,
        setDiscountAmount,
        clearCoupon,
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useAppcontext = ()=>{
    return useContext(AppContext)
}
