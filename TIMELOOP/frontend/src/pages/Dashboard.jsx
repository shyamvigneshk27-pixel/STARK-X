import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tripsAPI, citiesAPI } from '../api';
import { Link } from 'react-router-dom';
import { PlusIcon, CalendarIcon, MapPinIcon, FireIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      const { data } = await tripsAPI.getAll({ limit: 10 });
      if (data.success) setTrips(data.data.trips);
    } catch (err) { console.error('Failed to fetch trips', err); }
    finally { setLoading(false); }
  }, []);

  const fetchPopular = useCallback(async () => {
    try {
      const { data } = await citiesAPI.popular();
      if (data.success) setPopularCities(data.data.cities);
    } catch (err) { console.error('Failed to fetch popular cities', err); }
    finally { setLoadingPopular(false); }
  }, []);

  useEffect(() => { 
    fetchTrips(); 
    fetchPopular();
  }, [fetchTrips, fetchPopular]);

  const now = new Date();
  const categorize = (trip) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (trip.status === 'COMPLETED' || end < now) return 'past';
    if (trip.status === 'ONGOING' || (start <= now && end >= now)) return 'ongoing';
    return 'upcoming';
  };

  const ongoingTrips = trips.filter(t => categorize(t) === 'ongoing');
  const upcomingTrips = trips.filter(t => categorize(t) === 'upcoming');

  const calcProgress = (trip) => {
    const s = new Date(trip.startDate).getTime(), e = new Date(trip.endDate).getTime(), n = now.getTime();
    if (n >= e) return 100;
    if (n <= s) return 0;
    return Math.round(((n - s) / (e - s)) * 100);
  };

  const TripCard = ({ trip }) => (
    <Link to={`/trips/${trip.id}`}>
      <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex h-32">
        <div className="w-1/3 relative overflow-hidden">
          <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=400&q=80'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="w-2/3 p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-gray-800 line-clamp-1">{trip.title}</h4>
            <div className="flex items-center text-[10px] text-gray-500 mt-1 space-x-2">
              <span className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1" />{new Date(trip.startDate).toLocaleDateString()}</span>
              <span className="flex items-center"><MapPinIcon className="w-3 h-3 mr-1" />{trip.stops?.length || 0} stops</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-400">
              <span>Progress</span>
              <span className="text-brand-pink-dark">{calcProgress(trip)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${calcProgress(trip)}%` }} className="bg-brand-pink-dark h-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  const DestCard = ({ city }) => (
    <Link to={`/create-trip?city=${city.city}`}>
      <motion.div whileHover={{ scale: 1.05 }} className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm group">
        <img src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80`} alt={city.city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">{city.country}</p>
          <h4 className="text-white font-bold text-lg">{city.city}</h4>
          <button className="mt-2 text-white text-xs flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            Plan now <ChevronRightIcon className="w-3 h-3 ml-1" />
          </button>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Hero / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink-dark to-purple-600">{user?.firstName || 'Explorer'}</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Where will your next adventure take you?</p>
        </div>
        <Link to="/create-trip">
          <button className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center shadow-xl shadow-gray-200 hover:-translate-y-1">
            <PlusIcon className="w-5 h-5 mr-2 stroke-[3]" />
            New Journey
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: My Trips */}
        <div className="lg:col-span-8 space-y-10">
          {/* Ongoing Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FireIcon className="w-5 h-5 mr-2 text-orange-500" />
                Active Expeditions
              </h2>
              <Link to="/my-trips" className="text-sm font-bold text-brand-pink-dark hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? [1,2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />) :
               ongoingTrips.length > 0 ? ongoingTrips.map(t => <TripCard key={t.id} trip={t} />) :
               <div className="col-span-2 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                 <p className="text-gray-400 font-medium">No active trips right now.</p>
               </div>
              }
            </div>
          </section>

          {/* Upcoming Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-brand-pink-dark" />
                Coming Up
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? [1,2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />) :
               upcomingTrips.length > 0 ? upcomingTrips.map(t => <TripCard key={t.id} trip={t} />) :
               <div className="col-span-2 py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                 <p className="text-gray-400 font-medium">No upcoming plans yet.</p>
               </div>
              }
            </div>
          </section>
        </div>

        {/* Right Column: Discover */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <SparklesIcon className="w-10 h-10 text-brand-pink mb-4" />
              <h3 className="text-2xl font-bold mb-2">Live Discover</h3>
              <p className="text-gray-400 text-sm mb-6">Trending destinations around the world right now.</p>
              <div className="grid grid-cols-2 gap-4">
                {loadingPopular ? [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-white/10 animate-pulse rounded-2xl" />) :
                 popularCities.slice(0, 4).map(city => <DestCard key={city.id} city={city} />)
                }
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/20 blur-3xl -mr-16 -mt-16 rounded-full" />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4">Travel Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-brand-pink-dark">{trips.length}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Trips</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-blue-600">{[...new Set(trips.flatMap(t => t.stops?.map(s => s.country)))].length}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
