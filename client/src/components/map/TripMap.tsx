import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { Stop } from '../../types';
import { haversineDistance } from '../../lib/utils';
import 'leaflet/dist/leaflet.css';

interface Props {
  stops: Stop[];
}

// Custom numbered violet marker
function createMarker(num: number) {
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;
        background:linear-gradient(135deg,#7c3aed,#a78bfa);
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:800;font-size:13px;
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 0 12px rgba(124,58,237,0.7),0 2px 8px rgba(0,0,0,0.4);
      ">${num}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FlyBoundsOnLoad({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      const coords = stops
        .filter(s => s.city?.lat && s.city?.lng)
        .map(s => [s.city.lat, s.city.lng] as [number, number]);

      if (coords.length === 1) {
        map.setView(coords[0], 10);
      } else if (coords.length > 1) {
        map.flyToBounds(coords, { padding: [60, 60], duration: 1.5 });
      }
    }
  }, [stops]);
  return null;
}

function LegendPanel({ stops }: { stops: Stop[] }) {
  const map = useMap();

  return (
    <div className="absolute top-3 left-3 z-[1000] glass rounded-xl p-3 max-w-[180px] space-y-1.5">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Route</p>
      {stops.map((stop, i) => (
        <button
          key={stop.id}
          onClick={() => {
            if (stop.city?.lat && stop.city?.lng) {
              map.flyTo([stop.city.lat, stop.city.lng], 12, { duration: 1 });
            }
          }}
          className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {i + 1}
          </div>
          <span className="text-xs text-white truncate">{stop.city?.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function TripMap({ stops }: Props) {
  const validStops = stops.filter(s => s.city?.lat && s.city?.lng);

  const coords: [number, number][] = validStops.map(s => [s.city.lat, s.city.lng]);

  // Compute total distance
  let totalKm = 0;
  for (let i = 1; i < coords.length; i++) {
    totalKm += haversineDistance(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
  }

  const countries = [...new Set(validStops.map(s => s.city.country))];

  if (validStops.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center glass rounded-2xl">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Add stops to see your route</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = coords[0] ?? [35.6762, 139.6503];

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 500 }}>
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Thick white underline for depth */}
          <Polyline positions={coords} pathOptions={{ color: 'white', weight: 8, opacity: 0.08 }} />
          {/* Violet route */}
          <Polyline positions={coords} pathOptions={{ color: '#7c3aed', weight: 4, opacity: 0.9, dashArray: '8, 4' }} />

          {validStops.map((stop, i) => (
            <Marker
              key={stop.id}
              position={[stop.city.lat, stop.city.lng]}
              icon={createMarker(i + 1)}
            >
              <Popup>
                <div className="text-sm font-bold">{stop.city.name}</div>
                <div className="text-xs opacity-60">{stop.city.country}</div>
                {stop.activities?.length > 0 && (
                  <div className="text-xs mt-1">{stop.activities.length} activities planned</div>
                )}
              </Popup>
            </Marker>
          ))}

          <FlyBoundsOnLoad stops={validStops} />
          {validStops.length > 0 && <LegendPanel stops={validStops} />}
        </MapContainer>
      </div>

      {/* Stats bar */}
      <div className="glass rounded-xl p-4 flex items-center justify-around gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{Math.round(totalKm).toLocaleString()}</div>
          <div className="text-xs text-white/50">km total distance</div>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <div className="text-xl font-bold text-white">{countries.length}</div>
          <div className="text-xs text-white/50">countries</div>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <div className="text-xl font-bold text-white">{validStops.length}</div>
          <div className="text-xs text-white/50">cities</div>
        </div>
      </div>
    </div>
  );
}
