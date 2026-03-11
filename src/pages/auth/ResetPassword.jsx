import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../components/Auth/AuthProvider";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const data = await resetPassword({ email, token, newPassword });
      setMessage(data?.message || "Password updated. You can sign in now.");
    } catch (err) {
      setError(err?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Paste the reset token from your email."
      footer={
        <>
          Need a reset email?{" "}
          <Link className="text-[#5f44ff] font-medium" to="/auth/forgot">
            Request one
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
          label="Reset token"
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste token"
          required
        />
        <AuthField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Enter new password"
          autoComplete="new-password"
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
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-gray-500">
        <Link className="hover:text-[#1f1b2e]" to="/auth/login">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
