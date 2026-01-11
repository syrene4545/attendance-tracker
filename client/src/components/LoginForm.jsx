import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, AlertCircle } from 'lucide-react';

import ForgotPassword from './ForgotPassword';
import SignupRequest from './SignupRequest';

const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignupRequest, setShowSignupRequest] = useState(false);

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  if (showSignupRequest) {
    return <SignupRequest onBack={() => setShowSignupRequest(false)} />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Clock className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Manager </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Forgot Password?
          </button>
          <div className="text-gray-500">or</div>
          <button
            type="button"
            onClick={() => setShowSignupRequest(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Request New Account
          </button>
        </div>

        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <div className="space-y-1">
            <p><strong>Admin:</strong> admin@company.com / password123</p>
            <p><strong>HR:</strong> hr@company.com / password123</p>
            <p><strong>Pharmacist:</strong> john@company.com / password123</p>
            <p><strong>Assistant:</strong> jane@company.com / password123</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;
