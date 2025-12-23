import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const getAlertClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-400 dark:border-green-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-400 dark:border-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-400 dark:border-yellow-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-400 dark:border-blue-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600';
    }
  };

  const getIconClasses = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getAlertClasses()}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* You can add specific icons for each alert type here */}
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm">{message}</p>
          {onClose && (
            <button
              type="button"
              className={`ml-3 flex-shrink-0 ${getIconClasses()} hover:opacity-75 focus:outline-none`}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;