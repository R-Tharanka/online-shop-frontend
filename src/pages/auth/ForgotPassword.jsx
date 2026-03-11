import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../Components/Auth/AuthLayout";
import AuthField from "../../Components/Auth/AuthField";
import { useAuth } from "../../Components/Auth/AuthProvider";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setMessage(data?.message || "Password reset email sent.");
    } catch (err) {
      setError(err?.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset access"
      subtitle="We will send reset instructions to your email."
      footer={
        <>
          Remembered your password?{" "}
          <Link className="text-[#5f44ff] font-medium" to="/auth/login">
            Back to sign in
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

        {message ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3">
            {message}
          </div>
        ) : null}
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
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
