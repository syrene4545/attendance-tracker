// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Users, 
//   TrendingUp, 
//   Target,
//   Award,
//   BookOpen,
//   AlertTriangle,
//   ChevronDown,
//   ChevronUp,
//   ArrowLeft,
//   CheckCircle,
//   XCircle,
//   Clock
// } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const ManagerAssessmentAnalyticsView = ({ onViewChange }) => {
//   const [teamOverview, setTeamOverview] = useState(null);
//   const [weakAreas, setWeakAreas] = useState([]);
//   const [selectedSop, setSelectedSop] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [expandedEmployee, setExpandedEmployee] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState({});

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (selectedSop !== 'all') {
//       fetchWeakAreas(selectedSop);
//     } else {
//       fetchWeakAreas();
//     }
//   }, [selectedSop]);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       const [overviewRes, weakAreasRes] = await Promise.all([
//         axios.get(`${API_URL}/assessment-analytics/team-overview`, { headers }),
//         axios.get(`${API_URL}/assessment-analytics/weak-areas`, { headers })
//       ]);

//       setTeamOverview(overviewRes.data);
//       setWeakAreas(weakAreasRes.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//       setLoading(false);
//     }
//   };

//   const fetchWeakAreas = async (sopId = null) => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       const endpoint = sopId 
//         ? `${API_URL}/assessment-analytics/weak-areas/${sopId}`
//         : `${API_URL}/assessment-analytics/weak-areas`;

//       const weakAreasRes = await axios.get(endpoint, { headers });
//       setWeakAreas(weakAreasRes.data);
//     } catch (error) {
//       console.error('Error fetching weak areas:', error);
//     }
//   };

//   const fetchEmployeeDetails = async (userId) => {
//     if (employeeDetails[userId]) {
//       setExpandedEmployee(expandedEmployee === userId ? null : userId);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       const response = await axios.get(
//         `${API_URL}/assessment-analytics/employee/${userId}`,
//         { headers }
//       );

//       setEmployeeDetails(prev => ({
//         ...prev,
//         [userId]: response.data
//       }));
//       setExpandedEmployee(userId);
//     } catch (error) {
//       console.error('Error fetching employee details:', error);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'certified':
//         return 'bg-green-100 text-green-800';
//       case 'attempted':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'not-started':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-8">
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading analytics...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!teamOverview) {
//     return (
//       <div className="p-8">
//         <button
//           onClick={() => onViewChange('dashboard')}
//           className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Dashboard
//         </button>
//         <div className="text-center py-12">
//           <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="mb-6">
//         <button
//           onClick={() => onViewChange('dashboard')}
//           className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Dashboard
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900">Team Assessment Analytics</h1>
//         <p className="mt-2 text-gray-600">
//           Monitor team progress and identify training needs
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <BookOpen className="h-8 w-8 text-indigo-600" />
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Assessments</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {teamOverview.totalAssessments}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <Users className="h-8 w-8 text-green-600" />
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Employees</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {teamOverview.totalEmployees}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <Target className="h-8 w-8 text-purple-600" />
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Completion Rate</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {Math.round(teamOverview.overallCompletion)}%
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <TrendingUp className="h-8 w-8 text-yellow-600" />
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Average Score</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {Math.round(teamOverview.averageScore)}%
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Assessment Breakdown */}
//       <div className="bg-white rounded-lg shadow mb-8">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-gray-900">Assessment Breakdown</h2>
//         </div>
//         <div className="p-6">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Assessment
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Attempted
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Completed
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Completion Rate
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Avg Score
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total Attempts
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {teamOverview.byAssessment.map((assessment) => (
//                   <tr key={assessment.sopId} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {assessment.title}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{assessment.attempted}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
//                         <span className="text-sm text-gray-900">{assessment.completed}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
//                           <div
//                             className="bg-indigo-600 h-2 rounded-full"
//                             style={{ width: `${Math.min(assessment.completionRate, 100)}%` }}
//                           ></div>
//                         </div>
//                         <span className="text-sm text-gray-900">
//                           {Math.round(assessment.completionRate)}%
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                         assessment.averageScore >= 80
//                           ? 'bg-green-100 text-green-800'
//                           : assessment.averageScore >= 60
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {assessment.averageScore}%
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{assessment.totalAttempts}</div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Weak Areas */}
//       <div className="bg-white rounded-lg shadow mb-8">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900">Common Weak Areas</h2>
//             <select
//               value={selectedSop}
//               onChange={(e) => setSelectedSop(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-md text-sm"
//             >
//               <option value="all">All Assessments</option>
//               {teamOverview.byAssessment.map((assessment) => (
//                 <option key={assessment.sopId} value={assessment.sopId}>
//                   {assessment.title}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="p-6">
//           {weakAreas.length === 0 ? (
//             <div className="text-center py-12">
//               <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
//               <p className="text-gray-600">No weak areas identified yet</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {weakAreas.map((area, index) => (
//                 <div
//                   key={area.questionId}
//                   className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-bold">
//                           #{index + 1}
//                         </span>
//                         <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
//                           {area.category}
//                         </span>
//                       </div>
//                       <p className="text-gray-900 mb-2">{area.question}</p>
//                       <div className="flex items-center gap-4 text-sm text-gray-600">
//                         <span>
//                           <XCircle className="inline w-4 h-4 text-red-600 mr-1" />
//                           {area.incorrectCount} incorrect
//                         </span>
//                         <span>out of {area.totalAnswers} total answers</span>
//                         <span className="font-semibold text-red-600">
//                           {Math.round(area.incorrectRate)}% error rate
//                         </span>
//                       </div>
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-3xl font-bold text-red-600">
//                         {Math.round(area.incorrectRate)}%
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerAssessmentAnalyticsView;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  Target,
  Award,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManagerAssessmentAnalyticsView = ({ onViewChange }) => {
  const [teamOverview, setTeamOverview] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const [employees, setEmployees] = useState([]);

//   const filteredEmployees = Array.isArray(employees) 
//     ? employees.filter(emp => 
//         emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//     : [];

  const [selectedSop, setSelectedSop] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, employees, weak-areas

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSop !== 'all') {
      fetchWeakAreas(selectedSop);
    } else {
      fetchWeakAreas();
    }
  }, [selectedSop]);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       const [overviewRes, weakAreasRes, employeesRes] = await Promise.all([
//         axios.get(`${API_URL}/assessment-analytics/team-overview`, { headers }),
//         axios.get(`${API_URL}/assessment-analytics/weak-areas`, { headers }),
//         axios.get(`${API_URL}/users`, { headers }) // Get all users
//       ]);

//       setTeamOverview(overviewRes.data);
//       setWeakAreas(weakAreasRes.data);
//       setEmployees(employeesRes.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//       setLoading(false);
//     }
//   };

  const fetchData = async () => {
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [overviewRes, weakAreasRes, employeesRes] = await Promise.all([
        axios.get(`${API_URL}/assessment-analytics/team-overview`, { headers }),
        axios.get(`${API_URL}/assessment-analytics/weak-areas`, { headers }),
        axios.get(`${API_URL}/users`, { headers }) // Get all users
        ]);

        setTeamOverview(overviewRes.data);
        setWeakAreas(weakAreasRes.data);
        
        // ✅ FIX: Ensure employees is always an array
        const employeesList = Array.isArray(employeesRes.data) 
        ? employeesRes.data 
        : employeesRes.data?.users || [];
        
        console.log('Employees data:', employeesList); // Debug
        setEmployees(employeesList);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        setEmployees([]); // ✅ Set empty array on error
        setLoading(false);
    }
  };

  const fetchWeakAreas = async (sopId = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const endpoint = sopId 
        ? `${API_URL}/assessment-analytics/weak-areas/${sopId}`
        : `${API_URL}/assessment-analytics/weak-areas`;

      const weakAreasRes = await axios.get(endpoint, { headers });
      setWeakAreas(weakAreasRes.data);
    } catch (error) {
      console.error('Error fetching weak areas:', error);
    }
  };

  const fetchEmployeeDetails = async (userId) => {
    if (employeeDetails[userId]) {
      setExpandedEmployee(expandedEmployee === userId ? null : userId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${API_URL}/assessment-analytics/employee/${userId}`,
        { headers }
      );

      setEmployeeDetails(prev => ({
        ...prev,
        [userId]: response.data
      }));
      setExpandedEmployee(userId);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'certified':
        return 'bg-green-100 text-green-800';
      case 'attempted':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'certified':
        return <CheckCircle className="w-4 h-4" />;
      case 'attempted':
        return <Clock className="w-4 h-4" />;
      case 'not-started':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teamOverview) {
    return (
      <div className="p-8">
        <button
          onClick={() => onViewChange('dashboard')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onViewChange('dashboard')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Team Assessment Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor team progress and identify training needs
        </p>
      </div>

      <button
        onClick={() => onViewChange('manage-assessments')}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
        <Target className="w-5 h-5 mr-2" />
        Manage Mandatory Assessments
      </button>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamOverview.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamOverview.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(teamOverview.overallCompletion)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(teamOverview.averageScore)}%
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
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assessment Overview
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'employees'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Scores ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('weak-areas')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'weak-areas'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Weak Areas ({weakAreas.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Attempts
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamOverview.byAssessment.map((assessment) => (
                    <tr key={assessment.sopId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assessment.attempted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-900">{assessment.completed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${Math.min(assessment.completionRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {Math.round(assessment.completionRate)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          assessment.averageScore >= 80
                            ? 'bg-green-100 text-green-800'
                            : assessment.averageScore >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assessment.averageScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assessment.totalAttempts}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Individual Scores Tab */}
          {activeTab === 'employees' && (
            <div>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Employee List */}
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => fetchEmployeeDetails(employee.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {employee.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4 text-left">
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 text-gray-400 mr-2" />
                        {expandedEmployee === employee.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedEmployee === employee.id && employeeDetails[employee.id] && (
                      <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                        <div className="mt-4 space-y-3">
                          {employeeDetails[employee.id].progress.map((prog) => (
                            <div key={prog.sopId} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">{prog.title}</h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prog.status)}`}>
                                  {getStatusIcon(prog.status)}
                                  <span className="ml-1 capitalize">{prog.status}</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Attempts</p>
                                  <p className="font-medium text-gray-900">{prog.attempts}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Best Score</p>
                                  <p className="font-medium text-gray-900">
                                    {prog.bestScore ? `${prog.bestScore}%` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Certified</p>
                                  <p className="font-medium text-gray-900">
                                    {prog.certified ? (
                                      <span className="text-green-600">Yes ✓</span>
                                    ) : (
                                      <span className="text-gray-400">No</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {prog.certificationDate && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Certified: {new Date(prog.certificationDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Areas Tab */}
          {activeTab === 'weak-areas' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Common Mistakes</h3>
                <select
                  value={selectedSop}
                  onChange={(e) => setSelectedSop(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Assessments</option>
                  {teamOverview.byAssessment.map((assessment) => (
                    <option key={assessment.sopId} value={assessment.sopId}>
                      {assessment.title}
                    </option>
                  ))}
                </select>
              </div>

              {weakAreas.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No weak areas identified yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weakAreas.map((area, index) => (
                    <div
                      key={area.questionId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-bold">
                              #{index + 1}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              {area.category}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{area.question}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              <XCircle className="inline w-4 h-4 text-red-600 mr-1" />
                              {area.incorrectCount} incorrect
                            </span>
                            <span>out of {area.totalAnswers} total answers</span>
                            <span className="font-semibold text-red-600">
                              {Math.round(area.incorrectRate)}% error rate
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-3xl font-bold text-red-600">
                            {Math.round(area.incorrectRate)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAssessmentAnalyticsView;