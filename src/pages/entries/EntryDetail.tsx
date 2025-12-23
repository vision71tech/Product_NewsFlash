import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEntries } from '../../context/EntryContext';
import Alert from '../../components/layout/Alert';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEntry, getEntry, deleteEntry, loading, error } = useEntries();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      getEntry(id);
    }
    // Remove getEntry from the dependency array to prevent infinite loop
  }, [id]); // Only re-run when id changes

  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', message: error });
    }
  }, [error]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteEntry(id);
      setAlert({ type: 'success', message: 'Entry deleted successfully' });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/entries');
      }, 2000);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete entry' });
    }
  };

  if (loading || !currentEntry) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Entry Details</h1>
            <div className="flex space-x-3">
              <Link
                to={`/entries/edit/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Entry
              </Link>
              {confirmDelete ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Entry
                </button>
              )}
            </div>
          </div>

          {alert && (
            <div className="mb-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Entry Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on {new Date(currentEntry.createdAt).toLocaleDateString()} at {new Date(currentEntry.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(currentEntry.date).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(currentEntry.updatedAt).toLocaleDateString()} at {new Date(currentEntry.updatedAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Stocks Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Stocks</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {currentEntry.stocks.length} stocks tracked in this entry
              </p>
            </div>
            {currentEntry.stocks.length > 0 ? (
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Symbol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        1 Day Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        % Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntry.stocks.map((stock, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stock.type === 'global' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                          >
                            {stock.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.price !== undefined && stock.price !== null && stock.price !== 0 ? 
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stock.price) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.oneDayPrice !== undefined && stock.oneDayPrice !== null && stock.oneDayPrice !== 0 ? 
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stock.oneDayPrice) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${                            
                            stock.percentChange !== undefined && stock.percentChange !== null ? 
                            (stock.percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 
                            'bg-gray-100 text-gray-800'}`}>
                            {stock.percentChange !== undefined && stock.percentChange !== null ? 
                              `${stock.percentChange >= 0 ? '+' : ''}${stock.percentChange.toFixed(1)}%` : 
                              'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                No stocks added to this entry
              </div>
            )}
          </div>

          {/* Local Headlines Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Local Headlines</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {currentEntry.localHeadlines.length} local headlines in this entry
              </p>
            </div>
            {currentEntry.localHeadlines.length > 0 ? (
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Headline
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Source
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntry.localHeadlines.map((headline, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {headline.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {headline.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {headline.url ? (
                            <a
                              href={headline.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Visit Source
                            </a>
                          ) : (
                            <span className="text-gray-400">No URL provided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                No local headlines added to this entry
              </div>
            )}
          </div>

          {/* Global Headlines Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Global Headlines</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {currentEntry.globalHeadlines.length} global headlines in this entry
              </p>
            </div>
            {currentEntry.globalHeadlines.length > 0 ? (
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Headline
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Source
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntry.globalHeadlines.map((headline, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {headline.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {headline.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {headline.url ? (
                            <a
                              href={headline.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Visit Source
                            </a>
                          ) : (
                            <span className="text-gray-400">No URL provided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                No global headlines added to this entry
              </div>
            )}
          </div>

          <div className="flex justify-start">
            <Link
              to="/entries"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Entries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetail;