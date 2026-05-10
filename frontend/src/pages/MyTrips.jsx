import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TripCard from '../components/ui/TripCard';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const MyTrips = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Demo Data for UI Template
  const trips = [
    { id: 1, name: 'Euro Trip 2026', startDate: '2026-07-10', endDate: '2026-07-28', destinationCount: 5, budgetLimit: 4000, progress: 20, status: 'upcoming', coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Bali Retreat', startDate: '2026-09-05', endDate: '2026-09-15', destinationCount: 1, budgetLimit: 1500, progress: 85, status: 'upcoming', coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Tokyo Sakura', startDate: '2025-03-25', endDate: '2025-04-10', destinationCount: 3, budgetLimit: 3000, progress: 100, status: 'past', coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'New York Weekend', startDate: '2025-11-20', endDate: '2025-11-23', destinationCount: 1, budgetLimit: 800, progress: 100, status: 'past', coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || trip.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
          <p className="text-gray-500">Manage and view all your travel plans.</p>
        </div>
        
        <Link to="/create-trip">
          <button className="bg-brand-pink-dark text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-pink-500 transition-colors flex items-center shadow-sm">
            <PlusIcon className="w-5 h-5 mr-2" />
            Plan New Trip
          </button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search trips..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink-dark focus:border-brand-pink-dark sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FunnelIcon className="w-5 h-5 text-gray-400 hidden sm:block" />
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            {['all', 'upcoming', 'past'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-white shadow text-brand-pink-dark' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredTrips.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredTrips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 mb-1">No trips found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
