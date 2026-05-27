import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios';


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user,setUser]= useState(null)
    const [isSeller,setIsSeller]= useState(false)
    const [sellerInfo, setSellerInfo] = useState(null) // Add state for seller info
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products,setProducts]= useState([])
    const [cartItems,setCartItems]= useState({})
    const [searchQuery,setsearchQuery]= useState({})
    
    // Initialize dark mode from localStorage or default to false
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode')
        return savedMode ? JSON.parse(savedMode) : false
    })

    // Toggle dark mode function with localStorage persistence
    const toggleDarkMode = () => {
        setDarkMode(prevMode => {
            const newMode = !prevMode
            localStorage.setItem('darkMode', JSON.stringify(newMode))
            return newMode
        })
    }
    
    // Apply dark mode class based on stored preference on initial load
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode')
        } else {
            document.documentElement.classList.remove('dark-mode')
        }
    }, [darkMode])

    const fetchSeller = async ()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth')

            if (data.success){
                setIsSeller(true)
                // Store seller info if available
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

    // Fetch Uesr auth status, user data and cart items
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
    //fetch all product
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

     //Add product to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]){
            cartData[itemId] += 1;

        }else{
            cartData[itemId] = 1
        }
        setCartItems(cartData);
        toast.success("Added to Cart")
    }

     // update cart item quantity

    const updateCartItem = (itemId,quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    // remove product from cart

    const removeFromCart = (itemId) =>{
        let cartData = structuredClone(cartItems)
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId]
            }
        }
        toast.success("Remove from Cart")
        setCartItems (cartData)

    }

    // get cart item count

     const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        };
        return totalCount;
     }

     // get cart total amount

     const getCartAmount = () =>{
        let totalAmount = 0;
        for (const item in cartItems){
            let itemInfo = products.find((product)=> product._id === item)
            if(cartItems[item]>0){
                totalAmount += itemInfo.offerPrice * cartItems[item]
            } 
        }
        return Math.floor(totalAmount * 100) /100;
     }

    useEffect(()=>{
        fetchUser()
        fetchSeller();
        fetchProducts()
    },[]);

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
        searchQuery,
        setsearchQuery,
        getCartAmount,
        getCartCount, 
        axios,
        toggleDarkMode,
        darkMode,
        fetchSeller
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useAppcontext = ()=>{
    return useContext(AppContext)
}
