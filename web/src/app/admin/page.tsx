'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import { 
  UsersIcon,
  CreditCardIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalFlights: number;
  totalServices: number;
  totalTransactions: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
    
    fetchAdminStats();
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    try {
      // Mock stats for demo
      setStats({
        totalUsers: 127,
        totalProducts: 45,
        totalFlights: 892,
        totalServices: 23,
        totalTransactions: 1456,
        totalRevenue: 89234000
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'hdbank', name: 'HDBank', icon: CreditCardIcon },
    { id: 'vietjet', name: 'Vietjet', icon: PaperAirplaneIcon },
    { id: 'sovico', name: 'Sovico', icon: SparklesIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.fullName || 'Administrator'}
            </p>
            
            {/* Bonus Display */}
            <InlineBonusDisplay
              serviceType="admin"
              amount={1000000}
              category="management"
              position="top"
              size="large"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <CreditCardIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">HDBank Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <PaperAirplaneIcon className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Vietjet Flights</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalFlights}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <SparklesIcon className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Sovico Services</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <CreditCardIcon className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats.totalRevenue / 1000000).toFixed(1)}M VND
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">New user registered: gold1@athena.com</span>
                      <span className="ml-auto text-xs text-gray-400">2 minutes ago</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Flight booking completed: VJ123</span>
                      <span className="ml-auto text-xs text-gray-400">5 minutes ago</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">SOV token transaction: 25 SOV</span>
                      <span className="ml-auto text-xs text-gray-400">10 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab !== 'overview' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h3>
              <p className="text-gray-600">
                This section is under development. Coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}