import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { tripsAPI, activitiesAPI, budgetsAPI, weatherAPI } from '../api';
import { PlusIcon, TrashIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, CloudIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const ItineraryBuilder = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [weather, setWeather] = useState(null);
  const [showAddSection, setShowAddSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: '', type: 'ACTIVITY', description: '' });
  const [activitySearch, setActivitySearch] = useState('');
  const [activityResults, setActivityResults] = useState([]);
  const [searchingAct, setSearchingAct] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'ACTIVITY', description: '', amount: '', date: '' });

  const CURRENCY_SYMBOLS = { USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ' };

  const fetchTrip = useCallback(async () => {
    try {
      const { data } = await tripsAPI.getById(id);
      if (data.success) {
        setTrip(data.data);
        if (data.data.stops?.[0]?.lat) {
          try {
            const w = await weatherAPI.get(data.data.stops[0].lat, data.data.stops[0].lng);
            if (w.data.success) setWeather(w.data.data);
          } catch {}
        }
      }
    } catch (err) { console.error('Failed to load trip', err); }
    finally { setLoading(false); }
  }, [id]);

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await budgetsAPI.get(id);
      if (data.success) setExpenses(data.data.expenses || []);
    } catch {}
  }, [id]);

  useEffect(() => { fetchTrip(); fetchExpenses(); }, [fetchTrip, fetchExpenses]);

  const searchActivities = async (stop) => {
    if (!stop?.lat) return;
    setSearchingAct(true);
    setActiveStopId(stop.id);
    try {
      const { data } = await activitiesAPI.search({ lat: stop.lat, lng: stop.lng, city: stop.cityName, limit: 10 });
      if (data.success) setActivityResults(data.data.activities || []);
    } catch { setActivityResults([]); }
    finally { setSearchingAct(false); }
  };

  const handleAddSection = async (stopId) => {
    try {
      await tripsAPI.addSection(id, { ...sectionForm, tripStopId: stopId });
      setSectionForm({ title: '', type: 'ACTIVITY', description: '' });
      setShowAddSection(null);
      fetchTrip();
    } catch (err) { console.error('Failed to add section', err); }
  };

  const handleDeleteSection = async (sectionId) => {
    try { await tripsAPI.deleteSection(id, sectionId); fetchTrip(); } catch {}
  };

  const handleAddActivity = async (activity, sectionId) => {
    try {
      await tripsAPI.addActivity(id, {
        sectionId, name: activity.name, description: activity.description || '',
        category: activity.kinds?.split(',')[0] || 'activity',
        cost: activity.cost || null, lat: activity.lat, lng: activity.lng,
        imageUrl: activity.image, externalId: activity.xid,
      });
      fetchTrip();
    } catch (err) { console.error('Failed to add activity', err); }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this stop?')) return;
    try { await tripsAPI.removeStop(id, stopId); fetchTrip(); } catch {}
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await budgetsAPI.addExpense(id, { ...expenseForm, amount: Number(expenseForm.amount) });
      setExpenseForm({ category: 'ACTIVITY', description: '', amount: '', date: '' });
      setShowExpenseForm(false);
      fetchExpenses();
    } catch {}
  };

  const handleDeleteExpense = async (expenseId) => {
    try { await budgetsAPI.deleteExpense(id, expenseId); fetchExpenses(); } catch {}
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink-dark"></div>
    </div>
  );

  if (!trip) return <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">Trip not found.</div>;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const currencySymbol = CURRENCY_SYMBOLS[trip?.currency] || trip?.currency || '$';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1.5" />{new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</span>
            <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1.5" />{trip.stops?.length || 0} stops</span>
          </div>
          {weather?.current && (
            <div className="mt-4 inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100">
              <img src={`https://openweathermap.org/img/wn/${weather.current.icon}.png`} alt="" className="w-8 h-8" />
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter leading-none">Current Weather</p>
                <p className="font-bold">{weather.current.city}: {Math.round(weather.current.temp)}°C, {weather.current.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Link to={`/budget/${trip.id}`}>
            <Button variant="outline" className="bg-white">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" /> Budget
            </Button>
          </Link>
          <Button onClick={() => setShowExpenseForm(!showExpenseForm)}>
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Stops & Activities */}
        <div className="lg:col-span-8 space-y-8">
          {trip.stops?.map((stop, si) => (
            <motion.div key={stop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-800 flex items-center">
                  <div className="w-10 h-10 bg-pink-50 text-brand-pink-dark rounded-xl flex items-center justify-center mr-4">
                    <span className="text-sm font-black">{si + 1}</span>
                  </div>
                  {stop.cityName}
                </h2>
                <button onClick={() => handleDeleteStop(stop.id)} className="text-gray-300 hover:text-rose-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                {stop.sections?.map((section) => (
                  <div key={section.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-700 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-pink-dark mr-2" />
                        {section.title}
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">{section.type}</span>
                      </h3>
                      <button onClick={() => handleDeleteSection(section.id)} className="text-gray-300 hover:text-rose-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="space-y-3">
                      {section.activities?.map((act) => (
                        <div key={act.id} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          {act.imageUrl && <img src={act.imageUrl} alt={act.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />}
                          <div className="flex-grow">
                            <p className="font-bold text-sm text-gray-800">{act.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{act.address || 'Explore nearby'}</p>
                          </div>
                          {act.cost && <span className="text-sm font-black text-gray-900">{currencySymbol}{act.cost}</span>}
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={() => searchActivities(stop)} className="mt-4 w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-pink-dark hover:border-brand-pink-dark transition-all flex items-center justify-center gap-2">
                      <MagnifyingGlassIcon className="w-4 h-4" /> Find Activities in {stop.cityName}
                    </button>
                  </div>
                ))}

                {showAddSection === stop.id ? (
                  <div className="bg-white rounded-2xl p-6 border border-brand-pink-light shadow-lg space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Create New Itinerary Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Section Title (e.g. Morning Coffee)" value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} />
                      <select value={sectionForm.type} onChange={e => setSectionForm({...sectionForm, type: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-brand-pink-dark bg-white text-sm">
                        {['ACCOMMODATION','TRANSPORT','ACTIVITY','FOOD','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAddSection(null)}>Cancel</Button>
                      <Button onClick={() => handleAddSection(stop.id)}>Save Section</Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddSection(stop.id)} className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 text-gray-400 font-bold hover:border-brand-pink-dark hover:text-brand-pink-dark transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Itinerary Group
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Activity Discovery & Expenses */}
        <div className="lg:col-span-4 space-y-8">
          {/* Discovery Panel */}
          {activeStopId && (
            <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-2xl sticky top-24 overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2 text-brand-pink" /> Discovery
                  </h3>
                  <button onClick={() => setActiveStopId(null)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                {searchingAct ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-pink mx-auto" />
                    <p className="mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Searching Places...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {activityResults.map((act) => (
                      <div key={act.xid} className="group bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                        {act.image && <img src={act.image} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />}
                        <h4 className="font-bold text-sm mb-1">{act.name}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 mb-3">{act.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-brand-pink">{currencySymbol}{act.cost}</span>
                          {trip.stops?.find(s => s.id === activeStopId)?.sections?.[0] && (
                            <button 
                              onClick={() => handleAddActivity(act, trip.stops.find(s => s.id === activeStopId).sections[0].id)}
                              className="text-[10px] font-black uppercase tracking-widest bg-brand-pink text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
                            >
                              Add to Trip
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 blur-3xl rounded-full -mr-16 -mt-16" />
            </div>
          )}

          {/* Quick Expenses */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-emerald-500" /> 
              Expense Log
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-2xl text-center mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Logged</p>
                <p className="text-3xl font-black text-gray-900">{currencySymbol}{totalExpenses.toLocaleString()}</p>
              </div>

              {showExpenseForm && (
                <form onSubmit={handleAddExpense} className="bg-gray-50 p-4 rounded-2xl border border-brand-pink-light space-y-3 mb-4">
                  <Input placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} required />
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                    <Button type="submit" className="py-2.5">Add</Button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {expenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-800 truncate">{exp.description || exp.category}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-black text-gray-900 text-sm">{currencySymbol}{exp.amount.toLocaleString()}</span>
                  </div>
                ))}
                {expenses.length > 5 && (
                  <Link to={`/budget/${trip.id}`} className="block text-center text-[10px] font-black text-brand-pink-dark uppercase tracking-widest hover:underline pt-2">
                    View all {expenses.length} expenses
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
