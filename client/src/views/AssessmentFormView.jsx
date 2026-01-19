// client/src/views/AssessmentFormView.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../api/api';

const AssessmentFormView = ({ assessment, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 30,
    difficulty: 'intermediate',
    mandatory: false,
    active: true
  });

  const [questions, setQuestions] = useState([]);

  // ✅ Define category options
  const categoryOptions = [
    'Policy',
    'Procedure',
    'Customer Service',
    'Safety & Security',
    'Till Operations',
    'Cash Handling',
    'Fraud Prevention',
    'Refunds & Returns',
    'Stock Management',
    'Sales Techniques',
    'Product Knowledge',
    'Compliance',
    'Health & Hygiene',
    'Communication',
    'Other'
  ];

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        passingScore: assessment.passingScore || 70,
        timeLimit: assessment.timeLimit || 30,
        difficulty: assessment.difficulty || 'intermediate',
        mandatory: assessment.mandatory || false,
        active: assessment.active !== undefined ? assessment.active : true
      });

      // Fetch questions if editing
      fetchQuestions();
    } else {
      // Add initial question for new assessment
      addQuestion();
    }
  }, [assessment]);

  const fetchQuestions = async () => {
    try {
        const response = await api.get(`/assessments/admin/${assessment.id}/questions`);
        const fetchedQuestions = response.data.questions || [];
        
        // ✅ Parse JSON fields and handle all question types
        const parsedQuestions = fetchedQuestions.map(q => {
        // Parse correctAnswer
        let correctAnswer = q.correctAnswer;
        if (typeof correctAnswer === 'string') {
            try {
            correctAnswer = JSON.parse(correctAnswer);
            } catch (e) {
            // If parsing fails, use as-is
            }
        }

        // Parse options
        let options = q.options;
        if (q.questionType === 'multiple-choice' || q.questionType === 'scenario') {
            if (typeof options === 'string') {
            try {
                options = JSON.parse(options);
            } catch (e) {
                options = [];
            }
            }
            if (!Array.isArray(options)) {
            options = [];
            }
        } else if (q.questionType === 'true-false') {
            options = ['True', 'False'];
        }

        return {
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType, // ✅ Keep original type (including 'scenario')
            options: options,
            correctAnswer: correctAnswer,
            points: q.points || 10,
            category: q.category || '',
            explanation: q.explanation || '',
            questionOrder: q.questionOrder
        };
        });
        
        setQuestions(parsedQuestions);
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        tempId: Date.now(),
        questionText: '',
        questionType: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10,
        category: '',
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    
    // ✅ When changing question type, update options
    if (field === 'questionType') {
        if (value === 'true-false') {
        newQuestions[index] = {
            ...newQuestions[index],
            questionType: value,
            options: ['True', 'False'],
            correctAnswer: ''
        };
        } else if (value === 'multiple-choice' || value === 'scenario') {
        // ✅ Multiple choice and scenario both use options array
        newQuestions[index] = {
            ...newQuestions[index],
            questionType: value,
            options: ['', '', '', ''],
            correctAnswer: ''
        };
        } else {
        newQuestions[index] = {
            ...newQuestions[index],
            questionType: value,
            options: ['', '', '', ''],
            correctAnswer: ''
        };
        }
    } else {
        newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options];
    options[optionIndex] = value;
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        alert(`Question ${i + 1} is missing question text`);
        return;
      }
      if ((q.questionType === 'multiple-choice' || q.questionType === 'scenario') && q.options.filter(o => o.trim()).length < 2) {
    //   if (q.questionType === 'multiple-choice' && q.options.filter(o => o.trim()).length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (!q.correctAnswer) {
        alert(`Question ${i + 1} is missing correct answer`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        questions: questions.map((q, index) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: (q.questionType === 'multiple-choice' || q.questionType === 'scenario')
        //   options: q.questionType === 'multiple-choice' 
            ? q.options.filter(o => o.trim()) 
            : null, // ✅ null for true/false
          correctAnswer: q.correctAnswer, // ✅ Send as plain string (backend will stringify)
          points: q.points,
          category: q.category || null,
          explanation: q.explanation || null,
          questionOrder: index + 1
        }))
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      if (assessment) {
        await api.put(`/assessments/admin/${assessment.id}`, payload);
        alert('Assessment updated successfully');
      } else {
        await api.post('/assessments/admin/create', payload);
        alert('Assessment created successfully');
      }
      
      onBack();
    } catch (error) {
      console.error('Error saving assessment:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {assessment ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Attendance Policy Assessment"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Brief description of this assessment..."
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mandatory}
                  onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mandatory assessment
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={question.tempId || question.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your question..."
                    rows="2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={question.questionType}
                      onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="scenario">Scenario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={question.category}
                      onChange={(e) => updateQuestion(qIndex, 'category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select category...</option>
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options - Only for Multiple Choice */}
                {/* Options - For Multiple Choice and Scenario */}
                {(question.questionType === 'multiple-choice' || question.questionType === 'scenario') && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Options * {question.questionType === 'scenario' && <span className="text-xs text-gray-500">(Scenario options)</span>}
                    </label>
                    <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        + Add Option
                    </button>
                    </div>
                    <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={`Option ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                            <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                )}
                {/* {(question.questionType === 'multiple-choice' || question.questionType === 'scenario') && (
                // {question.questionType === 'multiple-choice' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options *
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  {(question.questionType === 'multiple-choice' || question.questionType === 'scenario') ? (
                //   {question.questionType === 'multiple-choice' ? (
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select correct answer...</option>
                      {question.options.filter(o => o.trim()).map((option, idx) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer..."
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : assessment ? 'Update Assessment' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentFormView;