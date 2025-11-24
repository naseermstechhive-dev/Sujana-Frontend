import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCalculator } from '../../contexts/CalculatorContext';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { toggleCalculator } = useCalculator();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCalculatorClick = (e) => {
    e.preventDefault();
    toggleCalculator();
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/images/Sujana-Gold-Logo.jpeg"
                alt="Sujana Gold Company"
                className="h-18 w-auto mr-3"
              />
              <span className="text-xl font-bold text-yellow-400">
                Sujana Gold
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
            >
              Contact
            </Link>
            <button
              onClick={handleCalculatorClick}
              className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span>Calculator</span>
            </button>
            {user && (user.role === 'employee' || user.role === 'admin') && (
              <Link
                to="/billing"
                className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Billing
              </Link>
            )}

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{user.name}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    <div className="px-4 py-2 text-sm text-yellow-400 border-b border-gray-600">
                      Role: {user.role}
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Contact
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-yellow-400 focus:outline-none focus:text-yellow-400"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-t border-gray-700">
              <Link
                to="/"
                className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <button
                onClick={handleCalculatorClick}
                className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center space-x-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span>Calculator</span>
              </button>
              {user && (user.role === 'employee' || user.role === 'admin') && (
                <Link
                  to="/billing"
                  className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Billing
                </Link>
              )}
              <Link
                to="/contact"
                className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              {user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-white text-sm">
                      {user.name} ({user.role})
                    </span>
                  </div>
                  <Link
                    to="/contact"
                    className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-white hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
