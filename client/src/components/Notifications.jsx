import { Bell, X } from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';

const Notifications = () => {
  const { notifications, removeNotification } = useAttendance();

  if (notifications.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center space-x-2 p-4 rounded-lg mb-2 ${
            notif.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : notif.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{notif.message}</span>
          <button onClick={() => removeNotification(notif.id)} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
