import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TripBudget = () => {
  const [budgetLimit, setBudgetLimit] = useState(4000);
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-06-10', category: 'Flights', description: 'Roundtrip tickets', amount: 1200 },
    { id: 2, date: '2026-06-15', category: 'Accommodation', description: 'Airbnb Paris 4 nights', amount: 800 },
    { id: 3, date: '2026-06-16', category: 'Activities', description: 'Louvre Tickets', amount: 45 },
    { id: 4, date: '2026-06-16', category: 'Food', description: 'Dinner at Le Jules Verne', amount: 250 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ date: '', category: 'Food', description: '', amount: '' });

  const categories = ['Flights', 'Accommodation', 'Transport', 'Food', 'Activities', 'Shopping', 'Misc'];
  
  const categoryColors = {
    'Flights': 'bg-blue-400',
    'Accommodation': 'bg-indigo-400',
    'Transport': 'bg-cyan-400',
    'Food': 'bg-brand-pink-dark',
    'Activities': 'bg-orange-400',
    'Shopping': 'bg-purple-400',
    'Misc': 'bg-gray-400',
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budgetLimit - totalSpent;
  const isOverBudget = remaining < 0;
  const spentPercentage = Math.min((totalSpent / budgetLimit) * 100, 100);

  // Calculate totals per category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const handleAddExpense = (e) => {
    e.preventDefault();
    const id = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    setExpenses([...expenses, { ...newExpense, id, amount: Number(newExpense.amount) }]);
    setNewExpense({ date: '', category: 'Food', description: '', amount: '' });
    setIsAdding(false);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-800">Budget & Expenses</h1>
        <p className="text-gray-500">Track your spending for Euro Trip 2026.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Summary & Charts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-bold text-lg">${budgetLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-bold text-lg text-gray-800">${totalSpent.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Remaining</span>
                <span className={`font-bold text-2xl ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                  ${Math.abs(remaining).toLocaleString()}
                  {isOverBudget && ' Over'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">0%</span>
                <span className="text-gray-500">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-brand-pink-dark'}`}
                  style={{ width: `${spentPercentage}%` }}
                ></div>
              </div>
            </div>

            {isOverBudget && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                You have exceeded your budget limit by ${Math.abs(remaining).toLocaleString()}.
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Spending by Category</h2>
            
            {/* Visual Bar representing total breakdown */}
            <div className="w-full h-4 rounded-full flex overflow-hidden mb-6">
              {Object.entries(categoryTotals).map(([cat, amount]) => (
                <div 
                  key={cat}
                  className={`${categoryColors[cat] || 'bg-gray-400'} h-full`}
                  style={{ width: `${(amount / totalSpent) * 100}%` }}
                  title={`${cat}: $${amount}`}
                ></div>
              ))}
            </div>

            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1]) // Sort descending
                .map(([cat, amount]) => (
                <div key={cat} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${categoryColors[cat] || 'bg-gray-400'}`}></span>
                    <span className="text-gray-600 text-sm">{cat}</span>
                  </div>
                  <span className="font-semibold text-sm text-gray-800">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Expenses List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Expense List</h2>
              <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center text-sm py-2">
                <PlusIcon className="w-4 h-4 mr-1" /> Add Expense
              </Button>
            </div>

            {/* Add Expense Form */}
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 bg-brand-pink-light/20 border-b border-gray-100"
              >
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Date" type="date" value={newExpense.date} onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={newExpense.category} 
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-pink-dark"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Description" placeholder="e.g., Train ticket to Amsterdam" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} required />
                  </div>
                  <Input label="Amount ($)" type="number" step="0.01" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} required />
                  
                  <div className="flex items-end justify-end gap-2 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Expenses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium border-b border-gray-100">Date</th>
                    <th className="p-4 font-medium border-b border-gray-100">Description</th>
                    <th className="p-4 font-medium border-b border-gray-100">Category</th>
                    <th className="p-4 font-medium border-b border-gray-100 text-right">Amount</th>
                    <th className="p-4 font-medium border-b border-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50/50 group border-b border-gray-50 last:border-0">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{exp.date}</td>
                      <td className="p-4 text-sm text-gray-800 font-medium">{exp.description}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${categoryColors[exp.category] || 'bg-gray-400'}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-bold text-right">${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => removeExpense(exp.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">No expenses recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBudget;
