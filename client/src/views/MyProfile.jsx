// client/src/views/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign,
  AlertCircle,
  Edit,
  X,
  Save,
  CreditCard,
  FileText,
  Building2,
  Lock,
  ShieldCheck
} from 'lucide-react';

const MyProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingPrivileged, setEditingPrivileged] = useState(false); // ✅ For HR/Admin fields
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [privilegedFormData, setPrivilegedFormData] = useState({}); // ✅ For HR/Admin fields

  // ✅ Check if user can edit privileged fields
  const canEditPrivileged = ['admin', 'hr'].includes(currentUser?.role);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employee-profiles/${currentUser.id}`);
      setProfile(res.data.employee);
      setFormData({
        mobileNumber: res.data.employee.mobileNumber || '',
        personalEmail: res.data.employee.personalEmail || '',
        phoneNumber: res.data.employee.phoneNumber || '',
        streetAddress: res.data.employee.streetAddress || '',
        city: res.data.employee.city || '',
        stateProvince: res.data.employee.stateProvince || '',
        postalCode: res.data.employee.postalCode || '',
        emergencyContactName: res.data.employee.emergencyContactName || '',
        emergencyContactPhone: res.data.employee.emergencyContactPhone || '',
        emergencyContactRelationship: res.data.employee.emergencyContactRelationship || ''
      });
      
      // ✅ Set privileged data
      setPrivilegedFormData({
        idNumber: res.data.employee.idNumber || '',
        passportNumber: res.data.employee.passportNumber || '',
        taxNumber: res.data.employee.taxNumber || '',
        jobTitle: res.data.employee.jobTitle || '',
        bankName: res.data.employee.bankName || '',
        accountNumber: res.data.employee.accountNumber || '',
        accountType: res.data.employee.accountType || 'cheque',
        branchCode: res.data.employee.branchCode || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleEditPrivileged = () => {
    setEditingPrivileged(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original
    if (profile) {
      setFormData({
        mobileNumber: profile.mobileNumber || '',
        personalEmail: profile.personalEmail || '',
        phoneNumber: profile.phoneNumber || '',
        streetAddress: profile.streetAddress || '',
        city: profile.city || '',
        stateProvince: profile.stateProvince || '',
        postalCode: profile.postalCode || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactRelationship: profile.emergencyContactRelationship || ''
      });
    }
  };

  const handleCancelPrivileged = () => {
    setEditingPrivileged(false);
    // Reset privileged form data to original
    if (profile) {
      setPrivilegedFormData({
        idNumber: profile.idNumber || '',
        passportNumber: profile.passportNumber || '',
        taxNumber: profile.taxNumber || '',
        jobTitle: profile.jobTitle || '',
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
        accountType: profile.accountType || 'cheque',
        branchCode: profile.branchCode || ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivilegedChange = (e) => {
    const { name, value } = e.target;
    setPrivilegedFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/employee-profiles/${currentUser.id}`, formData);
      alert('Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivileged = async () => {
    try {
      setSaving(true);
      await api.put(`/employee-profiles/${currentUser.id}/privileged`, privilegedFormData);
      alert('Sensitive information updated successfully!');
      setEditingPrivileged(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update privileged info:', error);
      alert(error.response?.data?.message || 'Failed to update sensitive information');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const calculateTenure = (hireDate) => {
    if (!hireDate) return 'N/A';
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months < 0) {
      return `${years - 1} year${years - 1 !== 1 ? 's' : ''} ${12 + months} month${12 + months !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  const maskSensitiveData = (data, visibleChars = 4) => {
    if (!data) return 'Not provided';
    if (data.length <= visibleChars) return '*'.repeat(data.length);
    return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Your employee profile hasn't been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">
                {profile.firstName?.charAt(0) || 'E'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.jobTitle || 'Employee'}</p>
              <p className="text-sm text-gray-500">Employee #: {profile.employeeNumber}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Basic Information - Non-editable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <p className="font-medium text-gray-900">{profile.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Employee Number</label>
            <p className="font-medium text-gray-900">{profile.employeeNumber}</p>
          </div>
          {profile.dateOfBirth && (
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-medium text-gray-900">
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          )}
          {profile.gender && (
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <p className="font-medium text-gray-900 capitalize">{profile.gender}</p>
            </div>
          )}
          {profile.nationality && (
            <div>
              <label className="text-sm text-gray-600">Nationality</label>
              <p className="font-medium text-gray-900">{profile.nationality}</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Identification & Tax Information - HR/Admin Only */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Identification & Tax Information
          </h2>
          {canEditPrivileged && !editingPrivileged && (
            <button
              onClick={handleEditPrivileged}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Edit (HR/Admin)
            </button>
          )}
        </div>

        {!canEditPrivileged && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This information is managed by HR and cannot be edited by employees.
            </p>
          </div>
        )}

        {editingPrivileged ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number (SA Citizens)
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={privilegedFormData.idNumber}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0000000000000"
                  maxLength="13"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number (Foreign Nationals)
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={privilegedFormData.passportNumber}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="A00000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Number
                </label>
                <input
                  type="text"
                  name="taxNumber"
                  value={privilegedFormData.taxNumber}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0000000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={privilegedFormData.jobTitle}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Senior Developer"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">ID Number</label>
              <p className="font-medium text-gray-900">
                {canEditPrivileged 
                  ? (profile.idNumber || 'Not provided')
                  : maskSensitiveData(profile.idNumber)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Passport Number</label>
              <p className="font-medium text-gray-900">
                {canEditPrivileged 
                  ? (profile.passportNumber || 'Not provided')
                  : maskSensitiveData(profile.passportNumber)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tax Number</label>
              <p className="font-medium text-gray-900">
                {canEditPrivileged 
                  ? (profile.taxNumber || 'Not provided')
                  : maskSensitiveData(profile.taxNumber)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Job Title</label>
              <p className="font-medium text-gray-900">{profile.jobTitle || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Banking Details - HR/Admin Only */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Banking Details
          </h2>
          {canEditPrivileged && !editingPrivileged && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Edit above to modify
            </span>
          )}
        </div>

        {!canEditPrivileged && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Banking details are securely managed by HR for payroll purposes.
            </p>
          </div>
        )}

        {editingPrivileged ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <select
                  name="bankName"
                  value={privilegedFormData.bankName}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Bank</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Capitec">Capitec</option>
                  <option value="TymeBank">TymeBank</option>
                  <option value="Discovery Bank">Discovery Bank</option>
                  <option value="African Bank">African Bank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={privilegedFormData.accountType}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="cheque">Cheque/Current</option>
                  <option value="savings">Savings</option>
                  <option value="transmission">Transmission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={privilegedFormData.accountNumber}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0000000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Code
                </label>
                <input
                  type="text"
                  name="branchCode"
                  value={privilegedFormData.branchCode}
                  onChange={handlePrivilegedChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="000000"
                  maxLength="6"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Bank Name</label>
              <p className="font-medium text-gray-900">{profile.bankName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Account Type</label>
              <p className="font-medium text-gray-900 capitalize">{profile.accountType || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Account Number</label>
              <p className="font-medium text-gray-900">
                {canEditPrivileged 
                  ? (profile.accountNumber || 'Not provided')
                  : maskSensitiveData(profile.accountNumber)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Branch Code</label>
              <p className="font-medium text-gray-900">
                {canEditPrivileged 
                  ? (profile.branchCode || 'Not provided')
                  : maskSensitiveData(profile.branchCode, 2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information - Editable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contact Information
        </h2>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="+27 82 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Email
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="personal@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Mobile Number</label>
              <p className="font-medium text-gray-900">{profile.mobileNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Personal Email</label>
              <p className="font-medium text-gray-900">{profile.personalEmail || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <p className="font-medium text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Address - Editable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Address
        </h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Johannesburg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Gauteng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Street Address</label>
              <p className="font-medium text-gray-900">{profile.streetAddress || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">City</label>
              <p className="font-medium text-gray-900">{profile.city || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Province</label>
              <p className="font-medium text-gray-900">{profile.stateProvince || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Postal Code</label>
              <p className="font-medium text-gray-900">{profile.postalCode || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact - Editable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Emergency Contact
        </h2>
        {editing ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Contact Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="+27 82 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Spouse, Parent, etc."
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium text-gray-900">{profile.emergencyContactName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium text-gray-900">{profile.emergencyContactPhone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Relationship</label>
              <p className="font-medium text-gray-900">{profile.emergencyContactRelationship || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Employment Information - Read Only */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Employment Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Department</label>
            <p className="font-medium text-gray-900">{profile.departmentName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Position</label>
            <p className="font-medium text-gray-900">{profile.jobTitle || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Employment Type</label>
            <p className="font-medium text-gray-900 capitalize">{profile.employmentType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p className="font-medium text-gray-900 capitalize">{profile.employmentStatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Hire Date</label>
            <p className="font-medium text-gray-900">
              {profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tenure</label>
            <p className="font-medium text-gray-900">
              {calculateTenure(profile.hireDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Compensation - Read Only */}
      {profile.currentSalary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Compensation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Base Salary</label>
              <p className="font-medium text-gray-900">{formatCurrency(profile.currentSalary)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Payment Frequency</label>
              <p className="font-medium text-gray-900 capitalize">{profile.paymentFrequency || 'Monthly'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Balance - Read Only */}
      {profile.leaveBalance && profile.leaveBalance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Balance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {profile.leaveBalance.map(balance => (
              <div key={balance.leaveType} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 capitalize">{balance.leaveType}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {balance.remainingDays}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {balance.totalDays} days
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Actions - Regular Fields */}
      {editing && (
        <div className="bg-white rounded-lg shadow p-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Edit Actions - Privileged Fields */}
      {editingPrivileged && (
        <div className="bg-white rounded-lg shadow p-6 flex justify-end gap-3">
          <button
            onClick={handleCancelPrivileged}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSavePrivileged}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Sensitive Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;