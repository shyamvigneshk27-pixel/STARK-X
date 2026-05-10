import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { MapPin, Calendar, DollarSign, Globe, Share2, Copy, Twitter, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/Toast';
import { formatDate, getDurationLabel, getInitials } from '../lib/utils';
import apiClient from '../api/client';

export default function PublicTrip() {
  const { shareId } = useParams<{ shareId: string }>();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    apiClient.get(`/api/share/${shareId}`).then(r => setTrip(r.data)).catch(() => setTrip(null)).finally(() => setLoading(false));
  }, [shareId]);

  const handleCopy = async () => {
    if (!token) { navigate(`/login?redirect=/share/${shareId}`); return; }
    setCopying(true);
    try {
      const res = await apiClient.post(`/api/share/${shareId}/copy`);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
      toast.success('Trip copied to your account!');
      setTimeout(() => navigate(`/trips/${res.data.newTripId}`), 1500);
    } catch {
      toast.error('Failed to copy trip');
    } finally {
      setCopying(false);
    }
  };

  const shareUrl = `${window.location.origin}/share/${shareId}`;
  const shareText = trip ? `Check out my trip "${trip.name}" planned with Traveloop AI!` : '';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center text-center" style={{ background: 'var(--bg-primary)' }}>
      <div>
        <Globe className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Trip not found</h2>
        <p className="text-white/50 mb-6">This trip is private or no longer exists.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {confetti && <ReactConfetti width={width} height={height} numberOfPieces={200} gravity={0.3} colors={['#7c3aed', '#a78bfa', '#60a5fa', '#f472b6']} style={{ zIndex: 9999 }} />}

      {/* Hero */}
      <div className="relative min-h-[320px] overflow-hidden">
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 aurora-bg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/50 to-black/30" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-12 flex flex-col justify-end h-full" style={{ minHeight: 320 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* User credit */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(trip.user?.name ?? 'U')}
            </div>
            <span className="text-white/60 text-sm">Planned by <span className="text-white font-semibold">{trip.user?.name}</span></span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black gradient-text leading-tight mb-3">{trip.name}</h1>

          <div className="flex flex-wrap gap-3">
            <span className="glass px-3 py-1.5 rounded-full text-sm text-white/70 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {getDurationLabel(trip.startDate, trip.endDate)}
            </span>
            <span className="glass px-3 py-1.5 rounded-full text-sm text-white/70 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />{trip.stops?.length} cities
            </span>
            <span className="glass px-3 py-1.5 rounded-full text-sm text-white/70 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />${trip.totalBudget?.toLocaleString()} budget
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stops */}
        <div className="space-y-6 mb-12">
          {trip.stops?.map((stop: any, i: number) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <div className="p-5 border-b border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow">
                    {i + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold gradient-text">{stop.city?.name}</h2>
                    <p className="text-white/50 text-sm">
                      {stop.city?.country} · {formatDate(stop.arrivalDate, 'MMM d')} – {formatDate(stop.departureDate, 'MMM d')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stop.activities?.map((act: any) => (
                    <div key={act.id} className="glass rounded-xl p-3 flex items-start gap-3">
                      <div className="text-xl flex-shrink-0">
                        {{ sightseeing: '🏛️', food: '🍜', adventure: '🏔️', culture: '🎭', nightlife: '🌃', transport: '🚄', accommodation: '🏨' }[act.type] ?? '📍'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">{act.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {act.startTime && `${act.startTime} · `}{act.durationHrs}h · ${act.estimatedCost}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-lg mx-auto glass rounded-2xl p-4 flex items-center gap-3 shadow-glow">
          <button onClick={() => navigate(-1)} className="btn-glass px-3 py-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2 flex-1">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-glass px-3 py-2 text-sm flex-1 justify-center"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-glass px-3 py-2 text-sm flex-1 justify-center"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={handleCopy}
            disabled={copying}
            className="btn-primary px-5 py-2 text-sm flex-1 justify-center"
          >
            <Copy className="w-4 h-4" />
            {copying ? 'Copying…' : 'Copy Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
