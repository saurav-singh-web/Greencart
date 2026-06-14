import React from 'react'
import Navbar from "./components/Navbar.jsx"
import Home from './pages/Home.jsx'
import { Route, Routes, useLocation } from 'react-router-dom'
import {Toaster} from "react-hot-toast"
import Footer from './components/Footer.jsx'
import { useAppcontext } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import AllProducts from './pages/AllProducts.jsx'
import ProductCategory from './pages/ProductCategory.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import AddAddress from './pages/AddAddress.jsx'
import MyOrders from './pages/MyOrders.jsx'
import SellerLogin from './components/seller/SellerLogin.jsx'
import SellerRegister from './components/seller/SellerRegister.jsx'
import SellerLayout from './pages/seller/SellerLayout.jsx'
import DashboardHome from './pages/seller/DashboardHome.jsx'
import AddProduct from './pages/seller/AddProduct.jsx'
import ProductList from './pages/seller/ProductList.jsx'
import Orders from './pages/seller/Orders.jsx'
import Coupons from './pages/seller/Coupons.jsx'
import Loading from './components/Loading.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import InteractiveBackground from './components/InteractiveBackground.jsx'
import QuickViewModal from './components/QuickViewModal.jsx'

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller, darkMode} = useAppcontext()
  
  return (
    <div className={`text-default min-h-screen text-gray-700 ${darkMode ? 'dark-mode' : ''} bg-transparent`}>
      <InteractiveBackground />
      <CustomCursor />
      {isSellerPath? null : <Navbar/>}
      {showUserLogin ? <Login /> : null}
      <QuickViewModal />

      <Toaster />
      <div className={`${isSellerPath? "": "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/products' element={<AllProducts />}/> 
          <Route path='/products/:category' element={<ProductCategory />}/> 
          <Route path='/products/:category/:id' element={<ProductDetails />}/> 
          <Route path='/cart' element={<Cart />}/> 
          <Route path='/wishlist' element={<Wishlist />}/> 
          <Route path='/add-address' element={<AddAddress />}/> 
          <Route path='/my-orders' element={<MyOrders />}/> 
          <Route path='/loader' element={<Loading />}/> 
          <Route path='/seller/register' element={<SellerRegister />} />
          <Route path='/seller'element={isSeller ? <SellerLayout /> : <SellerLogin />} >
           <Route index element={isSeller ? <DashboardHome /> : null}/>
           <Route path='add-product' element={<AddProduct />}/>
           <Route path='product-list' element={<ProductList />}/>
           <Route path='orders' element={<Orders />}/>
           <Route path='coupons' element={<Coupons />}/>
          </Route>
        </Routes>
      </div>
      {isSellerPath? null : <Footer/>}
    </div>
  )
}

export default App