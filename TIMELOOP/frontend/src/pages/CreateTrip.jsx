import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { tripsAPI, citiesAPI } from '../api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { MapPinIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TRIP_TYPES = [
  { value: 'ADVENTURE', label: 'Adventure & Outdoors' },
  { value: 'CULTURAL', label: 'Cultural Experience' },
  { value: 'BEACH', label: 'Beach & Relaxation' },
  { value: 'BUSINESS', label: 'Business Trip' },
  { value: 'FAMILY', label: 'Family Gathering' },
  { value: 'HONEYMOON', label: 'Honeymoon' },
  { value: 'BUDGET', label: 'Budget Travel' },
  { value: 'LUXURY', label: 'Luxury Getaway' },
  { value: 'ROAD_TRIP', label: 'Road Trip' },
  { value: 'SOLO', label: 'Solo Travel' },
];

const BUDGET_PREFS = [
  { value: 'BUDGET', label: 'Budget', desc: '$30–70/day' },
  { value: 'MODERATE', label: 'Moderate', desc: '$100–200/day' },
  { value: 'COMFORT', label: 'Comfort', desc: '$200–400/day' },
  { value: 'LUXURY', label: 'Luxury', desc: '$500+/day' },
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', startDate: '', endDate: '', description: '',
    totalBudgetGoal: '', type: 'ADVENTURE', budgetPreference: 'MODERATE',
    travelersCount: 1, currency: 'USD', isPublic: false,
  });
  const [stops, setStops] = useState([]);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [searchingCities, setSearchingCities] = useState(false);

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id || name]: type === 'checkbox' ? checked : value }));
  };

  const searchCities = useCallback(async (q) => {
    if (q.length < 2) { setCityResults([]); return; }
    setSearchingCities(true);
    try {
      const { data } = await citiesAPI.search(q, 8);
      if (data.success) setCityResults(data.data.cities);
    } catch { setCityResults([]); }
    finally { setSearchingCities(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCities(cityQuery), 400);
    return () => clearTimeout(timer);
  }, [cityQuery, searchCities]);

  const addStop = (city) => {
    setStops(prev => [...prev, {
      cityName: city.city, cityCode: city.id?.toString(),
      country: city.country, countryCode: city.countryCode,
      lat: city.lat, lng: city.lng,
    }]);
    setCityQuery('');
    setCityResults([]);
  };

  const removeStop = (idx) => setStops(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Please fill in trip name and dates.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, travelersCount: Number(formData.travelersCount), stops };
      const { data } = await tripsAPI.create(payload);
      if (data.success) navigate(`/trips/${data.data.id}`);
      else setError(data.message || 'Failed to create trip.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip.');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan a New Trip</h1>
          <p className="text-gray-500 mt-2">Start your journey by defining the basics.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Trip Name" id="title" placeholder="e.g., Summer Backpacking in Europe" value={formData.title} onChange={handleChange} required />
            </div>
            <Input label="Start Date" id="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            <Input label="End Date" id="endDate" type="date" value={formData.endDate} onChange={handleChange} required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
              <select id="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark bg-white">
                {TRIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <Input label="Travelers" id="travelersCount" type="number" min="1" max="50" value={formData.travelersCount} onChange={handleChange} />
          </div>

          {/* Budget Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Budget Preference</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUDGET_PREFS.map(bp => (
                <label key={bp.value} className={`cursor-pointer border rounded-xl p-4 text-center transition-colors ${formData.budgetPreference === bp.value ? 'border-brand-pink-dark bg-pink-50 ring-1 ring-brand-pink-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="budgetPreference" value={bp.value} className="sr-only" checked={formData.budgetPreference === bp.value} onChange={(e) => setFormData(p => ({ ...p, budgetPreference: e.target.value }))} />
                  <span className="font-semibold text-gray-900 block">{bp.label}</span>
                  <span className="text-xs text-gray-500">{bp.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Destination Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinations</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input type="text" value={cityQuery} onChange={e => setCityQuery(e.target.value)} placeholder="Search cities (e.g., Paris, Tokyo, Bali...)" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark" />
              {searchingCities && <div className="absolute right-3 top-2.5"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-pink-dark" /></div>}
            </div>
            {cityResults.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 relative">
                {cityResults.map((city, i) => (
                  <button key={`${city.id}-${i}`} type="button" onClick={() => addStop(city)} className="w-full text-left px-4 py-3 hover:bg-pink-50 flex items-center gap-3 border-b border-gray-50 last:border-0">
                    <MapPinIcon className="w-5 h-5 text-brand-pink-dark flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-800">{city.city}</span>
                      <span className="text-gray-500 text-sm ml-2">{city.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {stops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {stops.map((stop, idx) => (
                  <span key={idx} className="inline-flex items-center bg-pink-50 text-brand-pink-dark px-3 py-1.5 rounded-full text-sm font-medium border border-pink-200">
                    <MapPinIcon className="w-4 h-4 mr-1.5" />{stop.cityName}, {stop.countryCode}
                    <button type="button" onClick={() => removeStop(idx)} className="ml-2 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Goals</label>
            <textarea id="description" rows={3} value={formData.description} onChange={handleChange} placeholder="What are you hoping to experience on this trip?" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark focus:ring-1 focus:ring-brand-pink-dark resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Budget Goal (optional)" id="totalBudgetGoal" type="number" placeholder="e.g., 3000" value={formData.totalBudgetGoal} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select id="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark bg-white">
                {['USD','EUR','GBP','JPY','INR','AED','THB','AUD','CAD','SGD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Trip'}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTrip;
