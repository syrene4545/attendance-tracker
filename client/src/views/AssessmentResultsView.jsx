import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  Target,
  TrendingUp,
  Home,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trophy,
  ArrowLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AssessmentResultsView = ({ attemptId, onViewChange }) => {
  const [results, setResults] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const resultsRes = await axios.get(
        `${API_URL}/assessments/attempts/${attemptId}`,
        { headers }
      );
      setResults(resultsRes.data);

      // Fetch badges to check for new ones
      const badgesRes = await axios.get(
        `${API_URL}/assessments/badges/me`,
        { headers }
      );
      
      // Check for recently earned badges (within last minute)
      const recentBadges = badgesRes.data.filter(badge => {
        const earnedTime = new Date(badge.earnedAt);
        const now = new Date();
        return (now - earnedTime) < 60000;
      });
      
      setNewBadges(recentBadges);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results not found</h2>
            <button
              onClick={() => onViewChange('assessments')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const correctAnswers = results.answers.filter(a => a.correct).length;
  const incorrectAnswers = results.answers.length - correctAnswers;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => onViewChange('assessments')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </button>
      </div>

      {/* Results Header */}
      <div className={`rounded-lg shadow-lg p-8 mb-8 ${
        results.passed 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
          : 'bg-gradient-to-r from-red-500 to-orange-600'
      } text-white`}>
        <div className="text-center mb-6">
          {results.passed ? (
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 mx-auto mb-4" />
          )}
          <h1 className="text-4xl font-bold mb-2">
            {results.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-xl opacity-90">
            {results.passed 
              ? `You've passed the ${results.assessment.title}`
              : `You didn't pass this time, but you can try again!`
            }
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">Your Score</p>
            <p className="text-3xl font-bold">{results.score}%</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">Pass Mark</p>
            <p className="text-3xl font-bold">{results.assessment.passingScore}%</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">Correct</p>
            <p className="text-3xl font-bold">{correctAnswers}/{results.answers.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">Time Taken</p>
            <p className="text-3xl font-bold">{formatTime(results.timeTaken)}</p>
          </div>
        </div>
      </div>

      {/* New Badges Earned */}
      {newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">New Badges Earned! 🎉</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newBadges.map((userBadge) => (
              <div
                key={userBadge.id}
                className={`border-2 rounded-lg p-4 text-center ${getRarityColor(userBadge.badge.rarity)}`}
              >
                <div className="text-4xl mb-2">{userBadge.badge.icon}</div>
                <h3 className="font-bold text-lg">{userBadge.badge.name}</h3>
                <p className="text-sm mt-1">{userBadge.badge.description}</p>
                <p className="text-xs font-medium uppercase mt-2">{userBadge.badge.rarity}</p>
                <p className="text-sm font-bold mt-1">+{userBadge.badge.points} points</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
        
        <div className="space-y-4">
          {results.answers.map((answer, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg overflow-hidden ${
                answer.correct 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center flex-1">
                  {answer.correct ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Question {index + 1}: {answer.question.text}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {answer.question.category} • {answer.pointsEarned}/{answer.pointsPossible} points
                    </p>
                  </div>
                </div>
                {expandedQuestions[index] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>

              {expandedQuestions[index] && (
                <div className="px-6 pb-6 border-t border-gray-200 pt-4 bg-white">
                  <div className="space-y-4">
                    {/* Your Answer */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                      <div className={`p-3 rounded-lg ${
                        answer.correct ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                      }`}>
                        <p className="text-gray-900">
                          {Array.isArray(answer.userAnswer) 
                            ? answer.userAnswer.join(', ') 
                            : answer.userAnswer}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer (if wrong) */}
                    {!answer.correct && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</p>
                        <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                          <p className="text-gray-900">
                            {Array.isArray(answer.correctAnswer) 
                              ? answer.correctAnswer.join(', ') 
                              : answer.correctAnswer}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {answer.question.explanation && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Explanation:</p>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-gray-900">{answer.question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => onViewChange('assessments')}
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Assessments
        </button>
        
        {!results.passed && (
          <button
            onClick={() => onViewChange('take-assessment', results.assessment.sopId)}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        )}

        <button
          onClick={() => onViewChange('leaderboard')}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          <Trophy className="w-5 h-5 mr-2" />
          View Leaderboard
        </button>
      </div>
    </div>
  );
};

export default AssessmentResultsView;