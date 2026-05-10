import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, DollarSign, Users, Star, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTripsStore } from '../store/tripsStore';
import TripCard from '../components/trip/TripCard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TripCardSkeleton } from '../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import apiClient from '../api/client';

const TYPEWRITER_PROMPTS = [
  '10 days in Japan. Street food & temples...',
  'Weekend in Paris. Romantic & fine dining...',
  'Road trip across the USA in 3 weeks...',
  'Budget backpacking Southeast Asia...',
];

const POPULAR_CITIES = [
  { name: 'Tokyo', country: 'Japan', costIndex: 2.5, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' },
  { name: 'Paris', country: 'France', costIndex: 3.5, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bali', country: 'Indonesia', costIndex: 1.0, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
  { name: 'New York', country: 'USA', costIndex: 4.0, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bangkok', country: 'Thailand', costIndex: 1.2, image: 'https://images.unsplash.com/photo-1508009603885-247a50f45b96?auto=format&fit=crop&w=600&q=80' },
  { name: 'Barcelona', country: 'Spain', costIndex: 2.2, image: 'https://images.unsplash.com/photo-1583422409516-15eba534e8f1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Singapore', country: 'Singapore', costIndex: 3.0, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rome', country: 'Italy', costIndex: 2.8, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trips, setTrips, removeTrip } = useTripsStore();
  const [loading, setLoading] = useState(true);
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayPrompt, setDisplayPrompt] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();
  const intervalRef = useRef<number>();

  useEffect(() => {
    apiClient.get('/api/trips').then(r => { setTrips(r.data); setLoading(false); });
  }, []);

  // Typewriter effect
  useEffect(() => {
    let charIdx = 0;
    const full = TYPEWRITER_PROMPTS[promptIdx];
    setDisplayPrompt('');
    const typeInterval = setInterval(() => {
      if (charIdx < full.length) {
        setDisplayPrompt(full.slice(0, ++charIdx));
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPromptIdx(i => (i + 1) % TYPEWRITER_PROMPTS.length);
        }, 2000);
      }
    }, 40);
    return () => clearInterval(typeInterval);
  }, [promptIdx]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/trips/${id}`);
      removeTrip(id);
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
    setDeleteTarget(null);
  };

  const totalActivities = trips.reduce((sum, t) => sum + (t.stops?.reduce((s: number, stop: any) => s + (stop.activities?.length ?? 0), 0) ?? 0), 0);
  const totalBudget = trips.reduce((sum, t) => sum + (t.totalBudget ?? 0), 0);
  const citiesVisited = new Set(trips.flatMap(t => t.stops?.map((s: any) => s.city?.name) ?? [])).size;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Mesh gradient bg */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-25" />
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-4">
              Powered by ARIA AI
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-2">
              Plan Your Next
            </h1>
            <h2 className="text-5xl md:text-7xl font-black gradient-text leading-tight mb-6">
              Dream Trip with AI
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
              Tell ARIA where you want to go. Get a complete itinerary with activities, budget breakdowns, and maps — in seconds.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <Link to="/trips/new" className="btn-primary text-base px-8 py-4 shadow-glow-lg">
              <Sparkles className="w-5 h-5" />
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Typewriter preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 glass rounded-2xl px-6 py-4 max-w-xl mx-auto text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/40 font-mono">ARIA</span>
            </div>
            <p className="text-white/70 text-sm font-mono min-h-[20px]">
              {displayPrompt}
              <span className="animate-pulse text-primary-400">|</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Trips', value: trips.length, icon: MapPin, color: 'text-violet-400', cardClass: 'stat-card-violet' },
            { label: 'Cities Explored', value: citiesVisited, icon: TrendingUp, color: 'text-blue-400', cardClass: 'stat-card-blue' },
            { label: 'Activities Planned', value: totalActivities, icon: Star, color: 'text-amber-400', cardClass: 'stat-card-amber' },
            { label: 'Total Budget', value: totalBudget, icon: DollarSign, color: 'text-emerald-400', prefix: '$', cardClass: 'stat-card-emerald' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`${stat.cardClass} rounded-2xl p-5 text-center backdrop-blur-xl transition-all duration-300`}
            >
              <div className={`${stat.color} flex justify-center mb-2`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>
                <AnimatedCounter value={stat.value} prefix={stat.prefix} />
              </div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent trips */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No trips yet</h3>
              <p className="text-white/50 mb-6">Start planning your first adventure with ARIA.</p>
              <Link to="/trips/new" className="btn-primary inline-flex">
                <Sparkles className="w-4 h-4" /> Plan First Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 6).map(trip => (
                <TripCard key={trip.id} trip={trip} onDelete={() => setDeleteTarget(trip.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Popular cities */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.name}
                to={`/trips/new?city=${city.name}`}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm leading-tight">{city.name}</h3>
                  <p className="text-white/60 text-xs">{city.country}</p>
                </div>
                <div className="absolute top-2 right-2 glass rounded-full px-2 py-0.5 text-[10px] text-white/80">
                  {city.costIndex <= 1.5 ? 'Budget' : city.costIndex <= 2.5 ? 'Mid' : 'Premium'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Trip"
        description="This will permanently delete this trip and all its data."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
