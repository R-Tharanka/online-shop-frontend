import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

import AboutUs from './pages/marketing/AboutUs';

import Cart from './pages/orders/Cart';
import Checkout from './pages/orders/Checkout';
import OrderDetails from './pages/orders/OrderDetails';
import ContactUs from './pages/marketing/contactUs';

import AdminDashboard from './pages/admin/AdminDashboard';
import ProductUserItem from './pages/products/ProductUserItem';
import ProductUserDescription from './pages/products/ProductUserDescription';
import { Login, Register, ForgotPassword, ResetPassword, Profile } from './pages/auth';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import TopNav from './Components/Navigation/TopNav';

function App() {
  return (
    <Router>
      <TopNav />

      <main className="min-h-screen bg-gray-50">
        <Routes>

          <Route path="/" element={<ProductUserItem />} />

          {/* Product routes */}
          <Route path="/products" element={<ProductUserItem />} />
          <Route path="/products/:id" element={<ProductUserDescription />} />

          {/* Admin */}
          <Route path="/admin" element={ <ProtectedRoute roles="shop_owner"> <AdminDashboard /> </ProtectedRoute> } />

          {/* Cart / Order flow */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={ <ProtectedRoute> <Checkout /> </ProtectedRoute> } />
          <Route path="/order-details" element={ <ProtectedRoute> <OrderDetails /> </ProtectedRoute> } />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route path="/account" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />

          {/* Marketing */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/products" replace />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;