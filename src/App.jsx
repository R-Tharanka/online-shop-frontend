import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

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

          {/* Product routes */}
          <Route path="/products" element={<ProductUserItem />} />
          <Route path="/products/:id" element={<ProductUserDescription />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles="shop_owner">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Cart / Order flow */}
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Home */}
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <h1 className="text-5xl font-bold text-purple-700 mb-4">
                  Welcome to Veloura
                </h1>
                <p className="text-gray-500 text-lg mb-8">
                  Your premium online shopping experience
                </p>

                <Link
                  to="/products"
                  className="px-8 py-3 bg-purple-700 text-white rounded-xl text-lg font-semibold hover:bg-purple-800 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/products" replace />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;