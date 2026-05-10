import React, { Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Globe2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { register } from '../api/auth';
import { toast } from '../components/ui/Toast';

const GlobeScene = React.lazy(() => import('../components/3d/GlobeScene'));

const GLOBE_CITIES = [
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  { lat: 48.8566, lng: 2.3522, name: 'Paris' },
  { lat: 40.7128, lng: -74.006, name: 'New York' },
  { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
  { lat: 51.5074, lng: -0.1278, name: 'London' },
  { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
  { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  { lat: 13.7563, lng: 100.5018, name: 'Bangkok' },
  { lat: -8.3405, lng: 115.092, name: 'Bali' },
  { lat: 41.9028, lng: 12.4964, name: 'Rome' },
];

const fieldVariants = {
  initial: { opacity: 0, x: 30 },
  animate: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Register() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(name, email, password);
      setAuth(res.user, res.token);
      toast.success(`Welcome to Traveloop, ${name.split(' ')[0]}! 🌍`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left - Globe */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40" />

        <div className="relative z-10 w-full max-w-md">
          <div className="w-full" style={{ height: 420 }}>
            <Suspense fallback={<div className="w-full h-full" />}>
              <GlobeScene cities={GLOBE_CITIES} />
            </Suspense>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-4xl font-black gradient-text leading-tight">Plan smarter.</h1>
            <p className="text-white/60 mt-2 text-lg">Travel further with AI.</p>

            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['🗼 Paris', '🌸 Tokyo', '🏝️ Bali', '🌆 New York', '🗺️ Rome'].map((label, i) => (
                <motion.span
                  key={label}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.8 }}
                  className="glass rounded-xl px-3 py-1.5 text-sm text-white/70"
                >
                  {label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6">
        <div className="lg:hidden absolute inset-0 aurora-bg opacity-20" />

        <div className="relative w-full max-w-sm">
          <div className="glass rounded-3xl p-8 shadow-glow">
            <div className="flex items-center gap-2 mb-8">
              <Globe2 className="w-6 h-6 text-primary-400" />
              <span className="text-xl font-black text-white">Traveloop</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
            <p className="text-white/50 text-sm mb-6">Start your AI travel journey</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate">
                <label className="text-xs text-white/50 mb-1 block">Full Name</label>
                <input
                  id="register-name"
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Alex Rivera" required
                  className="input-glass"
                />
              </motion.div>

              <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate">
                <label className="text-xs text-white/50 mb-1 block">Email</label>
                <input
                  id="register-email"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="input-glass"
                />
              </motion.div>

              <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate">
                <label className="text-xs text-white/50 mb-1 block">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number" required
                    className="input-glass pr-12"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-white/30 mt-1">Must contain uppercase letter and number</p>
              </motion.div>

              <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
                <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
                </button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
