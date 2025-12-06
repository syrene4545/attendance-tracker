import { LogIn, LogOut, Coffee } from 'lucide-react';

// ==================== UTILITY FUNCTIONS ====================

export const getEventLabel = (type) => {
  const labels = {
    'sign-in': 'Morning Sign-In',
    'lunch-out': 'Lunch Sign-Out',
    'lunch-in': 'Lunch Return',
    'sign-out': 'End-of-Day Sign-Out',
  };
  return labels[type];
};

export const getEventIcon = (type) => {
  const icons = {
    'sign-in': <LogIn className="w-5 h-5" />,
    'lunch-out': <Coffee className="w-5 h-5" />,
    'lunch-in': <Coffee className="w-5 h-5" />,
    'sign-out': <LogOut className="w-5 h-5" />,
  };
  return icons[type];
};

export const getEventColor = (type) => {
  const colors = {
    'sign-in': 'bg-green-100 text-green-700',
    'lunch-out': 'bg-orange-100 text-orange-700',
    'lunch-in': 'bg-blue-100 text-blue-700',
    'sign-out': 'bg-purple-100 text-purple-700',
  };
  return colors[type];
};
