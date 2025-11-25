import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ open, setOpen, menuItems, activeItem, setActiveItem, isMobile = false }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`${
        open ? 'w-72' : 'w-24'
      } bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-white duration-300 p-6 shadow-2xl relative min-h-screen`}
    >
      {/* Toggle Button */}
      {!isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-4 top-8 bg-white hover:bg-yellow-50 text-yellow-600 shadow-xl p-3 rounded-full border-2 border-yellow-300 transition-all duration-300 hover:scale-110"
        >
          {open ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
        </button>
      )}

      {/* Logo Section */}
      <div className="flex flex-col justify-center items-center mb-12">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer hover:scale-105 transition-transform duration-300 group"
        >
          <div className="bg-white p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <img
              src="/images/Sujana-Gold-Logo.jpeg"
              className="w-16 h-16 object-contain"
              alt="Sujana Gold Logo"
            />
          </div>
        </button>
        {open && (
          <div className="mt-4 text-center">
            <h2 className="text-lg font-bold text-yellow-900">Sujana Gold</h2>
            <p className="text-xs text-yellow-800 opacity-80">Management System</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <ul className="space-y-3 flex-1">
        {menuItems.map((item, i) => (
          <li key={i} className="w-full">
            <button
              className={`w-full flex items-center justify-start gap-5 cursor-pointer py-4 px-4 rounded-xl transition-all duration-300 group min-h-[60px] ${
                activeItem === item.title
                  ? 'bg-white text-yellow-600 shadow-lg transform scale-105'
                  : 'hover:bg-white/20 hover:shadow-md'
              }`}
              onClick={() =>
                item.action ? item.action() : setActiveItem(item.title)
              }
            >
              <span className={`text-2xl transition-colors duration-300 flex-shrink-0 ${
                activeItem === item.title ? 'text-yellow-600' : 'text-white group-hover:text-yellow-200'
              }`}>
                {item.icon}
              </span>
              {open && (
                <span className={`text-base font-semibold transition-colors duration-300 text-left leading-tight ${
                  activeItem === item.title ? 'text-yellow-600' : 'text-white'
                }`}>
                  {item.title}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-100">© 2025 Sujana Gold</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;