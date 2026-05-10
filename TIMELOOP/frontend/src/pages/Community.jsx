import { useState, useEffect } from 'react';
import { communityAPI } from '../api';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const TRIP_TYPE_LABELS = {
  ADVENTURE: '🏔️ Adventure', CULTURAL: '🏛️ Cultural', BEACH: '🏖️ Beach', BUSINESS: '💼 Business',
  FAMILY: '👨‍👩‍👧 Family', HONEYMOON: '💕 Honeymoon', BUDGET: '💰 Budget', LUXURY: '✨ Luxury',
  ROAD_TRIP: '🚗 Road Trip', SOLO: '🧳 Solo',
};

const Community = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await communityAPI.feed(params);
      if (data.success) {
        setTrips(data.data.trips);
        setTotalPages(data.data.pages);
      }
    } catch (err) { console.error('Failed to fetch community feed', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFeed(); }, [page, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFeed();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-800">Community</h1>
        <p className="text-gray-500">Discover shared itineraries from fellow travelers.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips (e.g., Paris, Japan...)" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark text-sm" />
        </form>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:border-brand-pink-dark">
          <option value="">All Types</option>
          {Object.entries(TRIP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, idx) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link to={`/trips/${trip.id}`} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-40 relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                    {trip.coverImage && <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-bold text-lg leading-tight">{trip.title}</h3>
                      <span className="text-xs opacity-80">{TRIP_TYPE_LABELS[trip.type] || trip.type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {trip.user?.avatarUrl ? (
                        <img src={trip.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">{trip.user?.firstName} {trip.user?.lastName}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="flex items-center"><CalendarIcon className="w-3.5 h-3.5 mr-1" />{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center"><MapPinIcon className="w-3.5 h-3.5 mr-1" />{trip._count?.stops || trip.stops?.length || 0} stops</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 mb-1">No shared trips found</h3>
          <p className="text-gray-500">Be the first to share your itinerary with the community!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-brand-pink-dark text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-pink-dark'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
