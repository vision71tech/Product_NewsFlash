import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/Vision71 Tech.png';
import logo1 from '../../assets/nflogo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        
        {/* Logo & Description */}
        <div className="col-span-1 md:col-span-2">
             <div className="flex items-center space-x-3 mb-4">
              <img
                src={logo1}
                alt="NewsFlash Logo"
                className="h-14 w-auto rounded-md object-contain"
              />
            </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Stay informed with NewsFlash — your go-to platform for market, local, and global updates. 
            Designed for simplicity, privacy, and performance.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-indigo-400 transition">Dashboard</Link></li>
            <li><Link to="/entries" className="hover:text-indigo-400 transition">Entries</Link></li>
            <li><Link to="/entries/new" className="hover:text-indigo-400 transition">New Entry</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about-us" className="hover:text-indigo-400 transition">
                About Us
              </Link>
            </li>
            <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-indigo-400 transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
   <div className="flex items-center space-x-3">
  <a
    href="https://vision71tech.com"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
  >
    <img src={logo} alt="Vision71" className="h-6 w-auto" />
    <span className="text-sm text-gray-400">
      © {currentYear} <strong className="text-white">Vision71 Software</strong> — All rights reserved.
    </span>
  </a>
</div>


          <div className="flex space-x-4">
            <a href="https://www.linkedin.com/company/vision71" target='_blank' className="hover:text-white transition">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
