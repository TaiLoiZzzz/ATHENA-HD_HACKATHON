'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  TrophyIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import UserRankDisplay from '@/components/Ranking/UserRankDisplay';
import TierBadge from '@/components/UserTier/TierBadge';

// Navigation items
const navigation = [
  { name: 'Flights', href: '/vietjet', icon: ShoppingBagIcon },
  { name: 'Banking', href: '/hdbank', icon: CurrencyDollarIcon },
  { name: 'Vikkibank', href: '/vikkibank', icon: BuildingStorefrontIcon },
  { name: 'Sovico', href: '/sovico', icon: SparklesIcon },
  { name: 'Web3', href: '/web3', icon: SparklesIcon },
  { name: 'AI Dashboard', href: '/ai-dashboard', icon: SparklesIcon },
  { name: 'AI Test', href: '/ai-test', icon: SparklesIcon },
];

// User menu items
const userNavigation = [
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Transactions', href: '/transactions', icon: DocumentTextIcon },
  { name: 'Cart', href: '/cart', icon: ShoppingCartIcon },
  { name: 'Loyalty', href: '/loyalty', icon: TrophyIcon },
];

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = '' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, hasAthenaPrime } = useAuth();
  const [notifications] = useState(3); // Mock notification count
  const [showSOVWallet, setShowSOVWallet] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <Disclosure as="nav" className={clsx('bg-white shadow-sm border-b border-gray-200', className)}>
      {({ open }) => (
        <>
          <div className="container-athena">
            <div className="flex justify-between h-16">
              {/* Left side - Logo and Navigation */}
              <div className="flex">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden">
                      <img 
                        src="/logo.png" 
                        alt="Sovico Logo" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                  
                  </Link>
                </div>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                            isActive
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          )}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    {/* ATHENA Prime Badge */}
                    {hasAthenaPrime() && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="hidden sm:flex items-center space-x-1 bg-token-100 text-token-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <SparklesIcon className="w-3 h-3" />
                        <span>Prime</span>
                      </motion.div>
                    )}

                    {/* User Rank Display */}
                    <UserRankDisplay compact={true} />
                    
                    {/* Tier Badge */}
                    <TierBadge
                      tier={{
                        name: 'Diamond',
                        level: 4,
                        color: 'blue',
                        bonusMultiplier: 2.0
                      }}
                      points={15000}
                      compact={true}
                      showBonus={true}
                    />

                    {/* SOV Wallet Quick Access */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSOVWallet(!showSOVWallet)}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <CurrencyDollarIcon className="w-5 h-5" />
                        <span className="hidden sm:block text-sm font-medium">SOV Wallet</span>
                      </button>

                      {/* SOV Wallet Dropdown */}
                      <AnimatePresence>
                        {showSOVWallet && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 z-50 mt-2 w-80"
                          >
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-1">
                              <SOVWallet />
                              <div className="border-t border-gray-200 p-3">
                                <Link
                                  href="/wallet"
                                  className="block w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                  onClick={() => setShowSOVWallet(false)}
                                >
                                  View Full Wallet →
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <button
                      type="button"
                      className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" />
                      {notifications > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                        >
                          {notifications}
                        </motion.span>
                      )}
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                      <div>
                        <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-1">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user?.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="hidden sm:block text-gray-700 font-medium">
                            {user?.fullName}
                          </span>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm text-gray-700 font-medium">{user?.fullName}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  href={item.href}
                                  className={clsx(
                                    active ? 'bg-gray-100' : '',
                                    'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                  )}
                                >
                                  <item.icon className="w-4 h-4 mr-3" />
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={clsx(
                                  active ? 'bg-gray-100' : '',
                                  'flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                )}
                              >
                                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  /* Not authenticated */
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn btn-primary"
                    >
                      Get Started
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                {isAuthenticated && (
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isAuthenticated && (
            <AnimatePresence>
              {open && (
                <Disclosure.Panel static as={motion.div} className="sm:hidden">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pt-2 pb-3 space-y-1 border-t border-gray-200 bg-gray-50"
                  >
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Disclosure.Button
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className={clsx(
                            'flex items-center px-3 py-2 text-base font-medium border-l-4',
                            isActive
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                          )}
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Disclosure.Button>
                      );
                    })}
                  </motion.div>
                </Disclosure.Panel>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </Disclosure>
  );
}
