import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/layout/Alert';
import api from '../../utils/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    otp: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    if (error) {
      setAlert({ type: 'error', message: error });
      clearError();
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const { name, email, password, password2, otp } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update password rules if password field is being changed
    if (name === 'password') {
      setPasswordRules({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      });
    }
  };

  const sendOTP = async () => {
    if (!email) {
      setAlert({ type: 'error', message: 'Please enter your email address first' });
      return;
    }

    setSendingOtp(true);
    setAlert(null);

    try {
      const res = await api.post('/api/auth/send-otp', { email });
      setOtpSent(true);
      setAlert({ type: 'success', message: 'OTP sent to your email. Please check your inbox.' });
    } catch (err: any) {
      console.error('Send OTP error:', err);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
  if (!name || !password) {
    setAlert({ type: 'error', message: 'Please fill in your name and password before verifying OTP' });
    return;
  }
  if (!otp) {
    setAlert({ type: 'error', message: 'Please enter the OTP' });
    return;
  }

    setVerifyingOtp(true);
    setAlert(null);

    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp, name, password });
      setOtpVerified(true);
      setAlert({ type: 'success', message: 'Email verified successfully! Registration complete.' });

      // Set auth context with the response
      const { token, user } = res.data;
      localStorage.setItem('token', token);

      // Update auth context manually to avoid reload
      // This will trigger the useEffect to navigate to dashboard
      window.location.reload(); // Temporary solution - will be replaced with proper context update
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      let errorMessage = 'Invalid OTP. Please try again.';
      if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setVerifyingOtp(false);
    }
  };


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otpVerified) {
      setAlert({ type: 'error', message: 'Please verify your email with OTP first' });
      return;
    }

    try {
      setAlert(null);

      if (name === '' || email === '' || password === '') {
        setAlert({ type: 'error', message: 'Please fill in all fields' });
        return;
      }

      if (password !== password2) {
        setAlert({ type: 'error', message: 'Passwords do not match' });
        return;
      }

      if (!passwordRules.minLength || !passwordRules.hasUpperCase || !passwordRules.hasLowerCase || !passwordRules.hasNumber || !passwordRules.hasSpecialChar) {
        setAlert({ type: 'error', message: 'Password must meet all requirements' });
        return;
      }

      // Registration is already handled in verifyOTP, just navigate
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage
      });
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={onChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2 flex space-x-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="block flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <button
                type="button"
                onClick={sendOTP}
                disabled={sendingOtp || otpSent}
                className="px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-300 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">
                Enter OTP
              </label>
              <div className="mt-2 flex space-x-2">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={onChange}
                  placeholder="Enter 6-digit OTP"
                  className="block flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={verifyingOtp || otpVerified}
                  className="px-3 py-1.5 text-sm font-semibold text-green-600 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingOtp ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={onChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="mt-2 space-y-1">
                <div className={`text-xs flex items-center ${passwordRules.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">✓</span>
                  Minimum 8 characters
                </div>
                <div className={`text-xs flex items-center ${passwordRules.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">✓</span>
                  At least one uppercase letter
                </div>
                <div className={`text-xs flex items-center ${passwordRules.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">✓</span>
                  At least one lowercase letter
                </div>
                <div className={`text-xs flex items-center ${passwordRules.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">✓</span>
                  At least one number
                </div>
                <div className={`text-xs flex items-center ${passwordRules.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">✓</span>
                  At least one special character
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password2" className="block text-sm font-medium leading-6 text-gray-900">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={onChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;