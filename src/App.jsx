import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';

import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';

import ProductServiceAdmin from './pages/ProductServiceAdmin';
import ProductUserItem from './pages/ProductUserItem';
import ProductUserDescription from './pages/ProductUserDescription';

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
          </nav>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <Routes>

          {/* Product routes */}
          <Route path="/products" element={<ProductUserItem />} />
          <Route path="/products/:id" element={<ProductUserDescription />} />

          {/* Admin */}
          <Route path="/admin" element={<ProductServiceAdmin />} />

          {/* Cart / Order flow */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-details" element={<OrderDetails />} />

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