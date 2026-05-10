import { useState } from 'react';
import { PlusIcon, TrashIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const ItineraryBuilder = () => {
  // Demo Data - Physical Activities
  const [activities, setActivities] = useState([
    { id: 1, day: 'Day 1', time: '10:00 AM', title: 'Arrival at CDG Airport', location: 'Paris, France' },
    { id: 2, day: 'Day 1', time: '02:00 PM', title: 'Check-in to Hotel', location: 'Le Marais, Paris' },
    { id: 3, day: 'Day 1', time: '05:00 PM', title: 'Eiffel Tower Tour', location: 'Champ de Mars' },
    { id: 4, day: 'Day 2', time: '09:30 AM', title: 'Louvre Museum', location: 'Rue de Rivoli' }
  ]);

  // Demo Data - Expenses corresponding to activities
  const [expenses, setExpenses] = useState([
    { id: 1, activityId: 1, category: 'Transport', description: 'Train from Airport', amount: 12 },
    { id: 2, activityId: 2, category: 'Accommodation', description: 'Hotel (Night 1)', amount: 150 },
    { id: 3, activityId: 3, category: 'Activity', description: 'Eiffel Tower Tickets', amount: 28 },
    { id: 4, activityId: 4, category: 'Activity', description: 'Louvre Entry', amount: 17 }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Itinerary & Expenses</h1>
          <p className="text-gray-500">Plan your activities and track expenses side-by-side.</p>
        </div>
        <Button className="flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" /> Add Item
        </Button>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Physical Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MapPinIcon className="w-6 h-6 mr-2 text-brand-pink-dark" />
            Physical Activity
          </h2>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-pink-dark text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {index + 1}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-brand-pink-dark bg-pink-50 px-2 py-1 rounded-md uppercase tracking-wider">{activity.day}</span>
                    <button className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mt-2">{activity.title}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1.5" /> {activity.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1.5" /> {activity.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Expense */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-green-500" />
              Expense
            </h2>
            <div className="text-right">
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-800">${expenses.reduce((sum, e) => sum + e.amount, 0)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{expense.description}</h3>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">${expense.amount}</span>
                  <button className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            
            {/* Add New Expense Row */}
            <button className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 font-medium hover:border-brand-pink-dark hover:text-brand-pink-dark transition-colors flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" /> Add Expense
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItineraryBuilder;
