import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Demo data for Excalidraw 3-column layout
  const ongoingTrips = [
    { id: 1, name: 'Euro Trip 2026', startDate: '2026-07-10', endDate: '2026-07-28', destinationCount: 5, progress: 20, coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
  ];
  
  const upcomingTrips = [
    { id: 2, name: 'Bali Retreat', startDate: '2026-09-05', endDate: '2026-09-15', destinationCount: 1, progress: 0, coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  ];

  const pastTrips = [
    { id: 3, name: 'Tokyo Sakura', startDate: '2025-03-25', endDate: '2025-04-10', destinationCount: 3, progress: 100, coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
    { id: 4, name: 'New York Weekend', startDate: '2025-11-20', endDate: '2025-11-23', destinationCount: 1, progress: 100, coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
  ];

  // Component for the "Short Overview" card
  const TripOverviewCard = ({ trip }) => (
    <Link to={`/trips/${trip.id}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
      >
        <div className="h-32 relative overflow-hidden">
          <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <h4 className="font-bold text-base leading-tight">{trip.name}</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1 text-brand-pink-dark" />
              <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-3.5 h-3.5 mr-1 text-brand-pink-dark" />
              <span>{trip.destinationCount} stops</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-bold text-brand-pink-dark">{trip.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${trip.progress}%` }}
                className="bg-brand-pink-dark h-full rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, <span className="text-brand-pink-dark">{user?.name?.split(' ')[0] || 'Traveler'}</span>!
          </h1>
          <p className="text-gray-500 mt-1">Here is the overview of your travel plans.</p>
        </div>
        <Link to="/create-trip">
          <button className="bg-brand-pink-dark text-white px-5 py-2.5 rounded-full font-semibold hover:bg-pink-600 transition-colors flex items-center shadow-md shadow-pink-500/40 hover:-translate-y-0.5 hover:shadow-pink-500/60">
            <PlusIcon className="w-5 h-5 mr-2" />
            Plan New Trip
          </button>
        </Link>
      </div>

      {/* Excalidraw 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Column 1: Ongoing Trips */}
        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Ongoing Trips
            </h2>
            <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded-full shadow-sm">{ongoingTrips.length}</span>
          </div>
          
          <div className="space-y-4">
            {ongoingTrips.length > 0 ? (
              ongoingTrips.map(trip => <TripOverviewCard key={trip.id} trip={trip} />)
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No ongoing trips.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Upcoming Trips */}
        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink-dark mr-2"></span>
              Upcoming Trips
            </h2>
            <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded-full shadow-sm">{upcomingTrips.length}</span>
          </div>
          
          <div className="space-y-4">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => <TripOverviewCard key={trip.id} trip={trip} />)
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No upcoming trips.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Past Trips */}
        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2"></span>
              Past Trips
            </h2>
            <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded-full shadow-sm">{pastTrips.length}</span>
          </div>
          
          <div className="space-y-4">
            {pastTrips.length > 0 ? (
              pastTrips.map(trip => <TripOverviewCard key={trip.id} trip={trip} />)
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No past trips.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
