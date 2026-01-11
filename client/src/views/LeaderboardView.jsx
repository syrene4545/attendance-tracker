import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Users,
  Target,
  Clock,
  Crown,
  Award,
  ArrowLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LeaderboardView = ({ onViewChange }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedSop, setSelectedSop] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeaderboard(selectedSop);
  }, [selectedSop]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get current user info
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }

      // Get assessments for filter
      const assessmentsRes = await axios.get(`${API_URL}/assessments`, { headers });
      setAssessments(assessmentsRes.data);

      // Get initial leaderboard
      await fetchLeaderboard('all');
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (sopId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const endpoint = sopId === 'all' 
        ? `${API_URL}/assessments/leaderboard`
        : `${API_URL}/assessments/leaderboard/${sopId}`;

      const leaderboardRes = await axios.get(endpoint, { headers });
      setLeaderboard(leaderboardRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    if (position === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold text-gray-500">#{position + 1}</span>;
  };

  const getRowStyle = (position, userId) => {
    const isCurrentUser = currentUser && userId === currentUser.id;
    
    if (position === 0) {
      return `${isCurrentUser ? 'bg-yellow-100 border-yellow-400' : 'bg-gradient-to-r from-yellow-50 to-amber-50'} border-2 border-yellow-300`;
    } else if (position === 1) {
      return `${isCurrentUser ? 'bg-gray-100 border-gray-400' : 'bg-gradient-to-r from-gray-50 to-slate-50'} border-2 border-gray-300`;
    } else if (position === 2) {
      return `${isCurrentUser ? 'bg-orange-100 border-orange-400' : 'bg-gradient-to-r from-orange-50 to-amber-50'} border-2 border-orange-300`;
    }
    
    return isCurrentUser ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white border border-gray-200';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => onViewChange('assessments')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">
            See how you rank against your colleagues
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-gray-500 mr-2" />
            <label className="text-sm font-medium text-gray-700 mr-3">
              Filter by Assessment:
            </label>
          </div>
          <select
            value={selectedSop}
            onChange={(e) => setSelectedSop(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Assessments</option>
            {assessments.map((assessment) => (
              <option key={assessment.id} value={assessment.sopId}>
                {assessment.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-2xl font-semibold text-gray-900">{leaderboard.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaderboard.length > 0
                  ? Math.round(
                      leaderboard.reduce((sum, entry) => sum + entry.averageScore, 0) /
                        leaderboard.length
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaderboard.length > 0 ? `${leaderboard[0].bestScore}%` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h2 className="text-xl font-bold text-white">Rankings</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Be the first to complete an assessment!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fastest Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.userId}
                    className={`${getRowStyle(index, entry.userId)} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-10">
                        {getMedalIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {entry.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.name}
                            {currentUser && entry.userId === currentUser.id && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-bold text-gray-900">{entry.bestScore}%</div>
                        <div className="ml-2 flex-shrink-0">
                          {entry.bestScore >= 90 && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Excellent
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.averageScore}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.totalAttempts}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {formatTime(entry.fastestTime)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Message */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Keep learning and improving! The leaderboard updates in real-time.
        </p>
      </div>
    </div>
  );
};

export default LeaderboardView;