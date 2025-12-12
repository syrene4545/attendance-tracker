// client/src/views/RequestsView.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Key, UserPlus, Check, X, Clock } from 'lucide-react';
import api from '../api/api';

const RequestsView = () => {
  const { checkPermission } = useAuth();
  const [passwordResets, setPasswordResets] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (checkPermission('manage_users')) {
      loadRequests();
    }
  }, []);

  const loadRequests = async () => {
    try {
      console.log('🔵 Loading requests...'); // ✅ Add this
      const [resetRes, signupRes] = await Promise.all([
        api.get('/password-reset/requests'),
        api.get('/signup-request/requests')
      ]);
      console.log('📊 Password resets:', resetRes.data); // ✅ Add this
      console.log('📊 Signup requests:', signupRes.data); // ✅ Add this
      setPasswordResets(resetRes.data.requests);
      setSignupRequests(signupRes.data.requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (id, approved, password = null) => {
    setProcessing(id);
    try {
      if (approved) {
        const newPassword = password || prompt('Enter new password for this user:');
        if (!newPassword) {
          setProcessing(null);
          return;
        }
        await api.post(`/password-reset/approve/${id}`, { newPassword });
      } else {
        const notes = prompt('Reason for rejection (optional):');
        await api.post(`/password-reset/reject/${id}`, { notes });
      }
      await loadRequests();
    } catch (error) {
      alert('Failed to process request: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(null);
    }
  };

  const handleSignupRequest = async (id, approved) => {
    setProcessing(id);
    try {
      if (approved) {
        const password = prompt('Enter initial password for new user:');
        if (!password) {
          setProcessing(null);
          return;
        }
        await api.post(`/signup-request/approve/${id}`, { password });
      } else {
        const notes = prompt('Reason for rejection (optional):');
        await api.post(`/signup-request/reject/${id}`, { notes });
      }
      await loadRequests();
    } catch (error) {
      alert('Failed to process request: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(null);
    }
  };

  if (!checkPermission('manage_users')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          You don't have permission to view this page.
        </div>
      </div>
    );
  }

  const pendingPasswordResets = passwordResets.filter(r => r.status === 'pending');
  const pendingSignups = signupRequests.filter(r => r.status === 'pending');

  return (
    <div className="p-6 space-y-6">
      {/* Password Reset Requests */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Key className="w-6 h-6 mr-2 text-indigo-600" />
          Password Reset Requests ({pendingPasswordResets.length} pending)
        </h2>

        {pendingPasswordResets.length === 0 ? (
          <p className="text-gray-500">No pending password reset requests</p>
        ) : (
          <div className="space-y-4">
            {pendingPasswordResets.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{request.userName}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                    <p className="text-sm text-gray-500">{request.userRole} • {request.department}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Requested: {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePasswordReset(request.id, true)}
                      disabled={processing === request.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePasswordReset(request.id, false)}
                      disabled={processing === request.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signup Requests */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
          Signup Requests ({pendingSignups.length} pending)
        </h2>

        {pendingSignups.length === 0 ? (
          <p className="text-gray-500">No pending signup requests</p>
        ) : (
          <div className="space-y-4">
            {pendingSignups.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                    <p className="text-sm text-gray-500">{request.requestedRole} • {request.department}</p>
                    {request.reason && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{request.reason}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Requested: {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSignupRequest(request.id, true)}
                      disabled={processing === request.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSignupRequest(request.id, false)}
                      disabled={processing === request.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsView;