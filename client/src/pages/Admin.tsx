import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Map, BarChart2, Zap, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, defs, linearGradient, stop } from 'recharts';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { StatCardSkeleton } from '../components/ui/LoadingSkeleton';
import { formatDate } from '../lib/utils';
import apiClient from '../api/client';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span>{time.toLocaleTimeString()}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-2 border border-white/10 text-sm">
        <p className="text-white/60">{label}</p>
        <p className="text-primary-300 font-bold">{payload[0].value} trips</p>
      </div>
    );
  }
  return null;
};

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/admin/stats'),
      apiClient.get('/api/admin/recent').catch(() => ({ data: [] })),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data);
      setRecent(recentRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const maxTopCity = Math.max(...(stats?.topCities ?? []).map((c: any) => c.count), 1);

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="glass-card p-5 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Platform Analytics</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-white/60 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            <LiveClock />
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-primary-400', trend: '+12%' },
            { label: 'Total Trips', value: stats?.totalTrips ?? 0, icon: Map, color: 'text-blue-400', trend: '+8%' },
            { label: 'Top Cities', value: stats?.topCities?.length ?? 0, icon: Zap, color: 'text-amber-400', trend: '+5%' },
            { label: 'Recent Activity', value: stats?.tripsPerDay?.reduce((s: number, d: any) => s + d.count, 0) ?? 0, icon: TrendingUp, color: 'text-green-400', trend: '+15%' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {kpi.trend}
                </span>
              </div>
              <div className={`text-3xl font-black ${kpi.color}`}>
                <AnimatedCounter value={kpi.value} />
              </div>
              <div className="text-xs text-white/40 mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trips per day */}
          {stats?.tripsPerDay?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4">Trips Created (30 days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.tripsPerDay} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#9090aa', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#9090aa', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top cities */}
          {stats?.topCities?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4">Top Destinations</h2>
              <div className="space-y-3">
                {stats.topCities.slice(0, 8).map((city: any, i: number) => (
                  <div key={city.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600/30 flex items-center justify-center text-[10px] font-bold text-primary-300 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white truncate">{city.name}</span>
                        <span className="text-xs text-white/40 ml-2">{city.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                          style={{ width: `${(city.count / maxTopCity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        {recent.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-bold text-white">Recent Activity</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Trip</th>
                    <th className="text-right px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.id} className="border-t border-white/5 hover:bg-white/2">
                      <td className="px-5 py-3 text-white/80">{row.userName}</td>
                      <td className="px-5 py-3 text-white">{row.tripName}</td>
                      <td className="px-5 py-3 text-right text-white/40 text-xs">
                        {formatDate(row.createdAt, 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
