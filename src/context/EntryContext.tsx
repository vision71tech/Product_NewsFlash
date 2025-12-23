import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import api from '../utils/api';

// Types
interface Stock {
  _id?: string;
  name: string;
  symbol: string;
  type: 'global' | 'local';
  price: number;
  oneDayPrice: number;
  percentChange: number;
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
  user: string;
  date: string;
  stocks: Stock[];
  localHeadlines: Headline[];
  globalHeadlines: Headline[];
  createdAt: string;
  updatedAt: string;
}

interface EntryState {
  entries: Entry[];
  currentEntry: Entry | null;
  loading: boolean;
  error: string | null;
}

type EntryAction =
  | { type: 'GET_ENTRIES'; payload: Entry[] }
  | { type: 'GET_ENTRY'; payload: Entry }
  | { type: 'ADD_ENTRY'; payload: Entry }
  | { type: 'UPDATE_ENTRY'; payload: Entry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'CLEAR_CURRENT' }
  | { type: 'SET_LOADING' }
  | { type: 'ENTRY_ERROR'; payload: string };

interface EntryContextType {
  entries: Entry[];
  currentEntry: Entry | null;
  loading: boolean;
  error: string | null;
  getEntries: () => Promise<void>;
  getEntry: (id: string) => Promise<void>;
  addEntry: (entry: Omit<Entry, '_id' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<Entry>;
  updateEntry: (id: string, entry: Partial<Entry>) => Promise<Entry>;
  deleteEntry: (id: string) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

// Reducer
const entryReducer = (state: EntryState, action: EntryAction): EntryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'GET_ENTRIES':
      return {
        ...state,
        entries: action.payload,
        loading: false,
        error: null
      };
    case 'GET_ENTRY':
      return {
        ...state,
        currentEntry: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [action.payload, ...state.entries],
        loading: false,
        error: null
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry._id === action.payload._id ? action.payload : entry
        ),
        currentEntry: action.payload,
        loading: false,
        error: null
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry._id !== action.payload),
        currentEntry: null,
        loading: false,
        error: null
      };
    case 'CLEAR_CURRENT':
      return {
        ...state,
        currentEntry: null,
        error: null
      };
    case 'ENTRY_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

interface EntryProviderProps {
  children: ReactNode;
}

export const EntryProvider: React.FC<EntryProviderProps> = ({ children }) => {
  const initialState: EntryState = {
    entries: [],
    currentEntry: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(entryReducer, initialState);
  const requestTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Helper function to debounce requests
  const debounceRequest = useCallback((callback: () => Promise<void>) => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    return new Promise<void>((resolve, reject) => {
      requestTimeoutRef.current = setTimeout(async () => {
        try {
          await callback();
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 300);
    });
  }, []);

  // Get all entries with debouncing
  const getEntries = useCallback(async () => {
    try {
      if (!state.loading) {
        dispatch({ type: 'SET_LOADING' });
        await debounceRequest(async () => {
          const res = await api.get('/api/entries');
          dispatch({ type: 'GET_ENTRIES', payload: res.data });
        });
      }
    } catch (err: any) {
      dispatch({
        type: 'ENTRY_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch entries'
      });
    }
  }, [state.loading, debounceRequest]);

  // Get single entry with debouncing
  const getEntry = useCallback(async (id: string) => {
    try {
      // Don't check state.loading here to allow the function to be called multiple times
      // The debouncing will handle preventing multiple requests
      dispatch({ type: 'SET_LOADING' });
      await debounceRequest(async () => {
        const res = await api.get(`/api/entries/${id}`);
        dispatch({ type: 'GET_ENTRY', payload: res.data });
      });
    } catch (err: any) {
      dispatch({
        type: 'ENTRY_ERROR',
        payload: err.response?.data?.message || 'Failed to fetch entry'
      });
    }
  }, [debounceRequest]); // Remove state.loading from dependencies

  // Add entry with debouncing and proper error handling
  const addEntry = useCallback(async (entry: Omit<Entry, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
  dispatch({ type: 'SET_LOADING' });
  try {
    const { date, stocks, localHeadlines, globalHeadlines } = entry;
    const cleanEntry = { date, stocks, localHeadlines, globalHeadlines };

    const res = await api.post('/api/entries', cleanEntry);

    // ✅ Flexible handling in case backend wraps data
    const savedEntry = res?.data?.entry || res?.data || null;
    if (!savedEntry) {
      console.warn('Unexpected response shape:', res.data);
      throw new Error('Entry saved but invalid response format');
    }

    dispatch({ type: 'ADD_ENTRY', payload: savedEntry });
    return savedEntry;
  } catch (err: any) {
    console.error('Error adding entry:', err);
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      'Failed to add entry';
    dispatch({ type: 'ENTRY_ERROR', payload: errorMessage });
    throw new Error(errorMessage);
  }
}, []);

  // Update entry with proper error handling
  const updateEntry = useCallback(async (id: string, entry: Partial<Entry>): Promise<Entry> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await api.put(`/api/entries/${id}`, entry);
      if (!res.data) {
        throw new Error('No data received from server');
      }
      dispatch({ type: 'UPDATE_ENTRY', payload: res.data });
      return res.data;
    } catch (err: any) {
      console.error('Error updating entry:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || err.message || 'Failed to update entry';
      dispatch({ type: 'ENTRY_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Delete entry with proper error handling
  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await api.delete(`/api/entries/${id}`);
      dispatch({ type: 'DELETE_ENTRY', payload: id });
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || err.message || 'Failed to delete entry';
      dispatch({ type: 'ENTRY_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Clear current entry
  const clearCurrent = () => {
    dispatch({ type: 'CLEAR_CURRENT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'ENTRY_ERROR', payload: '' });
  };

  return (
    <EntryContext.Provider
      value={{
        entries: state.entries,
        currentEntry: state.currentEntry,
        loading: state.loading,
        error: state.error,
        getEntries,
        getEntry,
        addEntry,
        updateEntry,
        deleteEntry,
        clearCurrent,
        clearError
      }}
    >
      {children}
    </EntryContext.Provider>
  );
};

// Custom hook to use entry context
export const useEntries = (): EntryContextType => {
  const context = useContext(EntryContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntryProvider');
  }
  return context;
};