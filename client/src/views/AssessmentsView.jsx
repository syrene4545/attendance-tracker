// client\src\views\AssessmentsView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trophy,
  Target,
  Zap,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AssessmentsView = ({ onViewChange }) => {
  const [assessments, setAssessments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('📡 Fetching from:', `${API_URL}/assessments`);

      const [assessmentsRes, certificationsRes, badgesRes] = await Promise.all([
        axios.get(`${API_URL}/assessments`, { headers }),
        axios.get(`${API_URL}/assessments/certifications/me`, { headers }),
        axios.get(`${API_URL}/assessments/badges/me`, { headers })
      ]);

      console.log('✅ Assessments:', assessmentsRes.data);
      console.log('✅ Certifications:', certificationsRes.data);
      console.log('✅ Badges:', badgesRes.data);

      setAssessments(assessmentsRes.data);
      setCertifications(certificationsRes.data);
      setBadges(badgesRes.data);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching assessments:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  // In AssessmentsView.jsx - Enhanced button logic
  const getButtonText = (assessment) => {
    const { userProgress } = assessment;
    
    if (userProgress.passed) {
      return 'Retake Assessment';
    }
    
    // Future: support in-progress resumes
    if (userProgress.inProgress) {
      return 'Resume Assessment';
    }
    
    if (userProgress.attempts > 0 && !userProgress.passed) {
      return 'Try Again';
    }
    
    return 'Start Assessment';
  };

  const getStatusBadge = (assessment) => {
    const { userProgress } = assessment;
    
    if (userProgress.passed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Certified
        </span>
      );
    } else if (userProgress.attempts > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4 mr-1" />
          In Progress
        </span>
      );
    } else if (assessment.mandatory) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Target className="w-4 h-4 mr-1" />
          Required
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <BookOpen className="w-4 h-4 mr-1" />
          Not Started
        </span>
      );
    }
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
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={() => onViewChange('dashboard')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Assessments</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
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
          onClick={() => onViewChange('dashboard')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">SOP Assessments & Certifications</h1>
        <p className="mt-2 text-gray-600">
          Test your knowledge, earn certifications, and unlock achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certifications</p>
              <p className="text-2xl font-semibold text-gray-900">{certifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Badges Earned</p>
              <p className="text-2xl font-semibold text-gray-900">{badges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">{assessments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assessments.filter(a => a.userProgress.bestScore).length > 0
                  ? Math.round(
                      assessments
                        .filter(a => a.userProgress.bestScore)
                        .reduce((sum, a) => sum + a.userProgress.bestScore, 0) /
                        assessments.filter(a => a.userProgress.bestScore).length
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'available'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Assessments ({assessments.length})
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'certifications'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Certifications ({certifications.length})
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'badges'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Badges ({badges.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'available' && (
            <div className="space-y-6">
              {assessments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Assessments will appear here once they are created.
                  </p>
                </div>
              ) : (
                assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {assessment.title}
                          </h3>
                          {getStatusBadge(assessment)}
                        </div>
                        <p className="text-gray-600 mb-4">{assessment.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Questions</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {assessment.totalPoints}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pass Mark</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {assessment.passingScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Attempts</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {assessment.userProgress.attempts}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Best Score</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {assessment.userProgress.bestScore
                                ? `${assessment.userProgress.bestScore}%`
                                : '-'}
                            </p>
                          </div>
                        </div>

                        {assessment.userProgress.lastAttempt && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Last attempt:{' '}
                              <span className="font-medium">
                                {assessment.userProgress.lastAttempt.score}%
                              </span>{' '}
                              on{' '}
                              {new Date(assessment.userProgress.lastAttempt.date).toLocaleDateString()}
                              {' - '}
                              {assessment.userProgress.lastAttempt.passed ? (
                                <span className="text-green-600 font-medium">Passed ✓</span>
                              ) : (
                                <span className="text-red-600 font-medium">Not Passed</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6">

                        <button
                          onClick={() => onViewChange('take-assessment', assessment.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {getButtonText(assessment)}
                          <Zap className="ml-2 w-4 h-4" />
                        </button>

                        {/* <button
                          onClick={() => onViewChange('take-assessment', assessment.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {assessment.userProgress.passed 
                            ? 'Retake' 
                            : assessment.userProgress.attempts > 0 && !assessment.userProgress.passed
                            ? 'Resume Assessment'
                            : 'Start Assessment'}
                          <Zap className="ml-2 w-4 h-4" />
                        </button> */}

                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-4">
              {certifications.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No certifications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete assessments to earn certifications
                  </p>
                </div>
              ) : (
                certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-indigo-50 to-purple-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-12 w-12 text-indigo-600" />
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cert.assessmentTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Score: <span className="font-medium">{cert.score}%</span> • 
                            Certified: {new Date(cert.certifiedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Certificate #{cert.certificateNumber}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                        Download Certificate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete assessments to unlock achievements
                  </p>
                </div>
              ) : (
                badges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className={`border-2 rounded-lg p-6 ${getRarityColor(userBadge.badge.rarity)}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-3">{userBadge.badge.icon}</div>
                      <h3 className="text-lg font-bold mb-1">{userBadge.badge.name}</h3>
                      <p className="text-sm mb-2">{userBadge.badge.description}</p>
                      <p className="text-xs font-medium uppercase tracking-wide mb-1">
                        {userBadge.badge.rarity}
                      </p>
                      <p className="text-sm font-medium">+{userBadge.badge.points} points</p>
                      <p className="text-xs text-gray-600 mt-2">
                        Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentsView;