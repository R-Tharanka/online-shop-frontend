import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../components/Auth/AuthProvider";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join the Veloura membership community."
      footer={
        <>
          Already a member?{" "}
          <Link className="text-[#5f44ff] font-medium" to="/auth/login">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Full name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />
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
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
        />
        <AuthField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
