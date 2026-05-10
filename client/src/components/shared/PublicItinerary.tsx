import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Copy, MapPin, Calendar, Clock, User } from 'lucide-react';
import { Trip } from '../../../types';
import { getPublicTrip, copyPublicTrip } from '../../../api/trips';
import useAuthStore from '../../../store/authStore';

const typeColors: Record<string, string> = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  nightlife: 'bg-pink-100 text-pink-700',
  transport: 'bg-gray-100 text-gray-700',
  accommodation: 'bg-teal-100 text-teal-700'
};

const PublicItinerary = ({ shareId }: { shareId: string }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getPublicTrip(shareId)
      .then(res => {
        setTrip(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Trip not found or is no longer public.');
        setLoading(false);
      });
  }, [shareId]);

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCopying(true);
    try {
      const res = await copyPublicTrip(shareId);
      navigate(`/trips/${res.data.newTripId}`);
    } catch (err) {
      alert('Failed to copy trip');
      setCopying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !trip) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8">
        <div className="h-64 bg-gray-200 relative">
          {trip.coverPhoto ? (
            <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-blue-500" />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-4xl font-bold mb-2 shadow-sm">{trip.name}</h1>
            <div className="flex items-center space-x-4 text-sm font-medium">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                {trip.user && 'avatarUrl' in trip.user ? (
                  <img src={(trip.user as any).avatarUrl} alt="Author" className="w-5 h-5 rounded-full mr-2 border border-white" />
                ) : (
                  <User className="w-4 h-4 mr-1" />
                )}
                By {(trip.user as any)?.name || 'Traveloop User'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-between items-center bg-gray-50 border-b border-gray-100">
          <button onClick={handleShare} className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <Share2 className="w-4 h-4 mr-2" /> Share Link
          </button>
          <button 
            onClick={handleCopyTrip} 
            disabled={copying}
            className="flex items-center px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-sm disabled:opacity-70"
          >
            <Copy className="w-4 h-4 mr-2" /> {copying ? 'Copying...' : 'Copy to My Trips'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary Details</h2>
        
        {trip.stops.map(stop => (
          <div key={stop.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{stop.city.name}, {stop.city.country}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {stop.activities.map(act => (
                  <div key={act.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 flex-shrink-0 pt-1 text-sm font-medium text-gray-500">
                      {act.startTime ? (
                        <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {act.startTime}</div>
                      ) : 'Any time'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{act.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[act.type] || typeColors.sightseeing}`}>
                          {act.type}
                        </span>
                        <span className="text-xs text-gray-500">{act.durationHrs}h</span>
                      </div>
                      {act.notes && <p className="text-sm text-gray-600 mt-2">{act.notes}</p>}
                    </div>
                  </div>
                ))}
                {stop.activities.length === 0 && <p className="text-gray-500 italic">No specific activities planned.</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicItinerary;
