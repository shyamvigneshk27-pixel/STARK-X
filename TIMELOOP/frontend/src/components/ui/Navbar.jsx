import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  UserCircleIcon, Bars3Icon, XMarkIcon, 
  Squares2X2Icon, MapIcon, GlobeAmericasIcon, 
  PlusCircleIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/my-trips', label: 'My Journeys', icon: MapIcon },
    { to: '/community', label: 'Community', icon: GlobeAmericasIcon },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'py-4' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative flex items-center justify-between h-16 px-6 rounded-3xl transition-all duration-500 ${
          scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/20' : 'bg-transparent'
        }`}>
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-pink-dark rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:rotate-12 transition-transform">
                <span className="text-white font-black text-xl">T</span>
              </div>
              <span className={`text-2xl font-black tracking-tighter transition-colors ${
                scrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                TraveLoop
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-brand-pink-dark text-white shadow-md shadow-pink-500/20' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-gray-200 mx-4" />
            
            <Link to="/create-trip">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Plan Trip
              </motion.button>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative ml-4 group">
              <button className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-brand-pink-dark transition-all shadow-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-pink-100 text-brand-pink-dark flex items-center justify-center font-bold">
                    {user?.firstName?.charAt(0)}
                  </div>
                )}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">My Account</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <UserCircleIcon className="w-5 h-5" /> Profile Settings
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-900 focus:outline-none"
            >
              {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden px-4 mt-2"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/create-trip" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-brand-pink-dark bg-pink-50 rounded-2xl"
              >
                <PlusCircleIcon className="w-5 h-5" /> Plan a New Trip
              </Link>
              <div className="h-px bg-gray-100 my-2" />
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 rounded-2xl"
              >
                <UserCircleIcon className="w-5 h-5" /> My Profile
              </Link>
              <button 
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 rounded-2xl text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
