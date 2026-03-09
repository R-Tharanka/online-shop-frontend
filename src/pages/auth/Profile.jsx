import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Components/Auth/AuthProvider";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Account</p>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(user.roles || ["customer"]).map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200 text-gray-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Next steps</p>
            <div className="mt-3 text-sm text-gray-700 space-y-2">
              <Link className="block hover:text-[#1f1b2e]" to="/order-details">
                View your orders
              </Link>
              <Link className="block hover:text-[#1f1b2e]" to="/products">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
