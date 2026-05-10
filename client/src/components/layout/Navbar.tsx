import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Bell, ChevronDown, Menu, X, LogOut,
  User, Settings, ShieldCheck, Map, Plane,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTripsStore } from '../../store/tripsStore';
import { getInitials } from '../../lib/utils';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { trips } = useTripsStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10,10,15,0.92)'
          : 'rgba(10,10,15,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-black text-lg text-white mr-4">
          <Globe2 className="w-5 h-5 text-primary-400 animate-spin-slow" />
          <span>Traveloop</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <NavLink to="/dashboard" icon={<Map className="w-4 h-4" />} label="Dashboard" />
          <NavLink to="/trips" icon={<Plane className="w-4 h-4" />} label="My Trips" />
          {user?.isAdmin && (
            <NavLink to="/admin" icon={<ShieldCheck className="w-4 h-4" />} label="Admin" />
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {trips.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-xs">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user?.name ?? 'U')
                )}
              </div>
              <span className="text-sm font-medium text-white hidden sm:block">{user?.name?.split(' ')[0]}</span>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl border border-white/10 shadow-glow overflow-hidden"
                >
                  <div className="p-3 border-b border-white/5">
                    <p className="font-semibold text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-white/40">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <DropdownItem icon={<User className="w-4 h-4" />} label="Profile" to="/profile" onClick={() => setUserOpen(false)} />
                    {user?.isAdmin && (
                      <DropdownItem icon={<ShieldCheck className="w-4 h-4" />} label="Admin" to="/admin" onClick={() => setUserOpen(false)} />
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 px-4 py-3 space-y-1"
          >
            <MobileNavLink to="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/trips" label="My Trips" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/profile" label="Profile" onClick={() => setMobileOpen(false)} />
            {user?.isAdmin && <MobileNavLink to="/admin" label="Admin" onClick={() => setMobileOpen(false)} />}
            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-400 text-sm rounded-xl hover:bg-red-500/10">
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}{label}
    </Link>
  );
}

function DropdownItem({ icon, label, to, onClick }: { icon: React.ReactNode; label: string; to: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}{label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
    >
      {label}
    </Link>
  );
}
