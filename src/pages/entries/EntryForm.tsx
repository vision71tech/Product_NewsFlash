import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEntries } from '../../context/EntryContext';
import Alert from '../../components/layout/Alert';

interface Stock {
  name: string;
  symbol: string;
  type: 'global' | 'local';
  price: number;
  oneDayPrice: number;
  percentChange: number;
}

interface Headline {
  text: string;
  source: string;
  url?: string;
  shared?: boolean;
}

const EntryForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentEntry, getEntry, addEntry, updateEntry, loading, error, clearError } = useEntries();
  const [touched, setTouched] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    stocks: [{ name: '', symbol: '', type: 'global' as const, price: 0, oneDayPrice: 0, percentChange: 0 }] as Stock[],
    localHeadlines: [{ text: '', source: '', url: undefined }] as Headline[],
    globalHeadlines: [{ text: '', source: '', url: undefined }] as Headline[]
  });

  const { date, stocks, localHeadlines, globalHeadlines } = formData;

  // Add state for temporary price inputs
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});

  // Load cached stocks for new entries
  useEffect(() => {
    if (!isEditMode && user?._id) {
      const cachedStocks = localStorage.getItem(`cachedStocks-${user._id}`);
      if (cachedStocks) {
        try {
          const parsedStocks = JSON.parse(cachedStocks);
          if (Array.isArray(parsedStocks) && parsedStocks.length > 0) {
            setFormData(prev => ({ ...prev, stocks: parsedStocks }));

            // Initialize price inputs for cached stocks
            const newPriceInputs: { [key: string]: string } = {};
            parsedStocks.forEach((stock, idx) => {
              newPriceInputs[`price-${idx}`] = stock.price.toString();
              newPriceInputs[`oneDayPrice-${idx}`] = stock.oneDayPrice.toString();
            });
            setPriceInputs(newPriceInputs);
          }
        } catch (error) {
          console.error('Error loading cached stocks:', error);
        }
      }
    }
  }, [isEditMode, user?._id]);

  // Save stocks to cache whenever they change (only for new entries)
  useEffect(() => {
    if (!isEditMode && user?._id && formData.stocks.length > 0) {
      // Only cache if there are actual stock entries with data
      const hasValidStocks = formData.stocks.some(stock =>
        stock.name.trim() || stock.symbol.trim() ||
        stock.price > 0 || stock.oneDayPrice > 0
      );

      if (hasValidStocks) {
        localStorage.setItem(`cachedStocks-${user._id}`, JSON.stringify(formData.stocks));
      }
    }
  }, [formData.stocks, isEditMode, user?._id]);

  useEffect(() => {
    let mounted = true;
    if (isEditMode && mounted) {
      getEntry(id);
    }
    return () => { mounted = false; };
  }, [id, getEntry]);

  useEffect(() => {
    if (isEditMode && currentEntry) {
      const newFormData = {
        date: new Date(currentEntry.date).toISOString().split('T')[0],
        stocks: currentEntry.stocks.length > 0 ? [...currentEntry.stocks] : [{ 
          name: '', 
          symbol: '', 
          type: 'global' as const,
          price: 0,
          oneDayPrice: 0,
          percentChange: 0
        }],
        localHeadlines: currentEntry.localHeadlines.length > 0 ? [...currentEntry.localHeadlines] : [{ text: '', source: '', url: undefined }],
        globalHeadlines: currentEntry.globalHeadlines.length > 0 ? [...currentEntry.globalHeadlines] : [{ text: '', source: '', url: undefined }]
      };
      setFormData(newFormData);

      // Initialize price inputs
      const newPriceInputs: { [key: string]: string } = {};
      currentEntry.stocks.forEach((stock, idx) => {
        newPriceInputs[`price-${idx}`] = stock.price.toString();
        newPriceInputs[`oneDayPrice-${idx}`] = stock.oneDayPrice.toString();
      });
      setPriceInputs(newPriceInputs);
    }
  }, [currentEntry, isEditMode]);

  useEffect(() => {
    let mounted = true;
    if (error && mounted) {
      setAlert({ type: 'error', message: error });
    }
    return () => { mounted = false; };
  }, [error]);

  const handlePriceInputChange = (index: number, field: 'price' | 'oneDayPrice', value: string) => {
    // Allow empty input, single decimal point, or valid decimal number
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    // Allow only one decimal point
    if (value.split('.').length > 2) {
      return;
    }

    // Update the display value immediately
    const inputKey = `${field}-${index}`;
    setPriceInputs(prev => ({ ...prev, [inputKey]: value }));

    // If empty or just a decimal point, don't update the stock value yet
    if (value === '' || value === '.') {
      return;
    }

    // Update stock value if it's a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleStockChange(index, field, numValue);
      
      // Calculate percentage change in real-time only when both values are present and valid
      const currentStock = stocks[index];
      const currentPrice = field === 'price' ? numValue : currentStock.price;
      const oneDayPrice = field === 'oneDayPrice' ? numValue : currentStock.oneDayPrice;

      if (currentPrice && oneDayPrice && oneDayPrice > 0) {
        const percentChange = ((currentPrice - oneDayPrice) / oneDayPrice) * 100;
        handleStockChange(index, 'percentChange', parseFloat(percentChange.toFixed(2)));
      } else {
        // If one value is missing or oneDayPrice is 0, set percent change to 0
        handleStockChange(index, 'percentChange', 0);
      }
    }
  };

  const getPriceInputValue = (index: number, field: 'price' | 'oneDayPrice'): string => {
    const inputKey = `${field}-${index}`;
    const inputValue = priceInputs[inputKey];
    
    // Return the controlled input value if it exists
    if (inputValue !== undefined) {
      return inputValue;
    }
    
    // Otherwise return the stock value, or empty string if 0
    const stockValue = stocks[index][field];
    return stockValue === 0 ? '' : stockValue.toString();
  };

  const handleStockChange = (index: number, field: keyof Stock, value: string | number) => {
    const updatedStocks = [...stocks];
    updatedStocks[index] = { ...updatedStocks[index], [field]: value };
    setFormData({ ...formData, stocks: updatedStocks });
  };

  const handleHeadlineChange = (
    type: 'local' | 'global',
    index: number,
    field: keyof Headline,
    value: string | boolean
  ) => {
    if (type === 'local') {
      const updatedHeadlines = [...localHeadlines];
      updatedHeadlines[index] = { ...updatedHeadlines[index], [field]: value };
      setFormData({ ...formData, localHeadlines: updatedHeadlines });
    } else {
      const updatedHeadlines = [...globalHeadlines];
      updatedHeadlines[index] = { ...updatedHeadlines[index], [field]: value };
      setFormData({ ...formData, globalHeadlines: updatedHeadlines });
    }
  };

  const calculatePercentChange = (index: number) => {
    const stock = stocks[index];
    const oneDayPrice = stock.oneDayPrice || 0;
    const currentPrice = stock.price || 0;
    
    if (oneDayPrice > 0 && currentPrice >= 0) {
      // Calculate using the formula: ((price - oneDayPrice) / oneDayPrice * 100)
      // This matches the formula used in EntryDetail.tsx for consistency
      const percentChange = ((oneDayPrice - currentPrice) / oneDayPrice * 100).toFixed(2);
      handleStockChange(index, 'percentChange', parseFloat(percentChange));
    } else {
      handleStockChange(index, 'percentChange', 0);
    }
  };

  const addStock = () => {
    if (stocks.length >= 15) {
      setAlert({ type: 'error', message: 'Maximum 15 stocks allowed' });
      return;
    }
    const newIndex = stocks.length;
    setPriceInputs(prev => ({
      ...prev,
      [`price-${newIndex}`]: '',
      [`oneDayPrice-${newIndex}`]: ''
    }));
    setFormData({
      ...formData,
      stocks: [...stocks, { 
        name: '', 
        symbol: '', 
        type: 'global' as const,
        price: 0,
        oneDayPrice: 0,
        percentChange: 0
      }]
    });
  };

  const addHeadline = (type: 'local' | 'global') => {
    if (type === 'local' && localHeadlines.length >= 15) {
      setAlert({ type: 'error', message: 'Maximum 15 local headlines allowed' });
      return;
    }
    if (type === 'global' && globalHeadlines.length >= 15) {
      setAlert({ type: 'error', message: 'Maximum 15 global headlines allowed' });
      return;
    }

    if (type === 'local') {
      setFormData({
        ...formData,
        localHeadlines: [...localHeadlines, { text: '', source: '', url: undefined }]
      });
    } else {
      setFormData({
        ...formData,
        globalHeadlines: [...globalHeadlines, { text: '', source: '', url: undefined }]
      });
    }
  };

  const removeStock = (index: number) => {
    const updatedStocks = [...stocks];
    updatedStocks.splice(index, 1);
    setFormData({ ...formData, stocks: updatedStocks });
    
    // Remove price inputs for the removed stock and update indices for remaining stocks
    setPriceInputs(prev => {
      const newInputs: { [key: string]: string } = {};
      updatedStocks.forEach((_, i) => {
        if (prev[`price-${i}`]) newInputs[`price-${i}`] = prev[`price-${i}`];
        if (prev[`oneDayPrice-${i}`]) newInputs[`oneDayPrice-${i}`] = prev[`oneDayPrice-${i}`];
      });
      return newInputs;
    });
  };

  const removeHeadline = (type: 'local' | 'global', index: number) => {
    if (type === 'local') {
      const updatedHeadlines = [...localHeadlines];
      updatedHeadlines.splice(index, 1);
      setFormData({ ...formData, localHeadlines: updatedHeadlines });
    } else {
      const updatedHeadlines = [...globalHeadlines];
      updatedHeadlines.splice(index, 1);
      setFormData({ ...formData, globalHeadlines: updatedHeadlines });
    }
  };

  const handleShareHeadlineOnForm = (type: 'local' | 'global', index: number) => {
    const confirmed = window.confirm('Share this headline to Top Rated News?');
    if (!confirmed) return;

    const input = window.prompt('Enter the URL for this headline (must start with http or https)');
    const url = (input || '').trim();
    if (!url) {
      setAlert({ type: 'error', message: 'URL is required to share a headline' });
      return;
    }
    const isValidUrl = /^(https?:\/\/)[\w.-]+(\.[\w\.-]+)+[\w\-\._~:?#\[\]@!$&'()*+,;=.\/]*$/.test(url);
    if (!isValidUrl) {
      setAlert({ type: 'error', message: 'Please enter a valid URL (must start with http or https)' });
      return;
    }

    if (type === 'local') {
      const updated = [...localHeadlines];
      updated[index] = { ...updated[index], url, shared: true };
      setFormData({ ...formData, localHeadlines: updated });
    } else {
      const updated = [...globalHeadlines];
      updated[index] = { ...updated[index], url, shared: true };
      setFormData({ ...formData, globalHeadlines: updated });
    }

    setAlert({ type: 'success', message: 'Headline marked as shared' });
  };

  const validateForm = () => {
    if (!date) {
      setAlert({ type: 'error', message: 'Date is required' });
      return false;
    }

    const validStocks = stocks.filter(stock => stock.name.trim() && stock.symbol.trim());
    if (validStocks.length === 0) {
      setAlert({ type: 'error', message: 'At least one stock with name and symbol is required' });
      return false;
    }

    // Check if any stock has invalid price values
    const invalidPriceStocks = validStocks.filter((stock, index) => {
      const priceInput = priceInputs[`price-${index}`] || '';
      const oneDayPriceInput = priceInputs[`oneDayPrice-${index}`] || '';
      
      // Check if inputs are empty or just a decimal point
      if (priceInput === '' || priceInput === '.' || oneDayPriceInput === '' || oneDayPriceInput === '.') {
        return true;
      }
      
      // Check if parsed values are valid and greater than zero
      const priceValue = parseFloat(priceInput);
      const oneDayPriceValue = parseFloat(oneDayPriceInput);
      
      return isNaN(priceValue) || priceValue <= 0 || isNaN(oneDayPriceValue) || oneDayPriceValue <= 0;
    });
    
    if (invalidPriceStocks.length > 0) {
      setAlert({ type: 'error', message: 'All stocks must have valid price and one-day price values greater than zero' });
      return false;
    }

    return true;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const filteredStocks = stocks
      .filter(stock => stock.name.trim() && stock.symbol.trim())
      .map((stock, index) => {
        // Get the actual input values
        const priceInput = priceInputs[`price-${index}`] || '0';
        const oneDayPriceInput = priceInputs[`oneDayPrice-${index}`] || '0';

        // Parse the values
        const price = parseFloat(priceInput) || 0.01;
        const oneDayPrice = parseFloat(oneDayPriceInput) || 0.01;

        // Calculate percentage change
        const percentChange = oneDayPrice > 0 ?
          parseFloat(((price - oneDayPrice) / oneDayPrice * 100).toFixed(2)) : 0;

        return {
          ...stock,
          price,
          oneDayPrice,
          percentChange
        };
      });

    const filteredLocalHeadlines = localHeadlines.filter(headline => headline.text.trim() && headline.source.trim());
    const filteredGlobalHeadlines = globalHeadlines.filter(headline => headline.text.trim() && headline.source.trim());

    const entryData = {
      date,
      stocks: filteredStocks,
      localHeadlines: filteredLocalHeadlines,
      globalHeadlines: filteredGlobalHeadlines
    };

    clearError(); // Clear any previous errors before submitting

    try {
      setAlert(null);

      if (isEditMode && id) {
        await updateEntry(id, entryData);
        setAlert({ type: 'success', message: 'Entry updated successfully' });
      } else {
        await addEntry(entryData);
        setAlert({ type: 'success', message: 'Entry added successfully' });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!error) {
        navigate('/entries');
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to save entry'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Entry' : 'New Entry'}
            </h1>
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

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="shadow-sm bg-gray-50 dark:bg-gray-700 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

{/* Stocks Section */}
<div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Stocks</h2>
    <button
      type="button"
      onClick={addStock}
      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Add Stock
    </button>
  </div>

  {/* Table layout for cleaner look */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Name</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Symbol</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Current Price</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">1 Day Price</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">% Change</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
        </tr>
      </thead>

      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {stocks.map((stock, index) => {
          const currentPrice = parseFloat(getPriceInputValue(index, 'price')) || 0;
          const oneDayPrice = parseFloat(getPriceInputValue(index, 'oneDayPrice')) || 0;
          const percentChange = oneDayPrice > 0 ? ((currentPrice - oneDayPrice) / oneDayPrice) * 100 : 0;

          return (
            <tr key={index}>
              <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}</td>

              <td className="px-3 py-2">
                <input
                  type="text"
                  value={stock.name}
                  onChange={(e) => handleStockChange(index, 'name', e.target.value)}
                  className="block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>

              <td className="px-3 py-2">
                <input
                  type="text"
                  value={stock.symbol}
                  onChange={(e) => handleStockChange(index, 'symbol', e.target.value)}
                  className="block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>

              <td className="px-3 py-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={getPriceInputValue(index, 'price')}
                  onChange={(e) => handlePriceInputChange(index, 'price', e.target.value)}
                  placeholder="0.00"
                  className="block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>

              <td className="px-3 py-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={getPriceInputValue(index, 'oneDayPrice')}
                  onChange={(e) => handlePriceInputChange(index, 'oneDayPrice', e.target.value)}
                  placeholder="0.00"
                  className="block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>

              <td className="px-3 py-2">
                <div
                  className={`py-1 px-2 text-center rounded-md text-sm ${
                    percentChange > 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : percentChange < 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`}
                </div>
              </td>

              <td className="px-3 py-2">
                <select
                  value={stock.type}
                  onChange={(e) => handleStockChange(index, 'type', e.target.value as 'global' | 'local')}
                  className="block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="global">Global</option>
                  <option value="local">Local</option>
                </select>
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeStock(index)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

            {/* Local Headlines Section */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Local Headlines</h2>
                <button
                  type="button"
                  onClick={() => addHeadline('local')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Local Headline
                </button>
              </div>

              {localHeadlines.map((headline, index) => (
                <div key={index} className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-7">
                    <div className="sm:col-span-1 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor={`local-headline-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Headline Text
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`local-headline-${index}`}
                          value={headline.text}
                          onChange={(e) => handleHeadlineChange('local', index, 'text', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label
                        htmlFor={`local-source-${index}`}
                        className={`block text-sm font-medium ${
                          touched && !headline.source
                            ? "text-red-700"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Source
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`local-source-${index}`}
                          value={headline.source}
                          onChange={(e) =>
                            handleHeadlineChange("local", index, "source", e.target.value)
                          }
                          onBlur={() => setTouched(true)}
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            touched && !headline.source
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {touched && !headline.source && (
                          <p className="mt-1 text-sm text-red-600">Source is required</p>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor={`local-url-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL (optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`local-url-${index}`}
                          value={headline.url || ''}
                          onChange={(e) => handleHeadlineChange('local', index, 'url', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex items-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleShareHeadlineOnForm('local', index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Share to Top Rated"
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHeadline('local', index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Headlines Section */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Global Headlines</h2>
                <button
                  type="button"
                  onClick={() => addHeadline('global')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Global Headline
                </button>
              </div>

              {globalHeadlines.map((headline, index) => (
                <div key={index} className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-7">
                    <div className="sm:col-span-1 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor={`global-headline-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Headline Text
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`global-headline-${index}`}
                          value={headline.text}
                          onChange={(e) => handleHeadlineChange('global', index, 'text', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label
                        htmlFor={`global-source-${index}`}
                        className={`block text-sm font-medium ${
                          touched && !headline.source
                            ? "text-red-700"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Source
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`global-source-${index}`}
                          value={headline.source}
                          onChange={(e) =>
                            handleHeadlineChange("global", index, "source", e.target.value)
                          }
                          onBlur={() => setTouched(true)}
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            touched && !headline.source
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {touched && !headline.source && (
                          <p className="mt-1 text-sm text-red-600">Source is required</p>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor={`global-url-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL (optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`global-url-${index}`}
                          value={headline.url || ''}
                          onChange={(e) => handleHeadlineChange('global', index, 'url', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex items-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleShareHeadlineOnForm('global', index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Share to Top Rated"
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHeadline('global', index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/entries')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1F2937] hover:bg-[#111827] dark:bg-[#111827] dark:hover:bg-[#1F2937]
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEditMode ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
