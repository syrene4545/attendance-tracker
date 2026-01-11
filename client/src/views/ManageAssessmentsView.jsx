// client/src/views/ManageAssessmentsView.jsx

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import AssessmentFormView from './AssessmentFormView';

const ManageAssessmentsView = ({ onViewChange }) => {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [activeView, setActiveView] = useState('list'); // 'list' or 'form'
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assessments/admin/all');
      setAssessments(response.data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    setSelectedAssessment(null);
    setActiveView('form');
  };

  const handleEditAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setActiveView('form');
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/assessments/admin/${assessmentId}`);
      showMessage('success', 'Assessment deleted successfully');
      fetchAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete assessment');
    }
  };

  const handleToggleMandatory = async (assessment) => {
    setSaving(prev => ({ ...prev, [assessment.id]: true }));
    
    try {
      await api.patch(`/assessments/${assessment.id}/mandatory`, {
        mandatory: !assessment.mandatory
      });
      
      // Update local state
      setAssessments(prev =>
        prev.map(a =>
          a.id === assessment.id ? { ...a, mandatory: !a.mandatory } : a
        )
      );
      
      showMessage('success', `Assessment ${!assessment.mandatory ? 'marked as mandatory' : 'unmarked as mandatory'}`);
    } catch (error) {
      console.error('Error toggling mandatory:', error);
      showMessage('error', 'Failed to update mandatory status');
    } finally {
      setSaving(prev => ({ ...prev, [assessment.id]: false }));
    }
  };

  const handleToggleActive = async (assessment) => {
    setSaving(prev => ({ ...prev, [assessment.id]: true }));
    
    try {
      await api.patch(`/assessments/admin/${assessment.id}/active`, {
        active: !assessment.active
      });
      
      // Update local state
      setAssessments(prev =>
        prev.map(a =>
          a.id === assessment.id ? { ...a, active: !a.active } : a
        )
      );
      
      showMessage('success', `Assessment ${!assessment.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      showMessage('error', 'Failed to update active status');
    } finally {
      setSaving(prev => ({ ...prev, [assessment.id]: false }));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFormBack = () => {
    setActiveView('list');
    setSelectedAssessment(null);
    fetchAssessments();
  };

  // Show form view
  if (activeView === 'form') {
    return (
      <AssessmentFormView 
        assessment={selectedAssessment}
        onBack={handleFormBack}
      />
    );
  }

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || assessment.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onViewChange('assessment-analytics')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Assessments</h1>
              <p className="text-gray-600 mt-1">Create, edit, and configure company assessments</p>
            </div>
          </div>
          <button
            onClick={handleCreateAssessment}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Assessment
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                About Assessment Management
              </h3>
              <p className="text-sm text-blue-700">
                Create custom assessments with multiple choice and true/false questions. 
                Mark assessments as mandatory to require all employees to complete them. 
                Toggle active/inactive status to control visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-indigo-600">{assessments.length}</p>
              </div>
              <Award className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {assessments.filter(a => a.active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mandatory</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assessments.filter(a => a.mandatory).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {assessments.filter(a => !a.active).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No assessments found' : 'No assessments yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'Create your first assessment to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateAssessment}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Assessment
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Badges */}
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assessment.title}
                      </h3>
                      
                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {assessment.mandatory && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Target className="w-3 h-3 mr-1" />
                            Mandatory
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assessment.active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>

                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getDifficultyColor(assessment.difficulty)}`}>
                          {assessment.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {assessment.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {assessment.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Passing Score: {assessment.passingScore}%</span>
                      <span>•</span>
                      <span>{assessment.questionCount || 0} Questions</span>
                      {assessment.timeLimit && (
                        <>
                          <span>•</span>
                          <span>Time Limit: {assessment.timeLimit} min</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 ml-6">
                    {/* Mandatory Toggle */}
                    <div className="text-center">
                      <button
                        onClick={() => handleToggleMandatory(assessment)}
                        disabled={saving[assessment.id]}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          assessment.mandatory ? 'bg-red-600' : 'bg-gray-200'
                        } ${saving[assessment.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          assessment.mandatory ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {assessment.mandatory ? 'Required' : 'Optional'}
                      </p>
                    </div>

                    {/* Active Toggle */}
                    <div className="text-center">
                      <button
                        onClick={() => handleToggleActive(assessment)}
                        disabled={saving[assessment.id]}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          assessment.active ? 'bg-green-600' : 'bg-gray-200'
                        } ${saving[assessment.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          assessment.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {assessment.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditAssessment(assessment)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total: <span className="font-semibold text-gray-900">{assessments.length}</span>
            </span>
            <span className="text-gray-600">
              Active: <span className="font-semibold text-green-600">
                {assessments.filter(a => a.active).length}
              </span>
            </span>
            <span className="text-gray-600">
              Mandatory: <span className="font-semibold text-red-600">
                {assessments.filter(a => a.mandatory).length}
              </span>
            </span>
            <span className="text-gray-600">
              Optional: <span className="font-semibold text-gray-900">
                {assessments.filter(a => !a.mandatory).length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAssessmentsView;