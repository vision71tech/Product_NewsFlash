import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEntries } from "../../context/EntryContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/layout/Alert";

interface Stock {
  name: string;
  symbol: string;
  type: "global" | "local";
  price: number;
  oneDayPrice: number;
  percentChange: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Headline {
  _id?: string;
  text: string;
  source: string;
  url?: string;
  shared?: boolean;
}

interface Entry {
  _id: string;
  date: string;
  stocks: Stock[];
  localHeadlines: Headline[];
  globalHeadlines: Headline[];
  user?: string | User;
}

const EntryList: React.FC = () => {
  const { entries, getEntries, deleteEntry, updateEntry, loading, error } = useEntries();
  const { user: currentUser } = useAuth();
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState("");
  const [pageSize, setPageSize] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  useEffect(() => {
    getEntries();
  }, []);

  useEffect(() => {
    if (error) setAlert({ type: "error", message: error });
  }, [error]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      setAlert({ type: "success", message: "Entry deleted successfully" });
      setConfirmDelete(null);
    } catch {
      setAlert({ type: "error", message: "Failed to delete entry" });
    }
  };

const handleShareHeadline = async (entryId: string, headlineType: 'local' | 'global', headlineIndex: number) => {
    const entry = entries.find(e => e._id === entryId);
    if (!entry) return;

    const headlines = headlineType === 'local' ? entry.localHeadlines : entry.globalHeadlines;
    const headline = headlines[headlineIndex];
    if (!headline) return;

    const confirmed = window.confirm(`Share this ${headlineType} headline to Top Rated News?`);
    if (!confirmed) return;

    const input = window.prompt(`Enter URL for headline: "${headline.text}"`);
    const url = (input || '').trim();
    if (!url) {
      setAlert({ type: "error", message: "URL is required to share a headline" });
      return;
    }

    // Basic URL validation
    const isValidUrl = /^(https?:\/\/)[\w.-]+(\.[\w\.-]+)+[\w\-\._~:?#\[\]@!$&'()*+,;=.\/]*$/.test(url);
    if (!isValidUrl) {
      setAlert({ type: "error", message: "Please enter a valid URL (must start with http or https)" });
      return;
    }

    try {
      const updatedHeadlines = [...headlines];
      updatedHeadlines[headlineIndex] = { ...headline, url, shared: true };

      const updateData = headlineType === 'local'
        ? { localHeadlines: updatedHeadlines }
        : { globalHeadlines: updatedHeadlines };

      await updateEntry(entryId, updateData);
      setAlert({ type: "success", message: "Headline shared successfully" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to share headline" });
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const getPercentChangeColor = (percentChange: number) =>
    percentChange >= 0 ? "text-green-500" : "text-red-500";

  // Build unique users for admin filter
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const e of entries) {
      const u = e.user as User | string | undefined;
      if (u && typeof u === 'object' && u._id) {
        map.set(u._id, { id: u._id, name: u.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchDate = searchDate ? entry.date.startsWith(searchDate) : true;
      if (!matchDate) return false;

      if (currentUser?.isAdmin && selectedUserId !== 'all') {
        const u = entry.user as User | string | undefined;
        if (u && typeof u === 'object') return u._id === selectedUserId;
        if (typeof u === 'string') return u === selectedUserId;
        return false;
      }

      return true;
    });
  }, [entries, searchDate, selectedUserId, currentUser?.isAdmin]);

  // Pagination calculations
  const totalItems = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Reset page when filters/page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate, pageSize, selectedUserId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Entry History</h1>

        <div className="flex items-center space-x-3">
          {currentUser?.isAdmin && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
              title="Filter by user"
            >
              <option value="all">All users</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
          />
          <Link
            to="/entries/new"
            className="px-4 py-1.5 text-sm rounded-md text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 transition"
          >
            + Add Entry
          </Link>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-300">
          <p>No entries found for the selected date.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedEntries.map((entry) => (
            <div
              key={entry._id}
              className="
                bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 
                dark:bg-gray-200 dark:hover:bg-gray-300 
                transition-all duration-200 
                rounded-xl p-3 shadow-md 
                border border-gray-200 dark:border-gray-400 
                text-gray-100 dark:text-gray-800
              "
            >
              {/* Header Row */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-l font-semibold text-gray-300 dark:text-gray-700">
                  {new Date(entry.date).toLocaleDateString()}
                </h2>
                <div className="flex space-x-2 text-xs">
                  <Link
                    to={`/entries/${entry._id}`}
                    className="text-gray-400 dark:text-gray-700 hover:text-blue-400 dark:hover:text-blue-600"
                  >
                    View
                  </Link>
                  <Link
                    to={`/entries/edit/${entry._id}`}
                    className="text-gray-400 dark:text-gray-700 hover:text-yellow-400 dark:hover:text-yellow-600"
                  >
                    Edit
                  </Link>
                  {confirmDelete === entry._id ? (
                    <>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-700 dark:hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(entry._id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* User Name - Admin Only */}
              {currentUser?.isAdmin && entry.user && typeof entry.user === 'object' && (
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-gray-200 dark:text-gray-600 bg-gray-700 dark:bg-gray-300 px-2 py-1 rounded-md">
                    Submitted by: {(entry.user as User).name}
                  </span>
                </div>
              )}

              {/* Compact Row Layout */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Stocks */}
                <div className="w-full sm:w-1/3 bg-gray-800 dark:bg-gray-100 rounded-lg p-2 space-y-1 text-xs">
                  {entry.stocks.map((stock, idx) => (
                    <div key={idx} className="border-b border-gray-700 dark:border-gray-300 pb-1 last:border-none">
                      <div className="font-semibold text-gray-100 dark:text-gray-800">
                        {stock.symbol}
                      </div>
                      <div className="text-gray-400 dark:text-gray-600 text-[11px]">
                        {formatPrice(stock.price)}{" "}
                        <span className={getPercentChangeColor(stock.percentChange)}>
                          ({stock.percentChange >= 0 ? "+" : ""}
                          {stock.percentChange.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Headlines */}
                <div className="flex-1 space-y-2 text-xs leading-snug">
                  {entry.localHeadlines.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 dark:text-gray-800 mb-1">Local</h3>
                      <ul className="list-disc pl-4 text-gray-400 dark:text-gray-700 space-y-0.5">
                        {entry.localHeadlines.map((h, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{h.text}</span>
      
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.globalHeadlines.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 dark:text-gray-800 mb-1">Global</h3>
                      <ul className="list-disc pl-4 text-gray-400 dark:text-gray-700 space-y-0.5">
                        {entry.globalHeadlines.map((h, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{h.text}</span>

                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page size */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
              >
                {[6, 8, 12, 16, 24, 32].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="ml-2">Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems}</span>
            </div>

            {/* Pager */}
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className={`px-3 py-1.5 rounded-md border text-sm transition ${
                  safeCurrentPage === 1
                    ? 'border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Prev
              </button>

              {/* Page numbers (compact with ellipsis) */}
              {(() => {
                const pages: (number | 'ellipsis')[] = [];
                const maxToShow = 7;
                if (totalPages <= maxToShow) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  const windowStart = Math.max(2, safeCurrentPage - 1);
                  const windowEnd = Math.min(totalPages - 1, safeCurrentPage + 1);
                  pages.push(1);
                  if (windowStart > 2) pages.push('ellipsis');
                  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
                  if (windowEnd < totalPages - 1) pages.push('ellipsis');
                  pages.push(totalPages);
                }
                return (
                  <>
                    {pages.map((p, idx) =>
                      p === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[38px] px-3 py-1.5 rounded-md border text-sm transition ${
                            p === safeCurrentPage
                              ? 'bg-[#1F2937] text-white border-[#1F2937] dark:bg-[#111827] dark:border-[#111827]'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </>
                );
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className={`px-3 py-1.5 rounded-md border text-sm transition ${
                  safeCurrentPage === totalPages
                    ? 'border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EntryList;
