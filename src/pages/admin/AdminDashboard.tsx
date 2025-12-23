import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  date: string;
}

interface Entry {
  _id: string;
  user: string;
  date: string;
  stocks: any[];
  localHeadlines: any[];
  globalHeadlines: any[];
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'entries'>('users');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, entriesRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/entries'),
        ]);

        setUsers(usersRes.data || []);
        setEntries(entriesRes.data || []);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their entries.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setEntries(prev => prev.filter(e => e.user !== userId));
      showAlert('success', 'User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/entries/${entryId}`);
      setEntries(prev => prev.filter(e => e._id !== entryId));
      showAlert('success', 'Entry deleted successfully');
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-red-200 rounded-lg p-6 bg-red-50">
            <h1 className="text-2xl font-semibold text-red-700 mb-4">Error</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className={`border-4 border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            </div>

            {alert && (
              <div
                className={`p-4 mb-4 rounded-md ${
                  alert.type === 'success'
                    ? isDarkMode
                      ? 'bg-green-900 text-green-200'
                      : 'bg-green-50 text-green-800'
                    : isDarkMode
                    ? 'bg-red-900 text-red-200'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <p>{alert.message}</p>
              </div>
            )}

            {/* Admin Info */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg mb-6`}>
              <div className="px-4 py-5 sm:px-6">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Information</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Your admin account details.</p>
              </div>
              <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <dl>
                  <div className="px-4 py-5 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-400">Full name</dt>
                    <dd className="col-span-2 text-sm">{user?.name || 'Not available'}</dd>
                  </div>
                  <div className="px-4 py-5 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-400">Email</dt>
                    <dd className="col-span-2 text-sm">{user?.email || 'Not available'}</dd>
                  </div>
                  <div className="px-4 py-5 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-400">Role</dt>
                    <dd className="col-span-2 text-sm">Administrator</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="hidden sm:block">
                <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`${
                        activeTab === 'users'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Users ({users.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('entries')}
                      className={`${
                        activeTab === 'entries'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Entries ({entries.length})
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {activeTab === 'users' && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}>
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Users</h3>
                  <p className="text-sm text-gray-400">Total: {users.length}</p>
                </div>
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((head) => (
                          <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 text-sm">{user.name}</td>
                          <td className="px-6 py-4 text-sm break-all">{user.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">{new Date(user.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right text-sm">
                            {!user.isAdmin && (
                              <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Entries Table */}
            {activeTab === 'entries' && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}>
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Entries</h3>
                  <p className="text-sm text-gray-400">Total: {entries.length}</p>
                </div>
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        {['Date', 'User', 'Stocks', 'Headlines', 'Actions'].map((head) => (
                          <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {entries.map((entry) => {
                        const userObj = users.find((u) => u._id === entry.user);
                        return (
                          <tr key={entry._id}>
                            <td className="px-6 py-4 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm">
                              {userObj?.name || 'Unknown User'}
                              <div className="text-xs text-gray-500">{userObj?.email || ''}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">{entry.stocks.length} stocks</td>
                            <td className="px-6 py-4 text-sm">
                              {entry.localHeadlines.length} local, {entry.globalHeadlines.length} global
                            </td>
                            <td className="px-6 py-4 text-right text-sm">
                              <Link to={`/entries/${entry._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteEntry(entry._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
