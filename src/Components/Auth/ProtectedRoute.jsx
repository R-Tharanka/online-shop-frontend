import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function AccessDenied() {
  return (
    <div className="max-w-xl mx-auto mt-16 bg-white border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
      <p className="text-3xl">🔒</p>
      <h2 className="text-xl font-semibold text-gray-800 mt-4">Access denied</h2>
      <p className="text-gray-500 text-sm mt-2">
        You do not have permission to view this page.
      </p>
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const { authReady, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    return <AccessDenied />;
  }

  return children;
}
