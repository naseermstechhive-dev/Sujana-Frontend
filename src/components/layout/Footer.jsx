import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const companyData = {
    companyName: 'Sujana Gold Company',
    location: {
      address:
        'Opp Apsara Theatre, Apsara Cir Road, Kadapa, Andhra Pradesh, 516001',
      city: 'Kadapa',
      state: 'Andhra Pradesh',
    },
    contact: {
      phone: ['6303060488', '9010330078'],
    },
    services: [
      'Spot Cash for Gold',
      'Gold Loan Take Over',
      'Release Pledged Gold',
      'Second Hand Gold Jewellery Buying',
      'Gold Scrap Buying',
      'Instant Quotes for Jewellery',
    ],
    operatingHours: {
      mondayToSaturday: '10:00 AM - 7:00 PM',
      sunday: 'Closed',
    },
    socialMedia: {
      instagram: '@sujanagoldcompany',
      facebook: 'Sujana Gold Company',
    },
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/images/Sujana-Gold-Logo.jpeg"
                alt="Sujana Gold Company"
                className="h-18 w-auto mr-2"
              />
              <span className="text-lg font-bold text-yellow-400">
                Sujana Gold
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted partner for gold buying and loan services in Kadapa.
              Established with transparency and customer satisfaction.
            </p>
            <div className="flex space-x-4">
              <a
                href={`https://instagram.com/${companyData.socialMedia.instagram.replace(
                  '@',
                  '',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={`https://facebook.com/${companyData.socialMedia.facebook.replace(
                  ' ',
                  '',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Our Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {companyData.services.slice(0, 4).map((service, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-yellow-400 mr-2">•</span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Contact Info
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{companyData.location.address}</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  {companyData.contact.phone.map((phone, index) => (
                    <div key={index}>
                      <a
                        href={`tel:${phone}`}
                        className="hover:text-yellow-400 transition duration-300"
                      >
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div>
                    Mon-Sat: {companyData.operatingHours.mondayToSaturday}
                  </div>
                  <div>Sun: {companyData.operatingHours.sunday}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-yellow-400 transition duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-yellow-400 transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/calculator"
                  className="text-gray-300 hover:text-yellow-400 transition duration-300"
                >
                  Gold Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-yellow-400 transition duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {companyData.companyName}. All
            rights reserved{' '}
            <a
              href="https://www.mstechhive.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 ml-2 transition-colors font-bold underline"
            >
              Ms Tech Hive
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
