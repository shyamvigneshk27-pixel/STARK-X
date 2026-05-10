import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { budgetsAPI, currencyAPI, tripsAPI } from '../api';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon, ArrowPathIcon, BanknotesIcon, ChartPieIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TripBudget = () => {
  const { tripId } = useParams();
  const [budgetData, setBudgetData] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ date: '', category: 'FOOD', description: '', amount: '' });

  const categories = ['ACCOMMODATION', 'TRANSPORT', 'FOOD', 'ACTIVITY', 'SHOPPING', 'HEALTH', 'ENTERTAINMENT', 'OTHER'];
  const categoryColors = {
    'ACCOMMODATION': 'bg-indigo-500', 'TRANSPORT': 'bg-cyan-500', 'FOOD': 'bg-rose-500',
    'ACTIVITY': 'bg-amber-500', 'SHOPPING': 'bg-fuchsia-500', 'HEALTH': 'bg-emerald-500',
    'ENTERTAINMENT': 'bg-violet-500', 'OTHER': 'bg-slate-400',
  };

  const CURRENCY_SYMBOLS = { USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ' };

  const fetchData = useCallback(async () => {
    if (!tripId) return;
    try {
      const [bRes, tRes] = await Promise.all([
        budgetsAPI.get(tripId),
        tripsAPI.getById(tripId)
      ]);
      if (bRes.data.success) setBudgetData(bRes.data.data);
      if (tRes.data.success) setTrip(tRes.data.data);
    } catch (err) { console.error('Failed to fetch budget data', err); }
    finally { setLoading(false); }
  }, [tripId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await currencyAPI.rates(trip?.currency || 'USD');
        if (data.success) setRates(data.data.rates);
      } catch {}
    };
    if (trip?.currency) fetchRates();
  }, [trip?.currency]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await budgetsAPI.addExpense(tripId, { ...newExpense, amount: Number(newExpense.amount), date: newExpense.date || undefined });
      setNewExpense({ date: '', category: 'FOOD', description: '', amount: '' });
      setIsAdding(false);
      fetchData();
    } catch (err) { console.error('Failed to add expense', err); }
  };

  const removeExpense = async (expenseId) => {
    try { await budgetsAPI.deleteExpense(tripId, expenseId); fetchData(); } catch {}
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink-dark"></div>
    </div>
  );

  const budget = budgetData?.budget || {};
  const estimated = budgetData?.estimated || {};
  const totalBudget = budget.totalBudget || estimated.totalBudget || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const expenses = budgetData?.expenses || [];
  const byCategory = budgetData?.byCategory || {};
  const currencySymbol = CURRENCY_SYMBOLS[trip?.currency] || trip?.currency || '$';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <nav className="flex items-center text-sm text-gray-500 mb-2">
            <Link to="/my-trips" className="hover:text-brand-pink-dark">My Trips</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{trip?.title}</span>
          </nav>
          <h1 className="text-4xl font-black text-gray-900">Budget Analytics</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} className="bg-white"><ArrowPathIcon className="w-5 h-5" /></Button>
          <Button onClick={() => setIsAdding(true)} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Expense
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Available Funds</p>
              <h3 className={`text-4xl font-black ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
                {currencySymbol}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-sm ml-1 font-medium">{isOverBudget ? 'Over' : 'Left'}</span>
              </h3>
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Target Budget</span>
                  <span className="font-bold text-gray-800">{currencySymbol}{totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Current Spending</span>
                  <span className="font-bold text-gray-800">{currencySymbol}{totalSpent.toLocaleString()}</span>
                </div>
                <div className="pt-4">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${spentPct}%` }}
                      className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-brand-pink-dark'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <ChartPieIcon className="w-6 h-6 mr-2 text-brand-pink" />
              Category Split
            </h3>
            <div className="space-y-4">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-400">{cat}</span>
                    <span>{currencySymbol}{amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${categoryColors[cat] || 'bg-gray-400'}`}
                      style={{ width: `${(amount / totalSpent) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-gray-500 text-center py-6 text-sm">No category data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Expenses */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <ListBulletIcon className="w-7 h-7 mr-3 text-brand-pink-dark" />
              Recent Transactions
            </h3>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 bg-pink-50/30 border-b border-gray-100"
              >
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input 
                      label="Expense Name" 
                      placeholder="e.g., Dinner at Eiffel Tower" 
                      value={newExpense.description} 
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Category</label>
                      <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-brand-pink-dark bg-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <Input label={`Amount (${currencySymbol})`} type="number" step="0.01" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
                  <div className="flex items-end justify-end gap-3 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Discard</Button>
                    <Button type="submit">Log Expense</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="p-6 border-b border-gray-100">Date</th>
                  <th className="p-6 border-b border-gray-100">Description</th>
                  <th className="p-6 border-b border-gray-100">Category</th>
                  <th className="p-6 border-b border-gray-100 text-right">Amount</th>
                  <th className="p-6 border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 group border-b border-gray-50 last:border-0 transition-colors">
                    <td className="p-6 text-sm text-gray-500 whitespace-nowrap">{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                    <td className="p-6">
                      <p className="text-sm text-gray-900 font-bold">{exp.description || 'Untitled Transaction'}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${categoryColors[exp.category] || 'bg-gray-400'}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-gray-900 font-black text-right">{currencySymbol}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-rose-500 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <BanknotesIcon className="w-16 h-16 mx-auto text-gray-100 mb-4" />
                      <p className="text-gray-400 font-medium">No transactions recorded yet.</p>
                      <button onClick={() => setIsAdding(true)} className="text-brand-pink-dark font-bold mt-2 hover:underline">Log your first expense</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBudget;
