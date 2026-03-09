import React from "react";

export default function AuthField({ label, error, ...inputProps }) {
  return (
    <label className="block text-sm text-gray-700">
      <span className="font-medium">{label}</span>
      <input
        {...inputProps}
        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff] ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      />
      {error ? <span className="text-xs text-red-500 mt-1 block">{error}</span> : null}
    </label>
  );
}
