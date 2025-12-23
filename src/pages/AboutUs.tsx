import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Learn more about NewsFlash and our mission to keep you informed.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              NewsFlash is a comprehensive platform designed to empower Vision71 Technologies with daily insights into global, local, and market news. We believe that staying informed is crucial for making informed decisions in today's fast-paced world.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>Real-time stock tracking for both local and global markets</li>
              <li>Comprehensive news headlines from trusted sources</li>
              <li>Personal history tracking of market events and news</li>
              <li>Secure and private data management</li>
              <li>User-friendly interface for easy navigation and collaboration</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              To create a confidential intelligence platform that fosters innovation and informed decision-making within Vision71 Technologies. We strive to provide a simple yet powerful tool for monitoring markets and news that matter most to our users.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Have questions or feedback? We'd love to hear from you. Reach out through our contact form or visit our website at{' '}
              <a
                href="https://www.vision71tech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                vision71tech.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
