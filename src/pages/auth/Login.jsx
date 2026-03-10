import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../Components/Auth/AuthLayout";
import AuthField from "../../Components/Auth/AuthField";
import { useAuth } from "../../Components/Auth/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/account";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      const roles = Array.isArray(user?.roles) ? user.roles : [];
      const isAdmin = roles.includes("shop_owner");
      navigate(isAdmin ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your Veloura account."
      footer={
        <>
          New to Veloura?{" "}
          <Link className="text-[#5f44ff] font-medium" to="/auth/register">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@veloura.com"
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#1f1b2e] text-white py-3 text-sm font-semibold hover:bg-[#2c2740] transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <Link className="hover:text-[#1f1b2e]" to="/auth/forgot">
          Forgot password?
        </Link>
        <span className="text-gray-400">Secure access</span>
      </div>
    </AuthLayout>
  );
}
