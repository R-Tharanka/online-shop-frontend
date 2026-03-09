import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
import { useAuth } from './Components/Auth/AuthProvider';

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-700 text-white'
          : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Router>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-purple-700 tracking-tight">
            Veloura
          </Link>

          <nav className="flex gap-2">
            <NavLink to="/products">🛍 Products</NavLink>
            <NavLink to="/cart">🛒 Cart</NavLink>
            <NavLink to="/checkout">💳 Checkout</NavLink>
            <NavLink to="/order-details">📦 Orders</NavLink>
            <NavLink to="/admin">⚙️ Admin</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/account">👤 Account</NavLink>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/auth/login">Sign in</NavLink>
                <NavLink to="/auth/register">Join</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

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
          <Route
            path="/order-details"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
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