import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { Stop } from '../../../types';
import ActivityItem from './ActivityItem';
import { createActivity, deleteStop } from '../../../api/trips';

interface Props {
  stop: Stop;
  onUpdate: () => void;
}

const StopCard = ({ stop, onUpdate }: Props) => {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actName, setActName] = useState('');
  const [actType, setActType] = useState('sightseeing');
  const [actCost, setActCost] = useState('');
  const [actDuration, setActDuration] = useState('');
  const [actStartTime, setActStartTime] = useState('');

  const nights = Math.max(1, Math.ceil((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / (1000 * 3600 * 24)));

  const handleAddActivity = async () => {
    if (!actName) return;
    await createActivity({
      stopId: stop.id,
      name: actName,
      type: actType,
      estimatedCost: Number(actCost) || 0,
      durationHrs: Number(actDuration) || 1,
      startTime: actStartTime || undefined
    });
    setShowAddActivity(false);
    setActName(''); setActCost(''); setActDuration(''); setActStartTime('');
    onUpdate();
  };

  const handleDeleteStop = async () => {
    if (confirm('Delete this stop and all its activities?')) {
      await deleteStop(stop.id);
      onUpdate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{stop.city.name}, {stop.city.country}</h3>
            <p className="text-sm text-gray-500">
              {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()} ({nights} nights)
            </p>
          </div>
        </div>
        <button onClick={handleDeleteStop} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {stop.activities.map(act => (
            <ActivityItem key={act.id} activity={act} onUpdate={onUpdate} />
          ))}
          {stop.activities.length === 0 && (
            <p className="text-sm text-gray-400 italic">No activities planned yet.</p>
          )}
        </div>

        {showAddActivity ? (
          <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Activity Name" value={actName} onChange={e => setActName(e.target.value)} className="col-span-2 rounded-lg border-gray-200 px-3 py-2 text-sm" />
              <select value={actType} onChange={e => setActType(e.target.value)} className="rounded-lg border-gray-200 px-3 py-2 text-sm bg-white">
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture</option>
                <option value="nightlife">Nightlife</option>
                <option value="transport">Transport</option>
                <option value="accommodation">Accommodation</option>
              </select>
              <input type="number" placeholder="Cost (USD)" value={actCost} onChange={e => setActCost(e.target.value)} className="rounded-lg border-gray-200 px-3 py-2 text-sm" />
              <input type="time" value={actStartTime} onChange={e => setActStartTime(e.target.value)} className="rounded-lg border-gray-200 px-3 py-2 text-sm" />
              <input type="number" placeholder="Duration (Hrs)" value={actDuration} onChange={e => setActDuration(e.target.value)} className="rounded-lg border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowAddActivity(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleAddActivity} className="px-3 py-1.5 text-xs font-medium bg-primary text-white hover:bg-primary-600 rounded-lg">Save</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddActivity(true)} className="mt-4 flex items-center text-sm font-medium text-primary hover:text-primary-600">
            <Plus className="w-4 h-4 mr-1" /> Add Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default StopCard;
