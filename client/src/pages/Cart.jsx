import { useEffect, useState } from "react"
import { useAppcontext } from "../context/AppContext"
import { assets, dummyAddress } from "../assets/assets"
import toast from "react-hot-toast"

const Cart = () => {

    const {products,user, currency,setCartItems, cartItems,axios, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount} = useAppcontext()

    const [cartArray,setCartArray ] = useState([])
    const [addresses,setAddresses ] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")
    const [isHovered, setIsHovered] = useState(false);
    const [hovered, setHovered] = useState(false);


    const getCart = ()=>{
        let tempArray = []
        for (const key in cartItems){
            const product = products.find((item)=>item._id === key)
              if (product) {
            const productCopy = { ...product, quantity: cartItems[key] };
             tempArray.push(productCopy); 
        }
    }
        setCartArray(tempArray)
    }

    const getUserAddress = async () => {
        try {
            if (!user || !user._id) {
                console.log("No user found, cannot fetch addresses");
                return;
            }
            
            console.log("Fetching addresses for user:", user._id);
            const { data } = await axios.get('/api/address/get', {
                params: { userId: user._id }
            });
            
            if (data.success) {
                console.log("Addresses fetched:", data.addresses);
                setAddresses(data.addresses);
                
                // If addresses exist but none is selected, select the first one
                if (data.addresses.length > 0 && !selectedAddress) {
                    setSelectedAddress(data.addresses[0]);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error(error.message);
        }
    }

    // Call getUserAddress whenever user changes
    useEffect(() => {
        if (user && user._id) {
            console.log("User detected, fetching addresses");
            getUserAddress();
        }
    }, [user]);

    // Add this useEffect to handle address selection
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0]);
        }
    }, [addresses]);

    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Please select an address");
            }
            
            console.log("Selected address for order:", selectedAddress);
            
            // Place order with COD
            if (paymentOption === "COD") {
                console.log("Order Payload", {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id,
                });
                
                const { data } = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id
                });

                if (data.success) {
                    toast.success(data.message);
                    setCartItems({}); // Clear cart for COD orders
                    navigate('/my-orders');
                } else {
                    toast.error(data.message);
                }
            } else {
                // Place order with stripe
                const { data } = await axios.post('/api/order/stripe', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id
                });

                if (data.success) {
                    // Don't clear cart here - it will be cleared after successful payment
                    // Store the order ID in localStorage to check payment status later
                    localStorage.setItem('pendingOrderId', data.orderId);
                    window.location.replace(data.url);
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        if(products.length > 0 && cartItems){
            getCart()
        }

    },[products,cartItems])
     
    useEffect(()=>{
        if(user){
            console.log("User:", user);
            getUserAddress()
        }

    },[user])

    // Add this useEffect to handle canceled payments
    useEffect(() => {
        const checkCanceledPayment = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const canceled = urlParams.get('canceled');
            
            if (canceled === 'true') {
                // Payment was canceled, clean up the pending order
                const pendingOrderId = localStorage.getItem('pendingOrderId');
                if (pendingOrderId) {
                    try {
                        // Optionally, you can call an API to delete the pending order
                        // await axios.delete(`/api/order/${pendingOrderId}`);
                        
                        // Clear the pending order ID
                        localStorage.removeItem('pendingOrderId');
                        
                        toast.info("Payment was canceled. Your cart items are still available.");
                        
                        // Remove the canceled query parameter
                        navigate('/cart', { replace: true });
                    } catch (error) {
                        console.error("Error handling canceled payment:", error);
                    }
                }
            }
        };
        
        checkCanceledPayment();
    }, []);

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6" style={{ color: 'var(--text-color)' }}>
                    Shopping Cart <span style={{fontSize: '0.875rem', color: 'var(--color-primary)'}}>{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-base font-medium pb-3" style={{ color: 'var(--text-color)' }}>
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="cart-item grid grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium pt-3" style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border rounded" style={{ borderColor: 'var(--border-color)' }}>
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold" style={{ color: 'var(--text-color)' }}>{product.name}</p>
                                <div className="font-normal" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select 
                                            onChange={e => updateCartItem(product._id, Number(e.target.value))} 
                                            value={cartItems[product._id]} 
                                            className='outline-none'
                                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--border-color)' }}
                                        >
                                            {Array(cartItems[product._id]> 9 ? cartItems[product._id]: 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={()=>removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src= {assets.remove_icon} alt="remove" className="inline-block w-6 h-6"/>
                        </button>
                    </div>)
                )}

                <button onClick={()=>{navigate("/products"); scrollTo(0,0)}} style={{display: 'flex',alignItems: 'center',marginTop: '2rem',gap: '0.5rem',color: 'var(--color-primary)',fontWeight: 500,cursor: 'pointer'}}>
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>
            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        {selectedAddress ? (
                            <p className="text-gray-500">
                                {`${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipcode}, ${selectedAddress.country}`}
                            </p>
                        ) : (
                            <p className="text-gray-500">No address selected</p>
                        )}
                        <button 
                            onClick={() => setShowAddress(!showAddress)} 
                            style={{
                                color: 'var(--color-primary)',
                                cursor: 'pointer', 
                                textDecoration: isHovered ? 'underline' : 'none'
                            }} 
                            onMouseEnter={() => setIsHovered(true)} 
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                                {addresses.length > 0 ? (
                                    addresses.map((address, index) => (
                                        <p 
                                            key={address._id || index}   
                                            onClick={() => {
                                                setSelectedAddress(address); 
                                                setShowAddress(false);
                                            }} 
                                            className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {`${address.street}, ${address.city}, ${address.state}, ${address.zipcode}, ${address.country}`}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500 p-2">No addresses found</p>
                                )}
                                <p 
                                    onClick={() => navigate("/add-address")} 
                                    style={{
                                        color: 'var(--color-primary)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        backgroundColor: hovered ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                                    }} 
                                    onMouseEnter={() => setHovered(true)} 
                                    onMouseLeave={() => setHovered(false)}
                                >
                                    Add NEW Address
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                    <option value="COD">Cash On Delivery</option>
                    <option value="Online">Online Payment</option>
                </select>

                <hr className="border-gray-300 mt-4" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>{currency}{getCartAmount() + getCartAmount() * 2 / 100}</span>
                    </p>
                </div>

                <button onClick={placeOrder} style={{ width: '100%',paddingTop: '0.75rem',paddingBottom: '0.75rem',marginTop: '1.5rem',cursor: 'pointer',backgroundColor: 'var(--color-primary)',color: 'white',fontWeight: '500',transition: 'background-color 0.2s ease',}}>
                    {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart
