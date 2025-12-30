import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Search, LogOut, Plus, Eye, Clock, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI, screenshotAPI } from '../services/api';
import type { Employee, DashboardData, Company } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType, logout } = useAuth();
  const company = user as Company;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [screenshots, setScreenshots] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [intervalType, setIntervalType] = useState<'5min' | '10min'>('5min');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/login');
      return;
    }
    loadEmployees();
  }, [userType, navigate]);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      loadScreenshots();
    }
  }, [selectedEmployee, selectedDate]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.list();
      if (response.data.success && response.data.data) {
        setEmployees(response.data.data);
        if (response.data.data.length > 0 && !selectedEmployee) {
          setSelectedEmployee(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScreenshots = async () => {
    if (!selectedEmployee || !selectedDate) return;

    setLoading(true);
    try {
      const response = await screenshotAPI.getDashboard(
        selectedEmployee.id,
        selectedDate
      );
      if (response.data.success && response.data.data) {
        setScreenshots(response.data.data);
      }
    } catch (error) {
      console.error('Error loading screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await employeeAPI.add(newEmployee);
      if (response.data.success && response.data.data) {
        alert(`Employee added! Token: ${response.data.data.token}`);
        setNewEmployee({ name: '', email: '', password: '' });
        setShowAddEmployee(false);
        loadEmployees();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadEmployees();
      return;
    }

    setLoading(true);
    try {
      const response = await employeeAPI.search(searchQuery);
      if (response.data.success && response.data.data) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (hour: number, startMin: number, endMin: number): string => {
    const formatHour = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formatHour}:${String(startMin).padStart(2, '0')} - ${formatHour}:${String(endMin).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Screenshot Tracker</h1>
            <p className="text-sm text-gray-600">{company?.company_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} />
                Employees
              </h2>
              <button
                onClick={() => setShowAddEmployee(!showAddEmployee)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus size={20} />
              </button>
            </div>

            {showAddEmployee && (
              <form onSubmit={handleAddEmployee} className="mb-4 p-3 bg-blue-50 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-3 py-1 text-sm border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-3 py-1 text-sm border rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full px-3 py-1 text-sm border rounded"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-1 text-sm rounded hover:bg-blue-700"
                >
                  Add Employee
                </button>
              </form>
            )}

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedEmployee?.id === emp.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm">{emp.name}</p>
                  <p className="text-xs text-gray-600">{emp.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedEmployee ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                      <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <select
                        value={intervalType}
                        onChange={(e) => setIntervalType(e.target.value as '5min' | '10min')}
                        className="px-3 py-1 border border-gray-300 rounded-lg"
                      >
                        <option value="5min">5 Min Intervals</option>
                        <option value="10min">10 Min Intervals</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">Loading screenshots...</p>
                  </div>
                ) : screenshots ? (
                  <div className="space-y-6">
                    {screenshots.total_screenshots === 0 ? (
                      <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Image size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">No screenshots found for this date</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900">
                            Total Screenshots: {screenshots.total_screenshots} on {selectedDate}
                          </p>
                        </div>

                        {screenshots.grouped_by_hour.map((hourData) => (
                          <div key={hourData.hour} className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Clock size={20} />
                              {hourData.hour % 12 || 12}:00 {hourData.hour >= 12 ? 'PM' : 'AM'}
                            </h3>

                            <div className="space-y-4">
                              {(intervalType === '5min'
                                ? hourData.intervals_5min
                                : hourData.intervals_10min
                              ).map((interval) => (
                                <div key={interval.interval} className="border-l-4 border-blue-500 pl-4">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    {formatTime(hourData.hour, interval.start_minute, interval.end_minute)}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({interval.screenshots.length} screenshots)
                                    </span>
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {interval.screenshots.map((screenshot) => (
                                      <div key={screenshot.id} className="bg-gray-100 rounded-lg p-2">
                                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-2">
                                          <Image size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">
                                          {new Date(screenshot.uploaded_at).toLocaleTimeString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Eye size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Select a date to view screenshots</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Select an employee to view their activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;