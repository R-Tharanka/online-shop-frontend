import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent ${
        active
          ? "bg-[#1f1b2e] text-white border-[color:var(--color-secondary)]"
          : "text-gray-600 hover:text-[#1f1b2e] hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TopNav() {
  const { isAuthenticated, logout, hasRole, user } = useAuth();
  const canAccessAdmin = hasRole("shop_owner");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavClick = () => {
    if (menuOpen) setMenuOpen(false);
    if (profileOpen) setProfileOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-semibold text-[#1f1b2e] tracking-tight flex items-center gap-2"
        >
          Veloura
          <span
            className="inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-secondary)" }}
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex flex-wrap items-center gap-2">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/checkout">Checkout</NavLink>
            <NavLink to="/order-details">Orders</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {canAccessAdmin ? <NavLink to="/admin">Admin</NavLink> : null}

            {isAuthenticated ? (
              <div className={`relative ${canAccessAdmin ? "ml-2" : ""}`}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="h-9 w-9 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#1f1b2e] hover:bg-gray-50"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-100 bg-white shadow-lg py-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <NavLink to="/account">Account</NavLink>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <NavLink to="/auth/login">Sign in</NavLink>
                <NavLink to="/auth/register">Join</NavLink>
              </>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="md:hidden border-t border-gray-100 bg-white/95">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-2">
            <div onClick={handleNavClick}><NavLink to="/products">Products</NavLink></div>
            <div onClick={handleNavClick}><NavLink to="/cart">Cart</NavLink></div>
            <div onClick={handleNavClick}><NavLink to="/checkout">Checkout</NavLink></div>
            <div onClick={handleNavClick}><NavLink to="/order-details">Orders</NavLink></div>
            <div onClick={handleNavClick}><NavLink to="/contact">Contact</NavLink></div>
            {canAccessAdmin ? (
              <div onClick={handleNavClick}><NavLink to="/admin">Admin</NavLink></div>
            ) : null}

            {isAuthenticated ? (
              <>
                <div onClick={handleNavClick}><NavLink to="/account">Account</NavLink></div>
                <button
                  onClick={() => {
                    handleNavClick();
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div onClick={handleNavClick}><NavLink to="/auth/login">Sign in</NavLink></div>
                <div onClick={handleNavClick}><NavLink to="/auth/register">Join</NavLink></div>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
