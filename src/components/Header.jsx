import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Orders', to: '/orders' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const getDesktopLinkClass = ({ isActive }) =>
    `relative px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ease-in-out ${
      isActive
        ? 'text-white shadow-lg'
        : 'text-gray-600 hover:text-[#8200db] hover:bg-[#8200db22]'
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-white shadow-md'
        : 'text-gray-700 hover:text-[#8200db] hover:bg-[#8200db22]'
    }`;

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-md"
      style={{ backgroundColor: '#FBFBFB' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <Link
            to="/"
            className="flex items-center justify-center rounded-full border-2 border-black p-1.5 flex-shrink-0 md:-ml-4"
            aria-label="Go to home"
          >
            <img
              src="/logo.png"
              alt="Veloura Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={getDesktopLinkClass}
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: '#8200db', color: '#ffffff' }
                    : undefined
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/login"
              className="ml-4 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #8200db, #a855f7)' }}
            >
              Login
            </NavLink>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg gap-1.5 transition-colors duration-200"
            style={{ color: '#8200db' }}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
              style={{ backgroundColor: '#8200db' }}
            />
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
              style={{ backgroundColor: '#8200db' }}
            />
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
              style={{ backgroundColor: '#8200db' }}
            />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ backgroundColor: '#E8F9FF' }}
      >
        <nav className="px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={getMobileLinkClass}
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: '#8200db', color: '#ffffff' }
                  : undefined
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="mt-2 px-4 py-3 rounded-xl text-sm font-bold text-white text-center transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #8200db, #a855f7)' }}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </NavLink>
        </nav>
      </div>

      <div
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #8200db, transparent)' }}
      />
    </header>
  );
}
