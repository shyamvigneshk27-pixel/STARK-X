import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { PhotoIcon, GlobeAsiaAustraliaIcon, LockClosedIcon, UsersIcon } from '@heroicons/react/24/outline';

const CreateTrip = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    budgetLimit: '',
    privacy: 'private',
    type: 'leisure'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.from('trips').insert({
        user_id: user.id,
        name: formData.name,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget_limit: formData.budgetLimit ? parseFloat(formData.budgetLimit) : 0,
        status: 'upcoming', // Default for new trips
        cover_photo: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80' // Default
      }).select().single();

      if (error) throw error;

      // Navigate to itinerary builder for the new trip
      navigate(`/itinerary/${data.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      alert('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 md:p-10"
      >
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan a New Trip</h1>
          <p className="text-gray-500 mt-2">Start your journey by defining the basics.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Photo Upload (Mock) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand-pink-dark transition-colors bg-gray-50 cursor-pointer">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative rounded-md font-medium text-brand-pink-dark hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-pink">
                    <span>Upload a file</span>
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input 
                label="Trip Name" 
                id="name" 
                placeholder="e.g., Summer Backpacking in Europe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <Input 
              label="Start Date" 
              id="startDate" 
              type="date" 
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            
            <Input 
              label="End Date" 
              id="endDate" 
              type="date" 
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
              <select 
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark bg-white"
              >
                <option value="leisure">Leisure & Vacation</option>
                <option value="adventure">Adventure & Outdoors</option>
                <option value="business">Business Trip</option>
                <option value="family">Family Gathering</option>
                <option value="roadtrip">Road Trip</option>
              </select>
            </div>

            <Input 
              label="Budget Limit (Optional)" 
              id="budgetLimit" 
              type="number" 
              placeholder="e.g., 3000"
              value={formData.budgetLimit}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Goals</label>
            <textarea 
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="What are you hoping to experience on this trip?"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark resize-none"
            ></textarea>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Privacy Settings</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center transition-colors ${formData.privacy === 'private' ? 'border-brand-pink-dark bg-brand-pink-light/30 ring-1 ring-brand-pink-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="privacy" value="private" className="sr-only" checked={formData.privacy === 'private'} onChange={handleChange} />
                <LockClosedIcon className={`w-8 h-8 mb-2 ${formData.privacy === 'private' ? 'text-brand-pink-dark' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-900">Private</span>
                <span className="text-xs text-gray-500 mt-1">Only you can see this trip</span>
              </label>

              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center transition-colors ${formData.privacy === 'friends' ? 'border-brand-pink-dark bg-brand-pink-light/30 ring-1 ring-brand-pink-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="privacy" value="friends" className="sr-only" checked={formData.privacy === 'friends'} onChange={handleChange} />
                <UsersIcon className={`w-8 h-8 mb-2 ${formData.privacy === 'friends' ? 'text-brand-pink-dark' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-900">Friends Only</span>
                <span className="text-xs text-gray-500 mt-1">Shared with invited people</span>
              </label>

              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center transition-colors ${formData.privacy === 'public' ? 'border-brand-pink-dark bg-brand-pink-light/30 ring-1 ring-brand-pink-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="privacy" value="public" className="sr-only" checked={formData.privacy === 'public'} onChange={handleChange} />
                <GlobeAsiaAustraliaIcon className={`w-8 h-8 mb-2 ${formData.privacy === 'public' ? 'text-brand-pink-dark' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-900">Public</span>
                <span className="text-xs text-gray-500 mt-1">Visible to Traveloop community</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit">
              Save & Continue
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTrip;
