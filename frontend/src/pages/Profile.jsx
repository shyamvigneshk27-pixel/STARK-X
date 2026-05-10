import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PencilSquareIcon, MapPinIcon, GlobeAltIcon, CameraIcon } from '@heroicons/react/24/outline';
import TripCard from '../components/ui/TripCard';

const Profile = () => {
  const { user } = useContext(AuthContext);

  // Demo Data from Excalidraw logic
  const preplannedTrips = [
    { id: 1, name: 'Euro Trip 2026', startDate: '2026-07-10', endDate: '2026-07-28', destinationCount: 5, budgetLimit: 4000, progress: 20, status: 'upcoming', coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Bali Retreat', startDate: '2026-09-05', endDate: '2026-09-15', destinationCount: 1, budgetLimit: 1500, progress: 85, status: 'upcoming', coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  const previousTrips = [
    { id: 3, name: 'Tokyo Sakura', startDate: '2025-03-25', endDate: '2025-04-10', destinationCount: 3, budgetLimit: 3000, progress: 100, status: 'past', coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'New York Weekend', startDate: '2025-11-20', endDate: '2025-11-23', destinationCount: 1, budgetLimit: 800, progress: 100, status: 'past', coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-10">
        <div className="h-48 bg-gradient-to-r from-pink-400 via-brand-pink-dark to-purple-500 relative">
          <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-full font-medium flex items-center transition-colors text-sm">
            <CameraIcon className="w-4 h-4 mr-2" /> Change Cover
          </button>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-brand-pink text-white flex items-center justify-center text-5xl font-bold shadow-lg overflow-hidden">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 text-gray-600 border border-gray-100">
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-grow mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Traveler'}</h1>
              <p className="text-gray-500 text-lg">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm font-medium text-gray-600">
                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <MapPinIcon className="w-4 h-4 mr-1.5 text-brand-pink-dark" />
                  San Francisco, CA
                </span>
                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <GlobeAltIcon className="w-4 h-4 mr-1.5 text-blue-500" />
                  12 Countries Visited
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="mb-2">
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center shadow-md">
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Excalidraw specific dual-grid: Preplanned vs Previous */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Preplanned Trips Section */}
        <div>
          <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Preplanned Trips</h2>
              <p className="text-gray-500 text-sm mt-1">Upcoming adventures you are planning.</p>
            </div>
            <button className="text-brand-pink-dark font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {preplannedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>

        {/* Previous Trips Section */}
        <div>
          <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Previous Trips</h2>
              <p className="text-gray-500 text-sm mt-1">Your past travels and memories.</p>
            </div>
            <button className="text-brand-pink-dark font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {previousTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
