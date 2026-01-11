// client/src/views/CompanySettingsView.jsx

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Upload, 
  X, 
  Palette, 
  Globe, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import SubscriptionPlans from '../components/SubscriptionPlans';

const CompanySettingsView = () => {
  const { company, currentUser, refreshCompany } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Form states
  const [generalInfo, setGeneralInfo] = useState({
    companyName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa'
  });

  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed'
  });

  const [settings, setSettings] = useState({
    workStartTime: '08:00',
    workEndTime: '17:00',
    timezone: 'Africa/Harare',
    annualLeaveDays: 21,
    sickLeaveDays: 30,
    lateThresholdMinutes: 15,
    earlyLeaveThresholdMinutes: 15,
    requireClockOut: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false
  });

  // Add state for showing plans modal
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Load company data
  useEffect(() => {
    if (company) {
      setGeneralInfo({
        companyName: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        addressLine1: company.address?.line1 || '',
        addressLine2: company.address?.line2 || '',
        city: company.address?.city || '',
        province: company.address?.province || '',
        postalCode: company.address?.postalCode || '',
        country: company.address?.country || 'South Africa'
      });

      setBranding({
        logoUrl: company.branding?.logoUrl || '',
        primaryColor: company.branding?.primaryColor || '#4f46e5',
        secondaryColor: company.branding?.secondaryColor || '#7c3aed'
      });

      setLogoPreview(company.branding?.logoUrl || null);
    }
  }, [company]);

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/companies/settings');
        const data = response.data;
        
        setSettings({
          workStartTime: data.work_start_time || '08:00',
          workEndTime: data.work_end_time || '17:00',
          timezone: data.timezone || 'Africa/Harare',
          annualLeaveDays: data.annual_leave_days || 21,
          sickLeaveDays: data.sick_leave_days || 30,
          lateThresholdMinutes: data.late_threshold_minutes || 15,
          earlyLeaveThresholdMinutes: data.early_leave_threshold_minutes || 15,
          requireClockOut: data.require_clock_out ?? true,
          enableEmailNotifications: data.enable_email_notifications ?? true,
          enableSmsNotifications: data.enable_sms_notifications ?? false
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Access Restricted
            </h3>
            <p className="text-yellow-700">
              Only administrators can access company settings. Please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Logo file size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setBranding({ ...branding, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setBranding({ ...branding, logoUrl: '' });
  };

  // Save general info
  const handleSaveGeneral = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/companies/me', {
        companyName: generalInfo.companyName,
        email: generalInfo.email,
        phone: generalInfo.phone,
        address: {
          line1: generalInfo.addressLine1,
          line2: generalInfo.addressLine2,
          city: generalInfo.city,
          province: generalInfo.province,
          postalCode: generalInfo.postalCode,
          country: generalInfo.country
        }
      });

      await refreshCompany(company.id);
      setMessage({ type: 'success', text: 'Company information updated successfully!' });
    } catch (error) {
      console.error('Error updating company info:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update company information' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Save branding
  const handleSaveBranding = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/companies/me', {
        branding: {
          logoUrl: branding.logoUrl,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor
        }
      });

      await refreshCompany(company.id);
      setMessage({ type: 'success', text: 'Branding updated successfully!' });
    } catch (error) {
      console.error('Error updating branding:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update branding' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/companies/settings', {
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        timezone: settings.timezone,
        annualLeaveDays: settings.annualLeaveDays,
        sickLeaveDays: settings.sickLeaveDays,
        lateThresholdMinutes: settings.lateThresholdMinutes,
        earlyLeaveThresholdMinutes: settings.earlyLeaveThresholdMinutes,
        requireClockOut: settings.requireClockOut,
        enableEmailNotifications: settings.enableEmailNotifications,
        enableSmsNotifications: settings.enableSmsNotifications
      });

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
              <p className="text-gray-600">Manage your company information and preferences</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-auto"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'general'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  General
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('branding')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'branding'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Branding
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  System Settings
                </div>
              </button>

              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Company Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={generalInfo.companyName}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, companyName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Acme Corporation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={generalInfo.email}
                          onChange={(e) => setGeneralInfo({ ...generalInfo, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="info@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={generalInfo.phone}
                          onChange={(e) => setGeneralInfo({ ...generalInfo, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="+27 11 123 4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subdomain
                      </label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{company?.subdomain}.yourapp.com</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact support to change your subdomain
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={generalInfo.addressLine1}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={generalInfo.addressLine2}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, addressLine2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Suite 100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={generalInfo.city}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Johannesburg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province
                      </label>
                      <input
                        type="text"
                        value={generalInfo.province}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, province: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Gauteng"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={generalInfo.postalCode}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, postalCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="2000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={generalInfo.country}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="South Africa">South Africa</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="Botswana">Botswana</option>
                        <option value="Namibia">Namibia</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Company Logo
                  </h2>
                  
                  <div className="flex items-start gap-6">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Company logo"
                            className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg p-2 bg-white"
                          />
                          <button
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <label className="block">
                        <span className="sr-only">Choose logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                            cursor-pointer"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG or GIF (max. 5MB). Recommended size: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Brand Colors
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={branding.primaryColor}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                            placeholder="#4f46e5"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Used for buttons, links, and highlights
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                          className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={branding.secondaryColor}
                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                            placeholder="#7c3aed"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Used for accents and secondary elements
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
                    <div className="flex gap-4">
                      <button
                        style={{ backgroundColor: branding.primaryColor }}
                        className="px-6 py-2 text-white rounded-lg font-medium"
                      >
                        Primary Button
                      </button>
                      <button
                        style={{ backgroundColor: branding.secondaryColor }}
                        className="px-6 py-2 text-white rounded-lg font-medium"
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveBranding}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Branding'}
                  </button>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Work Hours
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={settings.workStartTime}
                        onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={settings.workEndTime}
                        onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Africa/Harare">Africa/Harare (GMT+2)</option>
                        <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
                        <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Leave Policies
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Leave Days (per year)
                      </label>
                      <input
                        type="number"
                        value={settings.annualLeaveDays}
                        onChange={(e) => setSettings({ ...settings, annualLeaveDays: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sick Leave Days (per 3-year cycle)
                      </label>
                      <input
                        type="number"
                        value={settings.sickLeaveDays}
                        onChange={(e) => setSettings({ ...settings, sickLeaveDays: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Attendance Rules
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Late Threshold (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.lateThresholdMinutes}
                        onChange={(e) => setSettings({ ...settings, lateThresholdMinutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mark as late if clock-in is after this many minutes
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Early Leave Threshold (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.earlyLeaveThresholdMinutes}
                        onChange={(e) => setSettings({ ...settings, earlyLeaveThresholdMinutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mark as early if clock-out is before this many minutes
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireClockOut}
                        onChange={(e) => setSettings({ ...settings, requireClockOut: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Require employees to clock out
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Notifications
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications}
                        onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable email notifications
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableSmsNotifications}
                        onChange={(e) => setSettings({ ...settings, enableSmsNotifications: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable SMS notifications
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {/* {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {company?.subscription?.plan?.charAt(0).toUpperCase() + company?.subscription?.plan?.slice(1)} Plan
                      </h2>
                      <p className="text-gray-600">
                        {company?.subscription?.plan === 'trial' 
                          ? 'Your trial period is active'
                          : 'Your subscription is active'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Employees</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {company?.stats?.employeeCount || 0} / {company?.subscription?.maxEmployees || '∞'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-600">Plan</dt>
                        <dd className="text-base font-medium text-gray-900 capitalize">
                          {company?.subscription?.plan}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Started</dt>
                        <dd className="text-base font-medium text-gray-900">
                          {company?.subscription?.startDate 
                            ? new Date(company.subscription.startDate).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">
                          {company?.subscription?.plan === 'trial' ? 'Trial Ends' : 'Renews'}
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          {company?.subscription?.endDate 
                            ? new Date(company.subscription.endDate).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Status</dt>
                        <dd>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company?.subscription?.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company?.subscription?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Upgrade Options</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upgrade your plan to unlock more features and add more employees.
                    </p>
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      View Plans
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Need help with billing?
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Contact our support team at modipals@gmail.com for billing inquiries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {company?.subscription?.plan?.charAt(0).toUpperCase() + company?.subscription?.plan?.slice(1)} Plan
                    </h2>
                    <p className="text-gray-600">
                        {company?.subscription?.plan === 'trial' 
                        ? 'Your trial period is active'
                        : 'Your subscription is active'}
                    </p>
                    </div>
                    <div className="text-right">
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {company?.stats?.employeeCount || 0} / {company?.subscription?.maxEmployees || '∞'}
                    </p>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                    <dl className="space-y-3">
                    <div>
                        <dt className="text-sm text-gray-600">Plan</dt>
                        <dd className="text-base font-medium text-gray-900 capitalize">
                        {company?.subscription?.plan}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-600">Started</dt>
                        <dd className="text-base font-medium text-gray-900">
                        {company?.subscription?.startDate 
                            ? new Date(company.subscription.startDate).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-600">
                        {company?.subscription?.plan === 'trial' ? 'Trial Ends' : 'Renews'}
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                        {company?.subscription?.endDate 
                            ? new Date(company.subscription.endDate).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-600">Status</dt>
                        <dd>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company?.subscription?.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                            {company?.subscription?.isActive ? 'Active' : 'Inactive'}
                        </span>
                        </dd>
                    </div>
                    </dl>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Upgrade Options</h3>
                    <p className="text-sm text-gray-600 mb-4">
                    Upgrade your plan to unlock more features and add more employees.
                    </p>
                    
                    {/* Plan Benefits Preview */}
                    <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500" />
                        More employee capacity
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500" />
                        Advanced analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500" />
                        Payroll processing
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500" />
                        Priority support
                    </li>
                    </ul>
                    
                    <button 
                    onClick={() => setShowPlansModal(true)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                    View Plans
                    <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                </div>

                {/* Trial Warning */}
                {company?.subscription?.plan === 'trial' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-yellow-900 mb-1">
                        Trial Period Ending Soon
                        </h4>
                        <p className="text-sm text-yellow-800 mb-3">
                        Your trial ends on {company?.subscription?.endDate 
                            ? new Date(company.subscription.endDate).toLocaleDateString()
                            : 'soon'}. 
                        Upgrade now to continue using all features without interruption.
                        </p>
                        <button 
                        onClick={() => setShowPlansModal(true)}
                        className="text-sm font-medium text-yellow-900 underline hover:text-yellow-800"
                        >
                        Upgrade Now →
                        </button>
                    </div>
                    </div>
                </div>
                )}

                {/* Billing History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
                <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No billing history available</p>
                </div>
                </div>

                {/* Contact Support */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                        Need help with billing or subscriptions?
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">
                        Our support team is here to help you choose the right plan.
                    </p>
                    <a 
                        href="mailto:support@yourapp.com"
                        className="text-sm font-medium text-blue-900 underline hover:text-blue-800"
                    >
                        Contact Support →
                    </a>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Plans Modal */}
            {showPlansModal && (
            <SubscriptionPlans
                currentPlan={company?.subscription?.plan}
                onClose={() => setShowPlansModal(false)}
                onUpgrade={async (plan) => {
                // Refresh company data after upgrade
                await refreshCompany(company.id);
                setShowPlansModal(false);
                setMessage({ 
                    type: 'success', 
                    text: `Successfully upgraded to ${plan.name} plan!` 
                });
                }}
            />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsView;