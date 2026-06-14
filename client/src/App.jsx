import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import { useAppcontext } from './context/AppContext.jsx'

// ── Common (shared) ───────────────────────────────
import Loading               from './components/common/Loading.jsx'
import CustomCursor          from './components/common/CustomCursor.jsx'
import InteractiveBackground from './components/common/InteractiveBackground.jsx'

// ── User components ───────────────────────────────
import Navbar         from './components/user/Navbar.jsx'
import Footer         from './components/user/Footer.jsx'
import Login          from './components/user/Login.jsx'
import QuickViewModal from './components/user/QuickViewModal.jsx'
import Chatbot        from './components/user/Chatbot.jsx'

// ── User pages ────────────────────────────────────
import Home            from './pages/user/Home.jsx'
import AllProducts     from './pages/user/AllProducts.jsx'
import ProductCategory from './pages/user/ProductCategory.jsx'
import ProductDetails  from './pages/user/ProductDetails.jsx'
import Cart            from './pages/user/Cart.jsx'
import Wishlist        from './pages/user/Wishlist.jsx'
import AddAddress      from './pages/user/AddAddress.jsx'
import MyOrders        from './pages/user/MyOrders.jsx'

// ── Seller components ─────────────────────────────
import SellerLogin    from './components/seller/SellerLogin.jsx'
import SellerRegister from './components/seller/SellerRegister.jsx'

// ── Seller pages ──────────────────────────────────
import SellerLayout   from './pages/seller/SellerLayout.jsx'
import DashboardHome  from './pages/seller/DashboardHome.jsx'
import AddProduct     from './pages/seller/AddProduct.jsx'
import ProductList    from './pages/seller/ProductList.jsx'
import Orders         from './pages/seller/Orders.jsx'
import Coupons        from './pages/seller/Coupons.jsx'

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller, darkMode } = useAppcontext()

  return (
    <div className={`text-default min-h-screen text-gray-700 ${darkMode ? 'dark-mode' : ''} bg-transparent`}>
      <InteractiveBackground />
      <CustomCursor />
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}
      <QuickViewModal />
      {isSellerPath ? null : <Chatbot />}

      <Toaster />
      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* ── User Routes ── */}
          <Route path='/'                            element={<Home />} />
          <Route path='/products'                    element={<AllProducts />} />
          <Route path='/products/:category'          element={<ProductCategory />} />
          <Route path='/products/:category/:id'      element={<ProductDetails />} />
          <Route path='/cart'                        element={<Cart />} />
          <Route path='/wishlist'                    element={<Wishlist />} />
          <Route path='/add-address'                 element={<AddAddress />} />
          <Route path='/my-orders'                   element={<MyOrders />} />
          <Route path='/loader'                      element={<Loading />} />

          {/* ── Seller Routes ── */}
          <Route path='/seller/register'             element={<SellerRegister />} />
          <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index                             element={isSeller ? <DashboardHome /> : null} />
            <Route path='add-product'               element={<AddProduct />} />
            <Route path='product-list'              element={<ProductList />} />
            <Route path='orders'                    element={<Orders />} />
            <Route path='coupons'                   element={<Coupons />} />
          </Route>
        </Routes>
      </div>
      {isSellerPath ? null : <Footer />}
    </div>
  )
}

export default App