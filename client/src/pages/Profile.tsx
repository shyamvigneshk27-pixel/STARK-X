import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Save, User, Globe, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/Toast';
import { getInitials } from '../lib/utils';
import apiClient from '../api/client';

export default function Profile() {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [language, setLanguage] = useState(user?.language ?? 'en');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.patch('/api/auth/profile', { name, language });
      setAuth(res.data, token ?? '');
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black text-white mb-8">Profile Settings</h1>

        {/* Avatar */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-black text-2xl shadow-glow">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} className="w-full h-full rounded-2xl object-cover" alt="" />
              : getInitials(user?.name ?? 'U')
            }
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />{user?.email}
            </p>
            {user?.isAdmin && (
              <span className="text-[10px] font-bold bg-primary-600/30 text-primary-300 border border-primary-500/30 px-2 py-0.5 rounded-full mt-2 inline-block">
                ADMIN
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="font-bold text-white text-lg">Edit Profile</h3>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Display Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="input-glass"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-glass bg-transparent">
              <option value="en" className="bg-gray-900">English</option>
              <option value="es" className="bg-gray-900">Spanish</option>
              <option value="fr" className="bg-gray-900">French</option>
              <option value="de" className="bg-gray-900">German</option>
              <option value="ja" className="bg-gray-900">Japanese</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
