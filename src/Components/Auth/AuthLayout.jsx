import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div
      className="min-h-screen flex items-stretch"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(255, 244, 217, 0.65), transparent 50%), radial-gradient(circle at 85% 20%, rgba(220, 230, 255, 0.7), transparent 55%), linear-gradient(120deg, #f9f7f4 0%, #f2f6ff 55%, #f8f1ff 100%)",
      }}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;700&display=swap");
        .auth-shadow { box-shadow: 0 30px 80px rgba(26, 0, 46, 0.14); }
        .auth-grid {
          background-image: radial-gradient(#e5d7ff 0.8px, transparent 0.8px);
          background-size: 14px 14px;
          opacity: 0.45;
        }
      `}</style>

      <aside className="hidden lg:flex w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 auth-grid" />
        <div className="relative z-10 flex flex-col justify-between p-14 text-[#1f1b2e]">
          <Link
            to="/"
            className="text-2xl font-semibold tracking-[0.15em] uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Veloura
          </Link>
          <div>
            <p
              className="text-4xl leading-tight font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Curated looks. Crafted confidence.
            </p>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Sign in to manage your orders, wishlist, and exclusive collections curated
              for your wardrobe.
            </p>
            <div className="mt-8 flex gap-3">
              {[
                "Secure checkout",
                "Order tracking",
                "Member perks",
              ].map((item) => (
                <span
                  key={item}
                  className="text-xs uppercase tracking-[0.2em] bg-white/70 px-3 py-2 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">Veloura Fashion Collective</p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white/90 auth-shadow rounded-[28px] p-8 sm:p-10">
          <div className="mb-6">
            <h1
              className="text-3xl text-[#1f1b2e]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {subtitle}
            </p>
          </div>

          <div style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
