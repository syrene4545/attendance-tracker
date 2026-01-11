// client/src/views/SOPDetailView.jsx

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download,
  Send
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext'; // ✅ Add this import

const SOPDetailView = ({ sop, onBack, onEdit, onDelete, isAdmin }) => {
  const { currentUser } = useAuth(); // ✅ Add this
  const [sopDetails, setSOPDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledgmentNotes, setAcknowledgmentNotes] = useState('');

  useEffect(() => {
    fetchSOPDetails();
  }, [sop.id]);

  const fetchSOPDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sops/${sop.id}`);
      setSOPDetails(response.data.sop);
    } catch (error) {
      console.error('Error fetching SOP details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (acknowledgmentId) => {
    try {
      setAcknowledging(true);
      await api.post(`/sops/acknowledgments/${acknowledgmentId}/acknowledge`, {
        notes: acknowledgmentNotes
      });
      alert('SOP acknowledged successfully');
      fetchSOPDetails();
      setAcknowledgmentNotes('');
    } catch (error) {
      console.error('Error acknowledging SOP:', error);
      alert(error.response?.data?.error || 'Failed to acknowledge SOP');
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading SOP...</p>
        </div>
      </div>
    );
  }

  if (!sopDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-600">SOP not found</p>
      </div>
    );
  }

  // ✅ Find user's acknowledgment - Fixed logic
  const userAcknowledgment = sopDetails.acknowledgements?.find(
    ack => ack.userId === currentUser.id && !ack.acknowledged
  );

  console.log('👤 Current User ID:', currentUser?.id);
  console.log('📋 All Acknowledgements:', sopDetails.acknowledgements);
  console.log('🎯 User Acknowledgment:', userAcknowledgment);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{sopDetails.title}</h1>
            <p className="text-gray-600 capitalize">{sopDetails.category}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(sopDetails)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(sopDetails.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-semibold text-gray-900">{sopDetails.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                sopDetails.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : sopDetails.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {sopDetails.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Effective Date</p>
              <p className="font-semibold text-gray-900">
                {sopDetails.effectiveDate 
                  ? new Date(sopDetails.effectiveDate).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="font-semibold text-gray-900">{sopDetails.createdByName}</p>
            </div>
          </div>
        </div>

        {/* Acknowledgment Required */}
        {userAcknowledgment && sopDetails.status === 'active' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Acknowledgment Required
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Please read this SOP carefully and acknowledge that you understand and will comply with its contents.
                </p>
                
                <textarea
                  value={acknowledgmentNotes}
                  onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                  placeholder="Optional notes or comments..."
                  className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-3"
                  rows="3"
                />
                
                <button
                  onClick={() => handleAcknowledge(userAcknowledgment.id)}
                  disabled={acknowledging}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  {acknowledging ? 'Acknowledging...' : 'I Acknowledge'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already Acknowledged Message */}
        {sopDetails.acknowledgements?.some(ack => ack.userId === currentUser.id && ack.acknowledged) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Already Acknowledged</p>
                <p className="text-sm text-green-800">
                  You acknowledged this SOP on{' '}
                  {new Date(
                    sopDetails.acknowledgements.find(ack => ack.userId === currentUser.id)?.acknowledgedAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Content</h2>
          {sopDetails.description && (
            <p className="text-gray-700 mb-6">{sopDetails.description}</p>
          )}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: sopDetails.content }}
          />
        </div>

        {/* Acknowledgments (Admin only) */}
        {isAdmin && sopDetails.acknowledgements && sopDetails.acknowledgements.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Acknowledgments ({sopDetails.acknowledgements.filter(a => a.acknowledged).length}/{sopDetails.acknowledgements.length})
            </h2>
            <div className="space-y-3">
              {sopDetails.acknowledgements.map((ack) => (
                <div key={ack.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{ack.userName}</p>
                      <p className="text-sm text-gray-600">{ack.departmentName || 'No department'}</p>
                      {ack.notes && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{ack.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {ack.acknowledged ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Acknowledged
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ack.acknowledgedAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOPDetailView;