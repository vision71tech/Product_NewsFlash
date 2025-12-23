import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Alert from '../../components/layout/Alert';
import api from '../../utils/api';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    password2: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setAlert({ type: 'error', message: 'Invalid reset link' });
    }
  }, [token]);

  const { password, password2 } = formData;

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (!token) {
      setAlert({ type: 'error', message: 'Invalid reset link' });
      setLoading(false);
      return;
    }

    if (password !== password2) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (!passwordRules.minLength || !passwordRules.hasUpperCase || !passwordRules.hasLowerCase || !passwordRules.hasNumber || !passwordRules.hasSpecialChar) {
      setAlert({ type: 'error', message: 'Password must meet all requirements' });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      setAlert({ type: 'success', message: 'Password reset successfully! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      let errorMessage = 'Failed to reset password. Please try again.';
      if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              New Password
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            <label htmlFor="password2" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Confirm New Password
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !token}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
