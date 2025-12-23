import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntryContext';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Entry {
  _id: string;
  date: string;
  stocks: Stock[];
  localHeadlines: Array<{ text: string }>;
  globalHeadlines: Array<{ text: string }>;
  user?: string | User;
}

interface Stock {
  name: string;
  symbol: string;
  type: "global" | "local";
  price: number;
  oneDayPrice: number;
  percentChange: number;
}

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { entries, getEntries, loading: entriesLoading } = useEntries();

  useEffect(() => {
    getEntries();
    // eslint-disable-next-line
  }, []);

  // Add debugging console log
  useEffect(() => {
    console.log('Current user data:', user);
  }, [user]);

  const loading = authLoading || entriesLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user data is missing, show an error message
  if (!user || !user.name || !user.email) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-red-200 rounded-lg p-6 bg-red-50">
            <h1 className="text-2xl font-semibold text-red-700 mb-4">User Data Error</h1>
            <p className="text-red-600">Unable to load user information. Please try logging out and logging back in.</p>
            <pre className="mt-4 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify({ userExists: !!user, userData: user }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            <Link
              to="/entries/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Entry
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">User Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and application.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {user.name || 'Not available'}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {user.email || 'Not available'}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total entries</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{entries.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Entries</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Your latest submissions.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {entries.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {entries.slice(0, 5).map((entry) => (
                    <li key={entry._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Link to={`/entries/${entry._id}`} className="block">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium light:text-black dark:text-white truncate">
                              Entry from {new Date(entry.date).toLocaleDateString()}
                            </p>
                            {user?.isAdmin && entry.user && typeof entry.user === 'object' && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Submitted by: {(entry.user as User).name}
                              </p>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {entry.stocks.length} stocks
                            </p>
                            <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {entry.localHeadlines.length + entry.globalHeadlines.length} headlines
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No entries yet. Create your first entry!</p>
                  <Link
                    to="/entries/new"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Entry
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;