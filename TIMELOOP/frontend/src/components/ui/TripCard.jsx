import { motion } from 'framer-motion';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const TripCard = ({ trip, onDelete }) => {
  if (!trip) return null;

  const name = trip.title || trip.name || 'Untitled Trip';
  const coverPhoto = trip.coverImage || trip.coverPhoto || null;
  const startDate = trip.startDate;
  const destinationCount = trip.stops?.length || trip._count?.stops || trip.destinationCount || 0;
  const budgetLimit = trip.budget?.totalBudget || trip.totalBudgetGoal || trip.budgetLimit || null;
  const currency = trip.currency || 'USD';

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(trip.endDate);
  let progress = 0;
  if (now >= end) progress = 100;
  else if (now > start) progress = Math.round(((now - start) / (end - start)) * 100);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group"
    >
      <Link to={`/trips/${trip.id}`}>
        <div className="relative h-48">
          {coverPhoto ? (
            <img src={coverPhoto} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-white">
              <MapPinIcon className="w-12 h-12 text-white/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{name}</h3>
            <div className="flex items-center text-sm mt-1 space-x-4">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No dates'}
              </span>
              <span className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {destinationCount} stops
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">Trip Progress</span>
            <span className="text-sm font-bold text-brand-pink-dark">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-brand-pink-dark h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          
          {budgetLimit && (
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" /> Budget
              </span>
              <span className="font-semibold text-gray-700">{currency === 'USD' ? '$' : currency} {budgetLimit.toLocaleString()}</span>
            </div>
          )}
        </div>
      </Link>

      {onDelete && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="absolute top-3 right-3 bg-black/30 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default TripCard;
