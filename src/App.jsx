import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AboutUs from './pages/aboutUs';

function HomePage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#FBFBFB] px-4 sm:px-6 lg:px-8 py-14">
      <section className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-[#E8F9FF] to-white border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">Welcome to Veloura</h1>
        <p className="mt-4 text-slate-600 max-w-2xl text-base md:text-lg">
          Discover curated essentials with premium quality, smart design, and a shopping experience made for real life.
        </p>
      </section>
    </main>
  );
}

function OrdersPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#FBFBFB] px-4 sm:px-6 lg:px-8 py-14">
      <section className="max-w-6xl mx-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Orders</h1>
        <p className="mt-3 text-slate-600">Your order management section is ready for product and cart integration.</p>
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#FBFBFB] px-4 sm:px-6 lg:px-8 py-14">
      <section className="max-w-6xl mx-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-3 text-slate-600">Need help? Reach out and our support team will assist you quickly.</p>
      </section>
    </main>
  );
}

function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#FBFBFB] px-4 sm:px-6 lg:px-8 py-14">
      <section className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Login</h1>
        <p className="mt-3 text-slate-600">Sign in to access your account, track orders, and manage your preferences.</p>
      </section>
    </main>
  );
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
