import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/Vision71 Tech.png';
import newsflashLogo from '../../assets/nflogo.png';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'New Entry', href: '/entries/new', current: location.pathname === '/entries/new' },
    { name: 'History', href: '/entries', current: location.pathname === '/entries' },
    { name: 'About Us', href: '/about-us', current: location.pathname === '/about-us' },
    { name: 'Contact Us', href: '/contact', current: location.pathname === '/contact' },
  ];

  let navigation = [
    ...baseNavigation,
    ...(user?.isAdmin ? [{ name: 'Admin', href: '/admin', current: location.pathname.startsWith('/admin') }] : []),
  ];

  // For admins, hide About Us and Contact Us from navbar on all routes
  if (user?.isAdmin) {
    navigation = navigation.filter((item) => item.name !== 'About Us' && item.name !== 'Contact Us');
  }

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }
      const response = await fetch('http://localhost:5000/api/auth/change-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Password change link sent to your email');
      } else {
        alert(data.msg || 'Failed to send password change link');
      }
    } catch (error) {
      console.error('Change password request error:', error);
      alert('Failed to send password change link');
    }
  };

  const userNavigation = [
    { name: 'Your Profile', href: '/dashboard', current: false },
    { name: 'Change Password', href: '#', onClick: handleChangePassword },
    { name: 'Sign out', href: '#', onClick: logout },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  const authLinks = navigation.map((item) => (
    <Link
      key={item.name}
      to={item.href}
      className={classNames(
        item.current
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
        'rounded-md px-3 py-2 text-sm font-medium'
      )}
      aria-current={item.current ? 'page' : undefined}
    >
      {item.name}
    </Link>
  ));

  const guestLinks = (
    <>
      <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Home</Link>
      <Link to="/about-us" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">About Us</Link>
      <Link to="/contact" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Contact</Link>
    </>
  );

  return (
    <Disclosure as="nav" className="bg-gray-800 dark:bg-gray-900">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left Side - Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="flex items-center space-x-2">
                  <img
      src={newsflashLogo}  // <-- replace with your logo import path
      alt="NewsFlash Logo"
      className="h-14 w-auto"  // adjust size as needed
    />
                    <span className="text-white text-xs font-medium pr-4">by</span>
                    <div className="flex flex-col items-center">
                      <img src={logo} alt="Vision71 Tech" className="h-7 w-auto" />
                      <span className="text-white text-[8px] -mt-1">Software</span>
                    </div>
                  </Link>
                </div>

                {/* Main Navigation */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {isAuthenticated ? authLinks : guestLinks}
                  </div>
                </div>
              </div>

              {/* Right - Login/Register or User Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md p-2 transition-colors"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>

                {!isAuthenticated ? (
                  <>
                    <a
                      href="/login"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      Login
                    </a>
                    <a
                      href="/register"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      Register
                    </a>
                  </>
                ) : (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) =>
                              item.name === 'Sign out' ? (
                                <a
                                  href={item.href}
                                  onClick={item.onClick}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </a>
                              ) : item.name === 'Change Password' ? (
                                <a
                                  href={item.href}
                                  onClick={item.onClick}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </a>
                              ) : (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )
                            }
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>

              {/* Mobile Hamburger */}
              <div className="-mr-2 flex md:hidden items-center space-x-2">
                {/* Dark Mode Toggle for Mobile */}
                <button
                  onClick={toggleDarkMode}
                  className="text-gray-400 hover:bg-gray-700 hover:text-white rounded-md p-2 transition-colors"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>

                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Panel */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {isAuthenticated ? authLinks : (
                <>
                  {guestLinks}
                  <a href="/login" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Login</a>
                  <a href="/register" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Register</a>
                </>
              )}
            </div>
            {isAuthenticated && (
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                    <div className="text-sm font-medium leading-none text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    item.name === 'Sign out' ? (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        onClick={item.onClick}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ) : item.name === 'Change Password' ? (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        onClick={item.onClick}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >

                        {item.name}
                      </Disclosure.Button>
                    ) : (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        to={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    )
                  ))}
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
