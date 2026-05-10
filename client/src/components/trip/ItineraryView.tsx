import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Clock, ChevronUp, ChevronDown, Search, Loader2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trip, Stop, Activity } from '../../types';
import { createActivity, deleteStop, createStop, deleteActivity } from '../../api/trips';
import { searchCities } from '../../api/trips';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { formatDate, cn } from '../../lib/utils';
import apiClient from '../../api/client';

interface Props {
  trip: Trip;
  onUpdate: () => void;
}

const typeColors: Record<string, string> = {
  sightseeing: 'type-badge-sightseeing',
  food: 'type-badge-food',
  adventure: 'type-badge-adventure',
  culture: 'type-badge-culture',
  nightlife: 'type-badge-nightlife',
  transport: 'type-badge-transport',
  accommodation: 'type-badge-accommodation',
};

const typeIcons: Record<string, string> = {
  sightseeing: '🏛️',
  food: '🍜',
  adventure: '🏔️',
  culture: '🎭',
  nightlife: '🌃',
  transport: '🚄',
  accommodation: '🏨',
};

function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="glass rounded-xl p-3 flex items-start gap-3 group hover:border-white/15 transition-colors">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-white/5">
        {typeIcons[activity.type] ?? '📍'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm leading-tight">{activity.name}</h4>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={cn('type-badge', typeColors[activity.type] ?? '')}>
            {activity.type}
          </span>
          {activity.startTime && (
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />{activity.startTime}
            </span>
          )}
          <span className="text-xs text-white/50">
            ${activity.estimatedCost} · {activity.durationHrs}h
          </span>
        </div>
      </div>
      <button
        onClick={() => setConfirmOpen(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete Activity"
        description={`Are you sure you want to delete "${activity.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

function StopPanel({ stop, onUpdate, index }: { stop: Stop; onUpdate: () => void; index: number }) {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actName, setActName] = useState('');
  const [actType, setActType] = useState('sightseeing');
  const [actCost, setActCost] = useState('');
  const [actDuration, setActDuration] = useState('');
  const [actStartTime, setActStartTime] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const nights = Math.max(
    1,
    Math.ceil((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000)
  );

  const handleAddActivity = async () => {
    if (!actName.trim()) return;
    setAdding(true);
    try {
      await createActivity({
        stopId: stop.id,
        name: actName,
        type: actType,
        estimatedCost: Number(actCost) || 0,
        durationHrs: Number(actDuration) || 1,
        startTime: actStartTime || undefined,
      });
      setShowAddActivity(false);
      setActName(''); setActCost(''); setActDuration(''); setActStartTime('');
      toast.success('Activity added!');
      onUpdate();
    } catch {
      toast.error('Failed to add activity');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStop = async () => {
    try {
      await deleteStop(stop.id);
      toast.success('Stop removed');
      onUpdate();
    } catch {
      toast.error('Failed to delete stop');
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    try {
      await deleteActivity(actId);
      onUpdate();
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  return (
    <div className="relative pl-10">
      {/* Timeline node */}
      <div className="absolute left-0 top-6 w-8 h-8 rounded-full bg-primary-600 border-2 border-primary-400 flex items-center justify-center text-white font-bold text-sm z-10 shadow-glow">
        {index + 1}
      </div>

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-5 border-b border-white/5 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold gradient-text">{stop.city.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] glass px-2 py-1 rounded-full text-white/60">
                {stop.city.country}
              </span>
              <span className="text-xs text-white/50">
                {formatDate(stop.arrivalDate as string, 'MMM d')} – {formatDate(stop.departureDate as string, 'MMM d')} · {nights} nights
              </span>
            </div>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="p-2 rounded-xl hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {stop.activities.length === 0 && (
            <p className="text-sm text-white/30 italic">No activities yet. Add your first!</p>
          )}
          {stop.activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onDelete={() => handleDeleteActivity(act.id)}
            />
          ))}

          {showAddActivity ? (
            <div className="glass rounded-xl p-4 space-y-3 border border-primary-500/20">
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text" placeholder="Activity name" value={actName} onChange={e => setActName(e.target.value)}
                  className="input-glass text-sm py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select value={actType} onChange={e => setActType(e.target.value)} className="input-glass text-sm py-2 bg-transparent">
                    {['sightseeing','food','adventure','culture','nightlife','transport','accommodation'].map(t => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                  <input type="time" value={actStartTime} onChange={e => setActStartTime(e.target.value)} className="input-glass text-sm py-2" />
                  <input type="number" placeholder="Cost (USD)" value={actCost} onChange={e => setActCost(e.target.value)} className="input-glass text-sm py-2" />
                  <input type="number" placeholder="Duration (hrs)" value={actDuration} onChange={e => setActDuration(e.target.value)} className="input-glass text-sm py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddActivity(false)} className="btn-glass text-sm px-3 py-1.5">Cancel</button>
                <button onClick={handleAddActivity} disabled={adding} className="btn-primary text-sm px-3 py-1.5">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddActivity(true)} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors mt-2">
              <Plus className="w-4 h-4" /> Add Activity
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteStop}
        title="Remove Stop"
        description={`Remove ${stop.city.name} and all its activities from this trip?`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  );
}

function AddStopModal({ tripId, onAdded, onClose }: { tripId: string; onAdded: () => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [saving, setSaving] = useState(false);

  const search = async (q: string) => {
    if (!q) { setCities([]); return; }
    setLoading(true);
    try {
      const res = await searchCities(q);
      setCities(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selected || !arrivalDate || !departureDate) return;
    setSaving(true);
    try {
      const res = await apiClient.get('/api/trips/' + tripId);
      const order = res.data.stops?.length ?? 0;
      await createStop({ tripId, cityId: selected.id, arrivalDate, departureDate, order });
      toast.success(`${selected.name} added!`);
      onAdded();
      onClose();
    } catch {
      toast.error('Failed to add stop');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-glow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Add City Stop</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text" placeholder="Search cities..." value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          className="input-glass pl-10 text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />}
      </div>

      {!selected && cities.length > 0 && (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {cities.map(city => (
            <button
              key={city.id}
              onClick={() => setSelected(city)}
              className="w-full text-left glass rounded-xl p-3 hover:border-primary-500/50 transition-colors"
            >
              <div className="font-semibold text-white text-sm">{city.name}</div>
              <div className="text-xs text-white/50">{city.country}</div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="glass rounded-xl p-3 mb-4 flex justify-between items-center border border-primary-500/30">
          <div>
            <div className="font-bold text-white">{selected.name}</div>
            <div className="text-xs text-white/50">{selected.country}</div>
          </div>
          <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selected && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Arrival</label>
            <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="input-glass text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Departure</label>
            <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="input-glass text-sm py-2" />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-glass text-sm px-4 py-2">Cancel</button>
        <button onClick={handleAdd} disabled={!selected || !arrivalDate || !departureDate || saving} className="btn-primary text-sm px-4 py-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Stop'}
        </button>
      </div>
    </div>
  );
}

export default function ItineraryView({ trip, onUpdate }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const stops = trip.stops ?? [];

  return (
    <div className="py-4">
      {/* Timeline */}
      <div className="relative">
        {stops.length > 0 && (
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-600 to-primary-900/30 z-0" />
        )}

        {stops.map((stop, i) => (
          <StopPanel key={stop.id} stop={stop} onUpdate={onUpdate} index={i} />
        ))}
      </div>

      {stops.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No stops yet</h3>
          <p className="text-white/50 text-sm mb-6">Ask ARIA to plan your trip, or add stops manually.</p>
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="btn-glass text-sm w-full py-3 mt-2 border-dashed border-white/20 hover:border-primary-500/50"
      >
        <Plus className="w-4 h-4" /> Add City Stop
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <AddStopModal
            tripId={trip.id}
            onAdded={onUpdate}
            onClose={() => setShowAddModal(false)}
          />
        </div>
      )}
    </div>
  );
}
