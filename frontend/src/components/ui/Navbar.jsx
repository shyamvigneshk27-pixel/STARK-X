import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-brand-pink-dark tracking-tight">
              Traveloop
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-brand-pink-dark font-medium transition-colors">Dashboard</Link>
            <Link to="/my-trips" className="text-gray-600 hover:text-brand-pink-dark font-medium transition-colors">My Trips</Link>
            <Link to="/community" className="text-gray-600 hover:text-brand-pink-dark font-medium transition-colors">Community</Link>
            <Link to="/create-trip" className="bg-brand-pink-dark text-white px-4 py-2 rounded-full shadow-md shadow-pink-500/40 font-medium hover:-translate-y-0.5 hover:shadow-pink-500/60 transition-all">Plan Trip</Link>
            
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-brand-pink-dark focus:outline-none">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <UserCircleIcon className="w-8 h-8" />
                )}
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile Settings</Link>
                <button 
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-brand-pink-dark focus:outline-none"
            >
              {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Dashboard</Link>
            <Link to="/my-trips" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">My Trips</Link>
            <Link to="/community" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Community</Link>
            <Link to="/create-trip" className="block px-3 py-2 text-base font-medium text-brand-pink-dark hover:bg-pink-50 rounded-md">Plan a New Trip</Link>
            <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Profile Settings</Link>
            <button 
              onClick={logout}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
