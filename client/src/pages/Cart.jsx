import { useEffect, useState } from "react"
import { useAppcontext } from "../context/AppContext"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ArrowLeft, MapPin, CreditCard, MapPinPlus, BadgePercent, ShoppingBag } from "lucide-react"

const Cart = () => {
    const {
        products, user, currency, setCartItems, cartItems, axios,
        removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount,
        // Shared address state from context
        addresses, selectedAddress, setSelectedAddress, fetchAddresses,
        // Shared coupon state from context
        appliedCoupon, setAppliedCoupon, discountAmount, setDiscountAmount, clearCoupon,
    } = useAppcontext()

    const [cartArray, setCartArray] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [paymentOption, setPaymentOption] = useState("COD")
    const [promoCode, setPromoCode] = useState(appliedCoupon?.code || "")
    const [isApplying, setIsApplying] = useState(false)

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key)
            if (product) {
                const productCopy = { ...product, quantity: cartItems[key] };
                tempArray.push(productCopy);
            }
        }
        setCartArray(tempArray)
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart()
        }
    }, [products, cartItems])

    // Re-fetch addresses when user lands on cart (in case they just added one on MyOrders)
    useEffect(() => {
        if (user?._id) {
            fetchAddresses(user._id);
        }
    }, [user])

    // Handle Stripe canceled payment
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('canceled') === 'true') {
            localStorage.removeItem('pendingOrderId');
            toast.error("Payment was canceled. Your cart is still saved.");
            navigate('/cart', { replace: true });
        }
    }, []);

    // Re-calculate discount when cart amount changes
    // IMPORTANT: Only run after products have loaded — on page reload products.length is 0
    // so cartAmount is 0 which would falsely trigger the minimum purchase check.
    const cartAmount = getCartAmount();
    useEffect(() => {
        if (!appliedCoupon) return;
        if (products.length === 0) return; // products not loaded yet — don't touch the coupon

        if (cartAmount < appliedCoupon.minPurchaseAmount) {
            clearCoupon();
            setPromoCode("");
            toast.error(`Coupon removed: minimum purchase is ${currency}${appliedCoupon.minPurchaseAmount}`);
        } else {
            const discount = appliedCoupon.discountType === 'percentage'
                ? (cartAmount * appliedCoupon.discountValue) / 100
                : appliedCoupon.discountValue;
            setDiscountAmount(Math.min(discount, cartAmount));
        }
    }, [cartAmount, appliedCoupon, products.length]);

    const applyPromoCode = async () => {
        if (!promoCode) return toast.error("Please enter a promo code");
        setIsApplying(true);
        try {
            const { data } = await axios.post('/api/coupon/validate', { code: promoCode, cartTotal: cartAmount });
            if (data.success) {
                setAppliedCoupon(data.coupon);
                setDiscountAmount(data.discountAmount);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Failed to apply promo code");
        } finally {
            setIsApplying(false);
        }
    }

    const removePromoCode = () => {
        clearCoupon();
        setPromoCode("");
        toast.success("Promo code removed");
    }

    const subTotalAfterDiscount = Math.max(0, cartAmount - discountAmount);
    const taxAmount = Math.floor((subTotalAfterDiscount * 0.02) * 100) / 100;
    const totalAmount = Math.floor((subTotalAfterDiscount + taxAmount) * 100) / 100;

    const cartCount = getCartCount();

    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Please select a delivery address");
            }

            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id,
                    couponCode: appliedCoupon?.code
                });
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    clearCoupon();
                    navigate('/my-orders');
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post('/api/order/stripe', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id,
                    couponCode: appliedCoupon?.code
                });
                if (data.success) {
                    localStorage.setItem('pendingOrderId', data.orderId);
                    window.location.replace(data.url);
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return products.length > 0 && cartItems ? (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row gap-10 mt-12 items-start"
        >
            {/* Products Column */}
            <div className='flex-1 w-full'>
                <div className="flex items-baseline gap-3 mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                        Shopping Cart
                    </h1>
                    <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                        {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                {cartArray.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-[3fr_1fr_1fr] text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800/80 px-2">
                            <p className="text-left">Product Details</p>
                            <p className="text-center">Subtotal</p>
                            <p className="text-center">Remove</p>
                        </div>

                        {/* Cart Items */}
                        <div className="flex flex-col gap-4">
                            <AnimatePresence initial={false}>
                                {cartArray.map((product) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                        key={product._id}
                                        className="grid grid-cols-[3fr_1fr_1fr] items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0 select-none p-2"
                                            >
                                                <img className="max-h-full object-contain w-auto" src={product.image[0]} alt={product.name} />
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <p
                                                    onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                    className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base truncate cursor-pointer hover:text-emerald-500 transition-colors"
                                                >
                                                    {product.name}
                                                </p>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                                    <p>Weight: <span className="text-slate-600 dark:text-slate-300 font-bold">{product.weight || "N/A"}</span></p>
                                                    <div className='flex items-center gap-1'>
                                                        <span>Qty:</span>
                                                        <select
                                                            onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                                            value={cartItems[product._id]}
                                                            className='outline-none font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded px-1.5 py-0.5'
                                                        >
                                                            {Array.from({ length: Math.max(cartItems[product._id], 9) }, (_, i) => (
                                                                <option key={i} value={i + 1}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-center font-extrabold text-sm md:text-base text-slate-700 dark:text-slate-200">
                                            {currency}{(product.offerPrice * product.quantity).toFixed(2)}
                                        </p>

                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeFromCart(product._id)}
                                                className="cursor-pointer text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
                        <ShoppingBag className="w-12 h-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Your cart is empty</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                            Looks like you haven't added any products to your cart yet. Let's find some fresh organic groceries!
                        </p>
                    </div>
                )}

                <motion.button
                    whileHover={{ x: -3 }}
                    onClick={() => { navigate("/products"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-2 mt-8 text-emerald-500 dark:text-emerald-400 font-bold text-sm cursor-pointer hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continue Shopping</span>
                </motion.button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24 w-full lg:max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-premium">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Order Summary
                </h2>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

                {/* Delivery Address */}
                <div className="mb-6 flex flex-col gap-1.5 relative">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Delivery Address
                    </span>
                    <div className="flex justify-between items-start gap-4 mt-1">
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {selectedAddress ? (
                                <p className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                                    {`${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipcode}, ${selectedAddress.country}`}
                                </p>
                            ) : (
                                <p className="text-xs font-semibold text-slate-500 italic">No delivery address selected</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAddress(!showAddress)}
                            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors shrink-0 underline cursor-pointer"
                        >
                            Change
                        </button>
                    </div>

                    <AnimatePresence>
                        {showAddress && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden text-xs max-h-56 overflow-y-auto"
                            >
                                {addresses.length > 0 ? (
                                    addresses.map((address, index) => (
                                        <button
                                            key={address._id || index}
                                            onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 transition-colors"
                                        >
                                            {`${address.street}, ${address.city}, ${address.state}, ${address.zipcode}, ${address.country}`}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-slate-400 p-3 italic">No addresses found</p>
                                )}
                                <button
                                    onClick={() => { navigate("/add-address"); setShowAddress(false); }}
                                    className="w-full flex items-center justify-center gap-1.5 p-3 text-emerald-500 font-bold hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center"
                                >
                                    <MapPinPlus className="w-3.5 h-3.5" />
                                    <span>Add New Address</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Payment Option */}
                <div className="mb-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Payment Method
                    </span>
                    <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
                        <button
                            onClick={() => setPaymentOption("COD")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${paymentOption === "COD"
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                            }`}
                        >
                            <BadgePercent className="w-4 h-4 shrink-0" />
                            <span>COD</span>
                        </button>
                        <button
                            onClick={() => setPaymentOption("Online")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${paymentOption === "Online"
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                            }`}
                        >
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <span>Stripe</span>
                        </button>
                    </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

                {/* Promo Code */}
                <div className="mb-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Promo Code
                    </span>

                    {!appliedCoupon ? (
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                                placeholder="Enter code"
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button
                                onClick={applyPromoCode}
                                disabled={isApplying || !promoCode}
                                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isApplying ? '...' : 'Apply'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3 mt-1">
                            <div className="flex items-center gap-2">
                                <BadgePercent className="w-4 h-4 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{appliedCoupon.code}</p>
                                    <p className="text-xs text-emerald-500/80">Applied successfully ✓</p>
                                </div>
                            </div>
                            <button
                                onClick={removePromoCode}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

                {/* Price Breakdown */}
                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-3 font-semibold">
                    <div className="flex justify-between">
                        <span>Items Price</span>
                        <span className="text-slate-800 dark:text-slate-200">{currency}{cartAmount.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex justify-between text-emerald-500"
                        >
                            <span>Discount ({appliedCoupon?.code})</span>
                            <span className="font-bold">-{currency}{discountAmount.toFixed(2)}</span>
                        </motion.div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-extrabold uppercase text-xs">Free</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (2%)</span>
                        <span className="text-slate-800 dark:text-slate-200">{currency}{taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                    <div className="flex justify-between text-base font-extrabold text-slate-800 dark:text-slate-100 pt-1">
                        <span>Total Amount</span>
                        <span className="text-emerald-500 dark:text-emerald-400 text-lg">{currency}{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={placeOrder}
                    className="w-full py-3.5 mt-6 font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 shadow-md cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                    {paymentOption === "Online" ? <CreditCard className="w-4 h-4" /> : null}
                    <span>{paymentOption === "COD" ? "Place Order (COD)" : "Proceed to Stripe"}</span>
                </motion.button>
            </div>
        </motion.div>
    ) : null
}

export default Cart
