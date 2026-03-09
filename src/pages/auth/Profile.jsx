import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Components/Auth/AuthProvider";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_15%_10%,rgba(255,244,217,0.65),transparent_50%),radial-gradient(circle_at_85%_20%,rgba(220,230,255,0.7),transparent_55%),linear-gradient(120deg,#f9f7f4_0%,#f2f6ff_55%,#f8f1ff_100%)]">
        <div className="text-sm text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(255,244,217,0.65),transparent_50%),radial-gradient(circle_at_85%_20%,rgba(220,230,255,0.7),transparent_55%),linear-gradient(120deg,#f9f7f4_0%,#f2f6ff_55%,#f8f1ff_100%)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-white/60 shadow-[0_30px_80px_rgba(26,0,46,0.14)] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-[#1f1b2e] text-white flex items-center justify-center text-2xl font-semibold">
                {user.name?.slice(0, 1)?.toUpperCase() || "V"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-gray-400">User Dashboard</p>
                <h2 className="text-3xl font-semibold text-[#1f1b2e] mt-2">{user.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="px-4 py-2 rounded-xl bg-[#1f1b2e] text-white text-sm font-semibold hover:bg-[#2c2740] transition"
              >
                Browse products
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Status</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1b2e]">Active</p>
              <p className="text-xs text-gray-500 mt-1">Account ready for checkout</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Roles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.roles || ["customer"]).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full text-xs bg-[#f3f0ff] text-[#1f1b2e] border border-[#e2dbff]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Orders</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1b2e]">Track</p>
              <Link className="text-xs text-[#5f44ff] mt-2 inline-block" to="/order-details">
                View order details
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Wishlist</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1b2e]">Coming soon</p>
              <p className="text-xs text-gray-500 mt-1">Save your favorites</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1f1b2e]">Quick actions</h3>
              <p className="text-sm text-gray-500 mt-1">Pick up where you left off.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/contact"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#cfc2ff] hover:text-[#1f1b2e]"
                >
                  Send a message
                </Link>
                <Link
                  to="/cart"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#cfc2ff] hover:text-[#1f1b2e]"
                >
                  Review your cart
                </Link>
                <Link
                  to="/checkout"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#cfc2ff] hover:text-[#1f1b2e]"
                >
                  Go to checkout
                </Link>
                <Link
                  to="/order-details"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#cfc2ff] hover:text-[#1f1b2e]"
                >
                  Track an order
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1f1b2e]">Style insights</h3>
              <p className="text-sm text-gray-500 mt-1">Tailored recommendations are on the way.</p>
              <div className="mt-5 space-y-3">
                {[
                  "Complete your profile to unlock curated looks",
                  "Follow drops to get early access",
                  "Enable order updates for real-time shipping alerts",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#5f44ff]" />
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#5f44ff] hover:text-[#1f1b2e]"
              >
                Contact support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
