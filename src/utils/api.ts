import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Create an instance of axios with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 second timeout
  timeoutErrorMessage: 'Request timed out'
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;