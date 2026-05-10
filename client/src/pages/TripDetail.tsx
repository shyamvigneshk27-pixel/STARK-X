import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Calendar, DollarSign, Activity, Share2, Globe, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Trip } from '../types';
import AriaChatPanel from '../components/aria/AriaChatPanel';
import ItineraryView from '../components/trip/ItineraryView';
import BudgetDashboard from '../components/budget/BudgetDashboard';
import TripMap from '../components/map/TripMap';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { toast } from '../components/ui/Toast';
import { formatDate, getDurationLabel, cn } from '../lib/utils';
import apiClient from '../api/client';

const TABS = ['ARIA', 'Itinerary', 'Budget', 'Map'];

export default function TripDetail() {
  const navigate = useNavigate();
  const id = window.location.pathname.split('/').pop() ?? '';
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [sharing, setSharing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -80]);

  const loadTrip = async () => {
    try {
      const res = await apiClient.get(`/api/trips/${id}`);
      setTrip(res.data);
    } catch {
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrip(); }, [id]);

  const handleToggleShare = async () => {
    if (!trip) return;
    setSharing(true);
    try {
      const res = await apiClient.patch(`/api/share/${trip.id}/toggle`);
      setTrip(t => t ? { ...t, isPublic: res.data.isPublic, shareId: res.data.shareId } : t);
      if (res.data.isPublic) {
        await navigator.clipboard.writeText(`${window.location.origin}/share/${res.data.shareId}`);
        toast.success('Trip made public! Share link copied.');
      } else {
        toast.success('Trip is now private.');
      }
    } catch {
      toast.error('Failed to update sharing');
    } finally {
      setSharing(false);
    }
  };

  const switchTab = (i: number) => { setPrevTab(tab); setTab(i); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!trip) return null;

  const stops = trip.stops ?? [];
  const totalActivities = stops.reduce((s: number, stop: any) => s + (stop.activities?.length ?? 0), 0);
  const totalNights = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000));

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Cinematic hero */}
      <div ref={heroRef} className="relative min-h-[280px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {trip.coverPhoto ? (
            <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover scale-110" />
          ) : (
            <div className="w-full h-full aurora-bg" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{trip.name}</h1>
          {trip.description && <p className="text-white/60 max-w-xl mb-4">{trip.description}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-sm text-white/70">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.startDate as string)} – {formatDate(trip.endDate as string)}
            </span>
            <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-sm text-white/70">
              <DollarSign className="w-4 h-4" />${trip.totalBudget?.toLocaleString()}
            </span>
            <button
              onClick={handleToggleShare}
              disabled={sharing}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors', trip.isPublic ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'glass text-white/60 hover:text-white')}
            >
              {trip.isPublic ? <Globe className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {trip.isPublic ? 'Public' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 -mt-2 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Stops', value: stops.length, icon: MapPin },
            { label: 'Days', value: totalNights, icon: Calendar },
            { label: 'Activities', value: totalActivities, icon: Activity },
            { label: 'Budget', value: trip.totalBudget ?? 0, icon: DollarSign, prefix: '$' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} />
              </div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-16 z-30 max-w-7xl mx-auto px-4 mb-6">
        <div className="glass rounded-2xl p-1.5 flex gap-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => switchTab(i)}
              className={cn('tab-pill flex-1 text-center', tab === i ? 'active' : '')}
            >
              {t === 'ARIA' && <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab > prevTab ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab > prevTab ? -20 : 20 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 0 && (
              <div style={{ height: '600px' }}>
                <AriaChatPanel
                  tripId={trip.id}
                  budget={trip.totalBudget ?? 0}
                  onItinerarySaved={() => { loadTrip(); switchTab(1); }}
                />
              </div>
            )}
            {tab === 1 && <ItineraryView trip={trip} onUpdate={loadTrip} />}
            {tab === 2 && <BudgetDashboard tripId={trip.id} totalBudget={trip.totalBudget ?? 0} />}
            {tab === 3 && <TripMap stops={stops} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
