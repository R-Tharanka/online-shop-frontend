import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#1f1b2e] text-white"
          : "text-gray-600 hover:text-[#1f1b2e] hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TopNav() {
  const { isAuthenticated, logout, hasRole } = useAuth();
  const canAccessAdmin = hasRole("shop_owner");

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-semibold text-[#1f1b2e] tracking-tight"
        >
          Veloura
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          <NavLink to="/order-details">Orders</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {canAccessAdmin ? <NavLink to="/admin">Admin</NavLink> : null}

          {isAuthenticated ? (
            <>
              <NavLink to="/account">Account</NavLink>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
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
  );
}
