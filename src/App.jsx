import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import AdminDashboard from "./pages/admin/AdminDashboard";
import { ForgotPassword, Login, Profile, Register, ResetPassword } from "./pages/auth";
import ContactUs from "./pages/marketing/contactUs";
import AboutUs from "./pages/marketing/aboutUs";
import Cart from "./pages/orders/Cart";
import Checkout from "./pages/orders/Checkout";
import OrderDetails from "./pages/orders/OrderDetails";
import ProductUserDescription from "./pages/products/ProductUserDescription";
import ProductUserItem from "./pages/products/ProductUserItem";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import TopNav from "./components/Navigation/TopNav";

function App() {
  return (
    <Router>
      <TopNav />

      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* Product routes */}
          <Route path="/products" element={<ProductUserItem />} />
          <Route path="/products/:id" element={<ProductUserDescription />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles="shop_owner"> <AdminDashboard /> </ProtectedRoute>} />

          {/* Cart / Order flow */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute> <Checkout /> </ProtectedRoute>} />
          <Route path="/order-details" element={<OrderDetails />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route path="/account" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />

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