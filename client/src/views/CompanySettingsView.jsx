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
  FileText,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import SubscriptionPlans from '../components/SubscriptionPlans';

const CompanySettingsView = () => {
  const { company, currentUser, token, refreshCompany } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null); // ✅ Store actual file, not base64
  
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

  // Add after existing state declarations
  const [sopSeeding, setSopSeeding] = useState({
    isSeeding: false,
    seedResult: null,
    error: null,
    isDryRun: false
  });

  // Add after sopSeeding state
  const [assessmentSeeding, setAssessmentSeeding] = useState({
    isSeeding: false,
    seedResult: null,
    error: null,
    isDryRun: false
  });

  // ✅ FIX: Load company data only when company exists
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

  // ✅ FIX: Load settings ONLY when auth is ready
  useEffect(() => {
    const fetchSettings = async () => {
      // ✅ Wait for company, user, and token to be ready
      if (!company || !currentUser || !token) {
        console.log('⏳ Waiting for auth to be ready before fetching settings...');
        return;
      }

      try {
        console.log('📥 Fetching company settings...');
        const response = await api.get('companies/settings'); // ✅ No leading slash
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
        
        console.log('✅ Settings loaded successfully');
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        // Don't show error message - just log it
        // This prevents the "disappearing error" issue
      }
    };

    fetchSettings();
  }, [company, currentUser, token]); // ✅ Wait for all auth to be ready

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

  // ✅ FIX: Handle logo upload with file validation
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo file size must be less than 5MB' });
      return;
    }

    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Logo must be a valid image file (JPG, PNG, GIF, or WebP)' });
      return;
    }

    // ✅ Store file for upload
    setLogoFile(file);

    // ✅ Create preview (but don't store base64 in state for DB)
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setBranding({ ...branding, logoUrl: '' });
  };

  // Save general info
  const handleSaveGeneral = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('companies/me', { // ✅ No leading slash
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

  // ✅ FIX: Save branding with proper file upload
  const handleSaveBranding = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // ✅ TODO: In production, upload logo to S3/CloudFlare/Cloudinary
      // For now, we'll use base64 but this should be replaced with proper file upload
      let logoUrl = branding.logoUrl;

      if (logoFile) {
        // ✅ Create FormData for file upload
        const formData = new FormData();
        formData.append('logo', logoFile);
        formData.append('primaryColor', branding.primaryColor);
        formData.append('secondaryColor', branding.secondaryColor);

        // ✅ Upload to backend (backend should handle S3/CloudFlare upload)
        const uploadResponse = await api.post('companies/branding', formData, { // ✅ No leading slash
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        logoUrl = uploadResponse.data.logoUrl;
      } else {
        // ✅ Update colors only
        await api.put('companies/me', { // ✅ No leading slash
          branding: {
            logoUrl: branding.logoUrl,
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor
          }
        });
      }

      await refreshCompany(company.id);
      setMessage({ type: 'success', text: 'Branding updated successfully!' });
      setLogoFile(null); // Clear file after upload
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
      await api.put('companies/settings', { // ✅ No leading slash
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

  // Add before the return statement

  // Handle SOP seeding
  const handleSeedSOPs = async (dryRun = false) => {
    setSopSeeding({ ...sopSeeding, isSeeding: true, error: null, seedResult: null, isDryRun: dryRun });

    try {
      console.log(`🌱 ${dryRun ? 'Dry run' : 'Seeding'} SOPs...`);
      
      const response = await api.post(
        `admin/seed/sops${dryRun ? '?dryRun=true' : ''}`
      );

      setSopSeeding({
        ...sopSeeding,
        isSeeding: false,
        seedResult: response.data,
        error: null,
        isDryRun: dryRun
      });

      if (!dryRun) {
        setMessage({ 
          type: 'success', 
          text: `Successfully seeded ${response.data.created} SOPs!` 
        });
      }

      console.log('✅ SOP seeding completed:', response.data);
    } catch (err) {
      console.error('❌ SOP seeding error:', err);
      setSopSeeding({
        ...sopSeeding,
        isSeeding: false,
        error: err.response?.data?.error || 'Failed to seed SOPs',
        seedResult: null
      });
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to seed SOPs' 
      });
    }
  };

  // Add after handleSeedSOPs function

  // Handle Assessment seeding
  const handleSeedAssessments = async (dryRun = false) => {
    setAssessmentSeeding({ 
      ...assessmentSeeding, 
      isSeeding: true, 
      error: null, 
      seedResult: null, 
      isDryRun: dryRun 
    });

    try {
      console.log(`🌱 ${dryRun ? 'Dry run' : 'Seeding'} assessments...`);
      
      const response = await api.post(
        `admin/seed/assessments${dryRun ? '?dryRun=true' : ''}`
      );

      setAssessmentSeeding({
        ...assessmentSeeding,
        isSeeding: false,
        seedResult: response.data,
        error: null,
        isDryRun: dryRun
      });

      if (!dryRun) {
        setMessage({ 
          type: 'success', 
          text: `Successfully seeded ${response.data.createdAssessments} assessments with ${response.data.createdQuestions} questions!` 
        });
      }

      console.log('✅ Assessment seeding completed:', response.data);
    } catch (err) {
      console.error('❌ Assessment seeding error:', err);
      setAssessmentSeeding({
        ...assessmentSeeding,
        isSeeding: false,
        error: err.response?.data?.error || 'Failed to seed assessments',
        seedResult: null
      });
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to seed assessments' 
      });
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

              {/* Add this tab after the "System Settings" tab and before "Subscription" tab */}
              <button
                onClick={() => setActiveTab('sops')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sops'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  SOPs
                </div>
              </button>

              {/* Add this tab after the SOPs tab */}
              <button
                onClick={() => setActiveTab('assessments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'assessments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Assessments
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
                {/* ✅ TODO Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Logo Upload - Development Mode
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Currently, logos are stored as base64. In production, this should be replaced with proper file upload to S3/CloudFlare/Cloudinary for better performance and scalability.
                      </p>
                    </div>
                  </div>
                </div>

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
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
                        JPG, PNG, GIF, or WebP (max. 5MB). Recommended size: 200x200px
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

            {/* SOP Management Tab */}
            {activeTab === 'sops' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Standard Operating Procedures
                  </h2>
                  <p className="text-sm text-gray-600">
                    Initialize your company with standard HR policies and procedures including 
                    attendance policies, leave procedures, code of conduct, data security, and more.
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        What are SOPs?
                      </h4>
                      <p className="text-sm text-blue-800">
                        Standard Operating Procedures are company-wide policies and procedures that 
                        employees must acknowledge. This includes attendance policies, leave management, 
                        code of conduct, and security guidelines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seeding Options */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Initialize SOPs</h3>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    Click below to seed your company with standard HR policies. This is safe to run 
                    multiple times - existing SOPs won't be duplicated.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={() => handleSeedSOPs(false)}
                      disabled={sopSeeding.isSeeding}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sopSeeding.isSeeding && !sopSeeding.isDryRun && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <FileText className="w-4 h-4" />
                      Seed Company SOPs
                    </button>

                    <button
                      onClick={() => handleSeedSOPs(true)}
                      disabled={sopSeeding.isSeeding}
                      className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sopSeeding.isSeeding && sopSeeding.isDryRun && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Preview (Dry Run)
                    </button>
                  </div>

                  {/* Success Result */}
                  {sopSeeding.seedResult && !sopSeeding.error && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 mb-2">
                            {sopSeeding.seedResult.message}
                          </h4>
                          
                          <div className="space-y-2 text-sm text-green-800">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Created</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {sopSeeding.seedResult.created}
                                </div>
                              </div>
                              
                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Skipped</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {sopSeeding.seedResult.skipped}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <div className="text-xs text-green-700 font-medium">
                                Total Templates: {sopSeeding.seedResult.totalTemplates}
                              </div>
                            </div>

                            {sopSeeding.isDryRun && (
                              <div className="mt-3 pt-3 border-t border-green-300">
                                <div className="text-xs font-medium text-green-900 mb-1">
                                  ℹ️ This was a preview - no changes were made
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Show created SOPs */}
                          {sopSeeding.seedResult.createdSOPs && sopSeeding.seedResult.createdSOPs.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-300">
                              <div className="text-sm font-medium text-green-900 mb-2">
                                {sopSeeding.isDryRun ? 'Would Create:' : 'Created SOPs:'}
                              </div>
                              <ul className="space-y-1">
                                {sopSeeding.seedResult.createdSOPs.map((sop, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-green-800">
                                    <Check className="w-3 h-3 text-green-600" />
                                    {sop}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Show skipped SOPs */}
                          {sopSeeding.seedResult.skippedSOPs && sopSeeding.seedResult.skippedSOPs.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-300">
                              <div className="text-sm font-medium text-green-900 mb-2">
                                Already Exists:
                              </div>
                              <ul className="space-y-1">
                                {sopSeeding.seedResult.skippedSOPs.map((sop, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-green-800">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {sop}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {sopSeeding.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900 mb-1">
                            Seeding Failed
                          </h4>
                          <p className="text-sm text-red-800">
                            {sopSeeding.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Templates Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Templates</h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Attendance Policy',
                        category: 'Policy',
                        description: 'Standard working hours, clock-in/out requirements, and late arrival procedures'
                      },
                      {
                        title: 'Leave Request Procedure',
                        category: 'Procedure',
                        description: 'How to request annual, sick, and other types of leave'
                      },
                      {
                        title: 'Code of Conduct',
                        category: 'Policy',
                        description: 'Professional behavior, respect, confidentiality, and ethical standards'
                      },
                      {
                        title: 'Data Security Policy',
                        category: 'Policy',
                        description: 'Password requirements, data access, and device security guidelines'
                      },
                      {
                        title: 'Performance Review Process',
                        category: 'Procedure',
                        description: 'Annual review schedule, components, and goal-setting guidelines'
                      },
                      {
                        title: 'Health and Safety Policy',
                        category: 'Policy',
                        description: 'Workplace safety, emergency procedures, and accident reporting'
                      }
                    ].map((template, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{template.title}</h4>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                {template.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {template.description}
                            </p>
                          </div>
                          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      💡 These templates will be customized with your company information and made available 
                      to all employees for acknowledgment.
                    </p>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Need Custom SOPs?
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Want to add industry-specific policies or custom procedures? Contact our support 
                        team for assistance with creating tailored SOPs for your organization.
                      </p>
                      <a 
                        href="mailto:support@yourapp.com"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Contact Support →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessments Management Tab */}
            {activeTab === 'assessments' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Assessment & Certification System
                  </h2>
                  <p className="text-sm text-gray-600">
                    Initialize your company with SOP assessments, quizzes, and achievement badges. 
                    Employees can take assessments, earn certifications, and unlock badges.
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        What are Assessments?
                      </h4>
                      <p className="text-sm text-blue-800">
                        Assessments test employee knowledge of company SOPs and procedures. Employees 
                        must pass assessments to earn certifications and can unlock achievement badges 
                        based on their performance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seeding Options */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Initialize Assessments</h3>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    Click below to seed your company with assessment templates, questions, and badges. 
                    This is safe to run multiple times - existing assessments won't be duplicated.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={() => handleSeedAssessments(false)}
                      disabled={assessmentSeeding.isSeeding}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {assessmentSeeding.isSeeding && !assessmentSeeding.isDryRun && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <FileText className="w-4 h-4" />
                      Seed Company Assessments
                    </button>

                    <button
                      onClick={() => handleSeedAssessments(true)}
                      disabled={assessmentSeeding.isSeeding}
                      className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {assessmentSeeding.isSeeding && assessmentSeeding.isDryRun && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Preview (Dry Run)
                    </button>
                  </div>

                  {/* Success Result */}
                  {assessmentSeeding.seedResult && !assessmentSeeding.error && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 mb-2">
                            {assessmentSeeding.seedResult.message}
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Assessments Created</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {assessmentSeeding.seedResult.createdAssessments || 0}
                                </div>
                              </div>
                              
                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Questions Created</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {assessmentSeeding.seedResult.createdQuestions || 0}
                                </div>
                              </div>

                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Badges Created</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {assessmentSeeding.seedResult.createdBadges || 0}
                                </div>
                              </div>

                              <div className="bg-green-100 rounded-lg p-3">
                                <div className="text-xs text-green-700 mb-1">Skipped</div>
                                <div className="text-2xl font-bold text-green-900">
                                  {assessmentSeeding.seedResult.skippedAssessments || 0}
                                </div>
                              </div>
                            </div>

                            {assessmentSeeding.isDryRun && (
                              <div className="pt-3 border-t border-green-300">
                                <div className="text-xs font-medium text-green-900 mb-1">
                                  ℹ️ This was a preview - no changes were made
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Show created assessments */}
                          {assessmentSeeding.seedResult.createdList && 
                          assessmentSeeding.seedResult.createdList.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-300">
                              <div className="text-sm font-medium text-green-900 mb-2">
                                {assessmentSeeding.isDryRun ? 'Would Create:' : 'Created Assessments:'}
                              </div>
                              <ul className="space-y-1">
                                {assessmentSeeding.seedResult.createdList.map((assessment, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-green-800">
                                    <Check className="w-3 h-3 text-green-600" />
                                    {assessment}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Show skipped assessments */}
                          {assessmentSeeding.seedResult.skippedList && 
                          assessmentSeeding.seedResult.skippedList.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-300">
                              <div className="text-sm font-medium text-green-900 mb-2">
                                Already Exists:
                              </div>
                              <ul className="space-y-1">
                                {assessmentSeeding.seedResult.skippedList.map((assessment, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-green-800">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {assessment}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {assessmentSeeding.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900 mb-1">
                            Seeding Failed
                          </h4>
                          <p className="text-sm text-red-800">
                            {assessmentSeeding.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Templates Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Assessment Templates</h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Sales SOP Assessment',
                        description: 'Test knowledge of sales procedures, customer service, and till operations',
                        questions: 20,
                        difficulty: 'Intermediate',
                        passingScore: '80%'
                      },
                      {
                        title: 'Cash Handling & Financial SOP Assessment',
                        description: 'Test knowledge of cash handling procedures, fraud prevention, and financial controls',
                        questions: 20,
                        difficulty: 'Intermediate',
                        passingScore: '80%'
                      }
                    ].map((template, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {template.description}
                            </p>
                          </div>
                          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {template.questions} questions
                          </span>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            {template.difficulty}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Passing: {template.passingScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Achievement Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: '🏆', name: 'Perfect Score', rarity: 'Epic' },
                        { icon: '🎯', name: 'First Attempt', rarity: 'Rare' },
                        { icon: '🌟', name: 'SOP Master', rarity: 'Legendary' },
                        { icon: '⚡', name: 'Speed Demon', rarity: 'Rare' },
                        { icon: '💪', name: 'Persistent Learner', rarity: 'Common' },
                        { icon: '🚀', name: 'Quick Learner', rarity: 'Rare' }
                      ].map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                          <span>{badge.icon}</span>
                          <span className="font-medium text-gray-700">{badge.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            badge.rarity === 'Legendary' ? 'bg-purple-200 text-purple-800' :
                            badge.rarity === 'Epic' ? 'bg-pink-200 text-pink-800' :
                            badge.rarity === 'Rare' ? 'bg-blue-200 text-blue-800' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {badge.rarity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      💡 Assessments will be automatically linked to your SOPs. Employees can take 
                      assessments to earn certifications and unlock achievement badges.
                    </p>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Need Custom Assessments?
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Want to create custom questions or industry-specific assessments? Contact our 
                        support team for assistance with creating tailored assessments for your organization.
                      </p>
                      <a 
                        href="mailto:support@yourapp.com"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Contact Support →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* ✅ TODO Warning */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        Development Mode - No Payment Processing
                      </h4>
                      <p className="text-sm text-blue-800">
                        Subscription changes are for testing only. In production, this should integrate with Stripe/PayFast for payment processing and webhook verification.
                      </p>
                    </div>
                  </div>
                </div>

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
                    <p className="text-xs text-gray-400 mt-1">Payment integration coming soon</p>
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