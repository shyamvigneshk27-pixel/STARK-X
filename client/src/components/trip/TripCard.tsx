import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Trash2, Share2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';
import { cn, formatDate, getDurationLabel, getTripStatus, hashStringToColor } from '../../lib/utils';

interface Props {
  trip: Trip;
  onDelete: () => void;
}

const statusConfig = {
  upcoming: { label: 'Upcoming', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  active: { label: 'Active', class: 'bg-green-500/20 text-green-300 border-green-500/30', pulse: true },
  past: { label: 'Completed', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  draft: { label: 'Draft', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

export default function TripCard({ trip, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const status = getTripStatus(
    trip.startDate as string,
    trip.endDate as string,
    (trip.stops?.length ?? 0) > 0
  );
  const statusCfg = statusConfig[status];
  const gradientClass = hashStringToColor(trip.name);

  const cities = trip.stops?.slice(0, 3).map((s: any) => s.city?.name).filter(Boolean) ?? [];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col"
    >
      {/* Cover Image */}
      <Link to={`/trips/${trip.id}`} className="block">
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          {trip.coverPhoto && !imgError ? (
            <img
              src={trip.coverPhoto}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} opacity-80`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border flex items-center gap-1', statusCfg.class)}>
              {status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              )}
              {statusCfg.label}
            </span>
          </div>

          {/* City pins */}
          <div className="absolute bottom-3 left-3 flex -space-x-1">
            {cities.map((city: string, i: number) => (
              <div
                key={i}
                title={city}
                className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
              >
                <MapPin className="w-3 h-3 text-white" />
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/trips/${trip.id}`}>
          <h3 className="font-bold text-white text-base leading-tight group-hover:text-primary-300 transition-colors line-clamp-1">
            {trip.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(trip.startDate as string, 'MMM d')} – {formatDate(trip.endDate as string, 'MMM d, yyyy')}
            </span>
            <span className="text-white/30">·</span>
            <span>{getDurationLabel(trip.startDate as string, trip.endDate as string)}</span>
          </div>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <span className="text-[11px] glass px-2 py-1 rounded-full text-white/70 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${trip.totalBudget?.toLocaleString() ?? 0}
            </span>
            {trip.stops && (
              <span className="text-[11px] glass px-2 py-1 rounded-full text-white/70 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {trip.stops.length} cities
              </span>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/trips/${trip.id}`}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            {trip.isPublic && trip.shareId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(`${window.location.origin}/share/${trip.shareId}`);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-primary-300 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
