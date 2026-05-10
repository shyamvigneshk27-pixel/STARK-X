import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, MapPin, Calendar, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { formatCurrency, cn } from '../../lib/utils';
import apiClient from '../../api/client';

interface Props {
  tripId: string;
  totalBudget: number;
}

const COLORS = ['#7c3aed', '#60a5fa', '#f472b6', '#34d399', '#fb923c', '#a78bfa', '#38bdf8'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-2 border border-white/10 text-sm">
        <p className="text-white/60">{label}</p>
        <p className="text-white font-bold">${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function BudgetDashboard({ tripId, totalBudget }: Props) {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    apiClient.get(`/api/budget/${tripId}`).then(r => {
      setBudget(r.data);
      if (r.data.grandTotal > 0 && r.data.grandTotal < r.data.budget) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 4000);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return <div className="h-64 shimmer-bg rounded-2xl animate-pulse" />;
  }

  if (!budget) {
    return (
      <div className="text-center py-12 text-white/40">
        <DollarSign className="w-10 h-10 mx-auto mb-3" />
        <p>No budget data yet. Add activities to track expenses.</p>
      </div>
    );
  }

  const usagePercent = totalBudget > 0 ? Math.min((budget.grandTotal / totalBudget) * 100, 100) : 0;
  const tips: string[] = [];
  if (budget.overBudget) tips.push(`You're $${Math.abs(budget.remaining).toLocaleString()} over budget. Consider removing some expensive activities.`);
  if (budget.byCategory?.find((c: any) => c.name === 'food' && c.value > totalBudget * 0.4)) {
    tips.push('Food costs are above 40% of your budget. Look for local eateries!');
  }
  if (budget.avgPerDay > 0 && totalBudget > 0 && budget.avgPerDay > totalBudget / 14) {
    tips.push('Daily spend is high. Try mixing premium days with budget days.');
  }

  return (
    <>
      {confetti && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#7c3aed', '#a78bfa', '#60a5fa', '#f472b6']}
          style={{ zIndex: 9999 }}
        />
      )}

      <div className="space-y-6">
        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spent', value: budget.grandTotal, icon: DollarSign, color: 'text-primary-400', prefix: '$' },
            { label: 'Budget', value: budget.budget, icon: Zap, color: 'text-blue-400', prefix: '$' },
            { label: 'Remaining', value: Math.abs(budget.remaining), icon: budget.overBudget ? TrendingDown : TrendingUp, color: budget.overBudget ? 'text-red-400' : 'text-green-400', prefix: budget.overBudget ? '-$' : '$' },
            { label: 'Avg / Day', value: budget.avgPerDay, icon: Calendar, color: 'text-amber-400', prefix: '$' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4">
              <div className={cn('w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-3', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn('text-2xl font-bold', stat.color)}>
                <AnimatedCounter value={stat.value} prefix={stat.prefix} decimals={0} />
              </div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">Budget Usage</h3>
            <span className={cn('text-sm font-bold', budget.overBudget ? 'text-red-400' : 'text-green-400')}>
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000', budget.overBudget ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-primary-600 to-primary-400 shadow-glow')}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>$0</span>
            <span>${totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          {budget.byCategory?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={budget.byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {budget.byCategory.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar Chart */}
          {budget.byStop?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">By City</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={budget.byStop} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="city" tick={{ fill: '#9090aa', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9090aa', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                    {budget.byStop.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Per-stop breakdown */}
        {budget.byStop?.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-semibold text-white">Per-Stop Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">City</th>
                    <th className="text-right px-5 py-3">Nights</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="text-right px-5 py-3">Per Day</th>
                    <th className="text-right px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.byStop.map((stop: any) => (
                    <tr key={stop.city} className="border-t border-white/5 hover:bg-white/2">
                      <td className="px-5 py-3 text-white font-medium">{stop.city}</td>
                      <td className="px-5 py-3 text-right text-white/60">{stop.nights}</td>
                      <td className="px-5 py-3 text-right text-white">{formatCurrency(stop.total)}</td>
                      <td className="px-5 py-3 text-right text-white/80">{formatCurrency(stop.perDay)}/day</td>
                      <td className="px-5 py-3 text-right">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border', stop.overspent ? 'bg-red-500/15 text-red-300 border-red-500/30' : 'bg-green-500/15 text-green-300 border-green-500/30')}>
                          {stop.overspent ? 'Over' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Budget tips */}
        {tips.length > 0 && (
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="glass rounded-xl p-4 border border-amber-500/20 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">{tip}</p>
              </div>
            ))}
          </div>
        )}

        {!budget.overBudget && budget.grandTotal > 0 && (
          <div className="glass rounded-xl p-4 border border-green-500/20 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-300">You're on budget! You have {formatCurrency(budget.remaining)} remaining.</p>
          </div>
        )}
      </div>
    </>
  );
}
