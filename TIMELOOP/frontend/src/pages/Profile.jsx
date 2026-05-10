import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tripsAPI, usersAPI } from '../api';
import { 
  PencilSquareIcon, MapPinIcon, GlobeAltIcon, CameraIcon, CheckIcon, 
  UserCircleIcon, ShieldCheckIcon, HeartIcon, TrophyIcon, 
  PhotoIcon, ArrowUpTrayIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import TripCard from '../components/ui/TripCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');
  
  const [editForm, setEditForm] = useState({ 
    firstName: '', lastName: '', phone: '', city: '', country: '', bio: '' 
  });

  const fetchTrips = useCallback(async () => {
    try {
      const { data } = await tripsAPI.getAll({ limit: 50 });
      if (data.success) setTrips(data.data.trips);
    } catch {}
    finally { setLoadingTrips(false); }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        phone: user.phone || '', city: user.city || '',
        country: user.country || '', bio: user.bio || '',
      });
      setAvatarInput(user.avatarUrl || '');
    }
  }, [user]);

  const now = new Date();
  const upcoming = trips.filter(t => new Date(t.endDate) >= now && t.status !== 'COMPLETED');
  const past = trips.filter(t => new Date(t.endDate) < now || t.status === 'COMPLETED');
  const countries = [...new Set(trips.flatMap(t => (t.stops || []).map(s => s.country).filter(Boolean)))];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await usersAPI.updateMe(editForm);
      if (data.success) {
        updateUser({ ...editForm, name: `${editForm.firstName} ${editForm.lastName}` });
        setEditing(false);
      }
    } catch (err) { console.error('Update failed', err); }
    finally { setSaving(false); }
  };

  const handleUpdateAvatar = async () => {
    setSaving(true);
    try {
      const { data } = await usersAPI.updateAvatar(avatarInput);
      if (data.success) {
        updateUser({ avatarUrl: avatarInput });
        setShowAvatarModal(false);
      }
    } catch (err) { console.error('Avatar update failed', err); }
    finally { setSaving(false); }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-3 border-b-2 font-bold text-sm transition-all ${
        activeTab === id ? 'border-brand-pink-dark text-brand-pink-dark' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Premium Header */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-brand-pink via-brand-pink-dark to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 gap-8">
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center text-6xl font-black text-brand-pink-dark">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (user?.firstName?.charAt(0) || 'U')}
              </div>
              <button 
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-4 right-4 bg-gray-900 text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center md:text-left flex-grow space-y-2 mb-2">
              <h1 className="text-4xl font-black text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 font-medium">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="bg-pink-50 text-brand-pink-dark px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <TrophyIcon className="w-3.5 h-3.5 mr-1.5" /> Explorer Level 4
                </span>
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <GlobeAltIcon className="w-3.5 h-3.5 mr-1.5" /> {countries.length} Countries
                </span>
                <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <HeartIcon className="w-3.5 h-3.5 mr-1.5" /> 12 Favorites
                </span>
              </div>
            </div>

            <div className="mb-2">
              <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'primary'} className="rounded-2xl px-8">
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 px-6">
              <TabButton id="overview" label="Overview" icon={GlobeAltIcon} />
              <TabButton id="trips" label="My Trips" icon={MapPinIcon} />
              <TabButton id="settings" label="Account" icon={ShieldCheckIcon} />
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                      <Input label="Last Name" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                      <Input label="Phone" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      <Input label="City" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                      <Input label="Country" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio / Travel Mission</label>
                      <textarea 
                        value={editForm.bio} 
                        onChange={e => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-brand-pink-dark h-32 resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                    {activeTab === 'overview' && (
                      <div className="space-y-8">
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">About Me</h3>
                          <p className="text-gray-700 leading-relaxed text-lg italic">
                            "{user?.bio || "No bio yet. Tell the community about your travel style!"}"
                          </p>
                        </section>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{trips.length}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Trips</p>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{upcoming.length}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Planned</p>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{past.length}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Completed</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'trips' && (
                      <div className="space-y-10">
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Upcoming Adventures</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {upcoming.map(t => <TripCard key={t.id} trip={t} />)}
                            {upcoming.length === 0 && <p className="text-gray-400 text-sm">No upcoming trips.</p>}
                          </div>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Past Memories</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {past.map(t => <TripCard key={t.id} trip={t} />)}
                            {past.length === 0 && <p className="text-gray-400 text-sm">No past trips.</p>}
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="space-y-8 max-w-md">
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Security</h3>
                          <Button variant="outline" className="w-full justify-start rounded-2xl py-4">
                            <ShieldCheckIcon className="w-5 h-5 mr-3" /> Change Password
                          </Button>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Data</h3>
                          <Button variant="outline" className="w-full justify-start rounded-2xl py-4 text-red-600 hover:bg-red-50 hover:border-red-200">
                            <TrashIcon className="w-5 h-5 mr-3" /> Delete Account
                          </Button>
                        </section>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Badges & Friends */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold mb-6">Travel Badges</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-help" title={`Badge ${i}`}>
                  <TrophyIcon className="w-8 h-8 text-gray-300" />
                </div>
              ))}
              <div className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300">
                +8
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Travel Pulse</h3>
            <p className="text-gray-400 text-sm mb-6">Your travel frequency is in the top 15% this year!</p>
            <div className="h-32 flex items-end gap-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-grow bg-brand-pink/20 rounded-t-lg relative group">
                  <div className="absolute bottom-0 w-full bg-brand-pink rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Jan</span>
              <span>Jul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Update Profile Photo</h2>
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-[2rem] bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-gray-50">
                    {avatarInput ? (
                      <img src={avatarInput} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                </div>
                <Input 
                  label="Image URL" 
                  placeholder="https://images.unsplash.com/..." 
                  value={avatarInput} 
                  onChange={e => setAvatarInput(e.target.value)} 
                />
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAvatarModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleUpdateAvatar} disabled={saving}>
                    {saving ? 'Updating...' : 'Save Photo'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
