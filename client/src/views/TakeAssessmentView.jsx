// client\src\views\TakeAssessmentView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Home
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TakeAssessmentView = ({ assessmentId, onViewChange }) => {
  const [assessment, setAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch assessment details
      const assessmentRes = await axios.get(`${API_URL}/assessments/${assessmentId}`, { headers });
      setAssessment(assessmentRes.data);

      // ✅ START OR RESUME ASSESSMENT ATTEMPT (HANDLES 409)
      let attemptData;

      try {
        // Try to start a new attempt
        const attemptRes = await axios.post(
          `${API_URL}/assessments/${assessmentId}/start`,
          {},
          { headers }
        );
        attemptData = attemptRes.data;
        console.log('✅ New attempt started:', attemptData.attemptId);
        
      } catch (err) {
        // ✅ CRITICAL FIX: Handle 409 - attempt already exists
        if (err.response?.status === 409 && err.response.data?.attemptId) {
          attemptData = err.response.data;
          console.log('ℹ️ Resuming existing attempt:', attemptData.attemptId);
        } else {
          // Other errors - rethrow
          throw err;
        }
      }

      // Set attempt data (works for both new and resumed attempts)
      setAttemptId(attemptData.attemptId);
      setStartTime(new Date(attemptData.startedAt || new Date()));
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching assessment:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      if (!window.confirm('You have not answered all questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer
      }));

      await axios.post(
        `${API_URL}/assessments/${attemptId}/submit`,
        { answers: formattedAnswers },
        { headers }
      );

      onViewChange('assessment-results', attemptId);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
      setSubmitting(false);
    }
  };

  const currentQuestion = assessment?.questions[currentQuestionIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / (assessment?.questions.length || 1)) * 100;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment not found</h2>
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
              onViewChange('assessments');
            }
          }}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </button>
      </div>

      {/* Assessment Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Pass mark: {assessment.passingScore}% • {assessment.totalPoints} questions
            </p>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">
              {Math.floor((new Date() - startTime) / 60000)} min
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {answeredCount} / {assessment.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {assessment.questions.length}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              {currentQuestion.category}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'true-false' && (
            <>
              {['True', 'False'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[currentQuestion.id] === option
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion.id] === option && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'scenario') && (
            <>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        answers[currentQuestion.id] === option
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion.id] === option && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigator</h3>
        <div className="flex flex-wrap gap-2">
          {assessment.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[assessment.questions[index].id]
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        {currentQuestionIndex < assessment.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
            <Send className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeAssessmentView;