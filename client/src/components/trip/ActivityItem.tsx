import { Clock, Trash2, Edit2 } from 'lucide-react';
import { Activity } from '../../../types';
import { deleteActivity } from '../../../api/trips';

interface Props {
  activity: Activity;
  onUpdate: () => void;
}

const typeColors: Record<string, string> = {
  sightseeing: 'bg-blue-100 text-blue-700 border-blue-200',
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  adventure: 'bg-green-100 text-green-700 border-green-200',
  culture: 'bg-purple-100 text-purple-700 border-purple-200',
  nightlife: 'bg-pink-100 text-pink-700 border-pink-200',
  transport: 'bg-gray-100 text-gray-700 border-gray-200',
  accommodation: 'bg-teal-100 text-teal-700 border-teal-200'
};

const ActivityItem = ({ activity, onUpdate }: Props) => {
  const handleDelete = async () => {
    if (confirm('Delete this activity?')) {
      await deleteActivity(activity.id);
      onUpdate();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
      <div className="flex items-center space-x-4">
        <div className="w-16 text-center text-sm font-medium text-gray-500 flex items-center justify-center">
          {activity.startTime ? (
            <>
              <Clock className="w-3 h-3 mr-1" />
              {activity.startTime}
            </>
          ) : (
            <span className="text-xs">Any time</span>
          )}
        </div>
        
        <div className="w-1 h-8 bg-gray-200 rounded-full" />
        
        <div>
          <h4 className="font-semibold text-gray-900">{activity.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColors[activity.type] || typeColors.sightseeing}`}>
              {activity.type}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              ${activity.estimatedCost} • {activity.durationHrs}h
            </span>
          </div>
        </div>
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ActivityItem;
