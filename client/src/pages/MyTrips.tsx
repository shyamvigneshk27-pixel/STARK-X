import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, SortAsc, SortDesc, Calendar, DollarSign, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import TripCard from '../components/trip/TripCard';
import { TripCardSkeleton } from '../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { useTripsStore } from '../store/tripsStore';
import { formatDate, getTripStatus } from '../lib/utils';
import apiClient from '../api/client';

type SortKey = 'newest' | 'oldest' | 'name' | 'budget-high' | 'budget-low';

export default function MyTrips() {
  const { trips, setTrips, removeTrip } = useTripsStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/api/trips').then(r => { setTrips(r.data); setLoading(false); });
  }, []);

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

  const filtered = trips
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'budget-high') return (b.totalBudget ?? 0) - (a.totalBudget ?? 0);
      if (sort === 'budget-low') return (a.totalBudget ?? 0) - (b.totalBudget ?? 0);
      return 0;
    });

  const upcoming = filtered.filter(t => getTripStatus(t.startDate as string, t.endDate as string, (t.stops?.length ?? 0) > 0) === 'upcoming');
  const active = filtered.filter(t => getTripStatus(t.startDate as string, t.endDate as string, (t.stops?.length ?? 0) > 0) === 'active');
  const past = filtered.filter(t => getTripStatus(t.startDate as string, t.endDate as string, (t.stops?.length ?? 0) > 0) === 'past');
  const drafts = filtered.filter(t => getTripStatus(t.startDate as string, t.endDate as string, (t.stops?.length ?? 0) > 0) === 'draft');

  const sections = [
    { label: 'Active', items: active, color: 'text-green-400', dot: 'bg-green-400' },
    { label: 'Upcoming', items: upcoming, color: 'text-blue-400', dot: 'bg-blue-400' },
    { label: 'Past', items: past, color: 'text-white/40', dot: 'bg-gray-500' },
    { label: 'Drafts', items: drafts, color: 'text-amber-400', dot: 'bg-amber-400' },
  ].filter(s => s.items.length > 0);

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">My Trips</h1>
            <p className="text-white/50 mt-1">{trips.length} trips planned</p>
          </div>
          <Link to="/trips/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search trips..." className="input-glass pl-10 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="input-glass text-sm bg-transparent max-w-[180px]"
          >
            <option value="newest" className="bg-gray-900">Newest first</option>
            <option value="oldest" className="bg-gray-900">Oldest first</option>
            <option value="name" className="bg-gray-900">Name A-Z</option>
            <option value="budget-high" className="bg-gray-900">Budget: High</option>
            <option value="budget-low" className="bg-gray-900">Budget: Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <TripCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <MapPin className="w-14 h-14 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {search ? 'No trips match your search' : 'No trips yet'}
            </h3>
            <p className="text-white/50 mb-6">
              {search ? 'Try a different search term.' : 'Start planning your first adventure with ARIA.'}
            </p>
            {!search && (
              <Link to="/trips/new" className="btn-primary inline-flex">
                <Plus className="w-4 h-4" /> Plan First Trip
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map(section => (
              <div key={section.label}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2.5 h-2.5 rounded-full ${section.dot}`} />
                  <h2 className={`text-lg font-bold ${section.color}`}>{section.label}</h2>
                  <span className="glass px-2 py-0.5 rounded-full text-xs text-white/50 ml-1">
                    {section.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {section.items.map((trip, i) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <TripCard trip={trip} onDelete={() => setDeleteTarget(trip.id)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
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
