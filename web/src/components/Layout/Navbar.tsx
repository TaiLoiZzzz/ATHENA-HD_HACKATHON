'use client';

import { Fragment, useState, useEffect } from 'react';
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
  HomeIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import UserRankDisplay from '@/components/Ranking/UserRankDisplay';
import TierBadge from '@/components/UserTier/TierBadge';

// Navigation items
const navigation = [
  { 
    name: 'Dịch vụ', 
    href: '#', 
    icon: BuildingStorefrontIcon,
    submenu: [
      { name: 'Vietjet', href: '/vietjet', icon: ShoppingBagIcon },
      { name: 'HDBank', href: '/hdbank', icon: CurrencyDollarIcon },
      { name: 'Vikkibank', href: '/vikkibank', icon: BuildingStorefrontIcon },
      { name: 'Sovico', href: '/sovico', icon: SparklesIcon },
    ]
  },
  { name: 'AI Dashboard', href: '/ai-dashboard', icon: SparklesIcon },
];

// User menu items
const userNavigation = [
  { name: 'Hồ sơ', href: '/profile', icon: UserIcon },
  { name: 'Giao dịch', href: '/transactions', icon: DocumentTextIcon },
  { name: 'Giỏ hàng', href: '/cart', icon: ShoppingCartIcon },
  { name: 'Thành tích', href: '/loyalty', icon: TrophyIcon },
  { name: 'Cài đặt', href: '/settings', icon: Cog6ToothIcon },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <Disclosure as="nav" className={clsx(
      'bg-white shadow-sm border-b border-gray-200 transition-all duration-200',
      isScrolled ? 'shadow-lg' : 'shadow-sm',
      className
    )}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Left side - Logo and Navigation */}
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 p-1">
                      <img 
                        src="/LOGO CHÍNh của web.jpg" 
                        alt="ATHENA HD Logo" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
                      ATHENA HD
                    </span>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                  <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      const hasSubmenu = item.submenu && item.submenu.length > 0;
                      
                      if (hasSubmenu) {
                        return (
                          <div key={item.name} className="relative">
                            <button
                              onClick={() => setShowServicesMenu(!showServicesMenu)}
                              className={clsx(
                                'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              )}
                            >
                              <item.icon className="w-4 h-4 mr-2" />
                              {item.name}
                              <ChevronDownIcon className="w-4 h-4 ml-1" />
                            </button>
                            
                            {/* Services Submenu */}
                            <AnimatePresence>
                              {showServicesMenu && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                >
                                  {item.submenu?.map((subItem) => (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      onClick={() => setShowServicesMenu(false)}
                                    >
                                      <subItem.icon className="w-4 h-4 mr-3" />
                                      {subItem.name}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isAuthenticated ? (
                  <>
                    {/* Desktop-only elements */}
                    <div className="hidden lg:flex items-center space-x-4">
                      {/* ATHENA Prime Badge */}
                      {hasAthenaPrime() && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium"
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
                    </div>

                    {/* SOV Wallet Quick Access */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSOVWallet(!showSOVWallet)}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:block text-sm font-medium">SOV</span>
                      </button>

                      {/* SOV Wallet Dropdown */}
                      <AnimatePresence>
                        {showSOVWallet && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 z-50 mt-2 w-80 sm:w-96"
                          >
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-1">
                              <SOVWallet />
                              <div className="border-t border-gray-200 p-3">
                                <Link
                                  href="/wallet"
                                  className="block w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                  onClick={() => setShowSOVWallet(false)}
                                >
                                  Xem ví đầy đủ →
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
                      <span className="sr-only">Xem thông báo</span>
                      <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      {notifications > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                        >
                          {notifications}
                        </motion.span>
                      )}
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                      <div>
                        <Menu.Button className="flex items-center space-x-2 sm:space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-1">
                          <span className="sr-only">Mở menu người dùng</span>
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user?.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="hidden sm:block text-gray-700 font-medium max-w-24 truncate">
                            {user?.fullName}
                          </span>
                          <ChevronDownIcon className="hidden sm:block w-4 h-4 text-gray-400" />
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm text-gray-700 font-medium truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
                                Đăng xuất
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  /* Not authenticated */
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn btn-primary text-sm px-4 py-2"
                    >
                      Bắt đầu
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                {isAuthenticated && (
                  <div className="lg:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                      <span className="sr-only">Mở menu chính</span>
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
                <Disclosure.Panel static as={motion.div} className="lg:hidden">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pt-2 pb-3 space-y-1 border-t border-gray-200 bg-gray-50"
                  >
                    {/* Mobile User Info */}
                    <div className="px-4 py-3 bg-white border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user?.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {hasAthenaPrime() && (
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            <SparklesIcon className="w-3 h-3" />
                            <span>Prime</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="px-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const hasSubmenu = item.submenu && item.submenu.length > 0;
                        
                        if (hasSubmenu) {
                          return (
                            <div key={item.name} className="space-y-1">
                              <div className="flex items-center px-3 py-3 text-base font-medium text-gray-600">
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                              </div>
                              <div className="ml-6 space-y-1">
                                {item.submenu?.map((subItem) => {
                                  const isSubActive = pathname === subItem.href;
                                  return (
                                    <Disclosure.Button
                                      key={subItem.name}
                                      as={Link}
                                      href={subItem.href}
                                      className={clsx(
                                        'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                        isSubActive
                                          ? 'bg-primary-100 text-primary-700'
                                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                      )}
                                    >
                                      <subItem.icon className="w-4 h-4 mr-3" />
                                      {subItem.name}
                                    </Disclosure.Button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <Disclosure.Button
                            key={item.name}
                            as={Link}
                            href={item.href}
                            className={clsx(
                              'flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </Disclosure.Button>
                        );
                      })}
                    </div>

                    {/* Mobile User Actions */}
                    <div className="px-2 pt-2 border-t border-gray-200">
                      <div className="space-y-1">
                        {userNavigation.map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as={Link}
                            href={item.href}
                            className="flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </Disclosure.Button>
                        ))}
                        <Disclosure.Button
                          as="button"
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                          Đăng xuất
                        </Disclosure.Button>
                      </div>
                    </div>
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
