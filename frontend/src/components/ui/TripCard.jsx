import { motion } from 'framer-motion';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const TripCard = ({ trip }) => {
  // Mock data if trip is undefined
  const data = trip || {
    id: 1,
    name: 'Summer in Paris',
    coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: '2026-06-15',
    endDate: '2026-06-25',
    destinationCount: 3,
    budgetLimit: 2500,
    progress: 40 // percentage
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/trips/${data.id}`}>
        <div className="relative h-48">
          {data.coverPhoto ? (
            <img 
              src={data.coverPhoto} 
              alt={data.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-pink flex items-center justify-center text-white">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{data.name}</h3>
            <div className="flex items-center text-sm mt-1 space-x-4">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No dates'}
              </span>
              <span className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {data.destinationCount || 0} stops
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">Trip Progress</span>
            <span className="text-sm font-bold text-brand-pink-dark">{data.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-brand-pink-dark h-2 rounded-full" 
              style={{ width: `${data.progress || 0}%` }}
            ></div>
          </div>
          
          {data.budgetLimit && (
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" /> Budget
              </span>
              <span className="font-semibold text-gray-700">${data.budgetLimit.toLocaleString()}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default TripCard;
