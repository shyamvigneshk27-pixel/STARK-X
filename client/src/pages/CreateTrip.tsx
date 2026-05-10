import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Globe2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTripsStore } from '../store/tripsStore';
import { toast } from '../components/ui/Toast';
import apiClient from '../api/client';

export default function CreateTrip() {
  const { user } = useAuthStore();
  const { addTrip } = useTripsStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill city from search param
  useEffect(() => {
    const city = params.get('city');
    if (city) setName(`${city} Adventure`);
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) { toast.error('Please fill in all required fields'); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error('End date must be after start date'); return; }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/trips', {
        name,
        startDate,
        endDate,
        totalBudget: Number(budget) || 0,
        description,
      });
      addTrip(res.data);
      toast.success('Trip created! Ask ARIA to plan it.');
      navigate(`/trips/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-10" />

      <div className="relative w-full max-w-lg px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 shadow-glow"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-glow">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">New Trip</h1>
              <p className="text-white/50 text-sm">ARIA will plan it for you</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Trip Name *</label>
              <input
                id="trip-name"
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Japan Cherry Blossom Adventure" required
                className="input-glass"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Start Date *</label>
                <input
                  id="trip-start-date"
                  type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
                  className="input-glass text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">End Date *</label>
                <input
                  id="trip-end-date"
                  type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required
                  className="input-glass text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Total Budget (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
                <input
                  id="trip-budget"
                  type="number" value={budget} onChange={e => setBudget(e.target.value)}
                  placeholder="2500" min={0}
                  className="input-glass pl-7"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Description (optional)</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="What's the vibe? Romantic getaway, backpacking adventure..."
                rows={3}
                className="input-glass resize-none text-sm"
              />
            </div>

            <button
              id="create-trip-submit"
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Plus className="w-5 h-5" /> Create Trip</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
