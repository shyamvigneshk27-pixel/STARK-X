import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../api';
import TripCard from '../components/ui/TripCard';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const MyTrips = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await tripsAPI.getAll({ limit: 100 });
        if (data.success) setTrips(data.data.trips);
      } catch (err) { console.error('Failed to fetch trips', err); }
      finally { setLoading(false); }
    };
    fetchTrips();
  }, []);

  const now = new Date();
  const getStatus = (trip) => {
    const end = new Date(trip.endDate);
    if (trip.status === 'COMPLETED' || end < now) return 'past';
    return 'upcoming';
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatus(trip);
    const matchesFilter = filter === 'all' || status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripsAPI.delete(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) { console.error('Failed to delete trip', err); }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
          <p className="text-gray-500">Manage and view all your travel plans.</p>
        </div>
        <Link to="/create-trip">
          <button className="bg-brand-pink-dark text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-pink-500 transition-colors flex items-center shadow-sm">
            <PlusIcon className="w-5 h-5 mr-2" />Plan New Trip
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Search trips..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink-dark focus:border-brand-pink-dark sm:text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FunnelIcon className="w-5 h-5 text-gray-400 hidden sm:block" />
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            {['all', 'upcoming', 'past'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white shadow text-brand-pink-dark' : 'text-gray-600 hover:text-gray-900'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-2 bg-gray-200 rounded" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : filteredTrips.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip, idx) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <TripCard trip={trip} onDelete={() => handleDelete(trip.id)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 mb-1">No trips found</h3>
          <p className="text-gray-500">{trips.length === 0 ? 'Create your first trip to get started!' : 'Try adjusting your search or filters.'}</p>
          {trips.length === 0 && (
            <Link to="/create-trip" className="inline-block mt-4 bg-brand-pink-dark text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600">Plan Your First Trip</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
