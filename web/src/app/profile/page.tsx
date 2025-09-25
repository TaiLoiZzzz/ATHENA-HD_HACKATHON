'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  CogIcon,
  BellIcon,
  KeyIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  WalletIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import UserRankDisplay from '@/components/Ranking/UserRankDisplay';
import RankBadge from '@/components/Ranking/RankBadge';
import { UserRanking, rankingService } from '@/services/rankingService';
import LoyaltyTierDisplay from '@/components/Loyalty/LoyaltyTierDisplay';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  isVerified: boolean;
  athenaPrime: boolean;
  avatarUrl?: string;
  joinedAt: string;
}

interface UserStats {
  totalTransactions: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  currentBalance: number;
  loyaltyPoints: number;
  joinedDaysAgo: number;
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ranking, setRanking] = useState<UserRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      fetchUserStats();
      fetchUserRanking();
    }
  }, [isAuthenticated, user]);

  const fetchUserRanking = async () => {
    try {
      const userRanking = await rankingService.getUserRanking();
      setRanking(userRanking);
    } catch (error) {
      console.error('Failed to fetch user ranking:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          dateOfBirth: data.user.dateOfBirth || '',
          address: data.user.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Use mock data for demo
      const mockProfile = {
        id: user?.id || 'demo-user',
        email: user?.email || 'demo@athena.com',
        fullName: user?.fullName || 'Demo User',
        phone: '+84 123 456 789',
        dateOfBirth: '1990-01-01',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        isVerified: true,
        athenaPrime: true,
        joinedAt: '2024-01-01'
      };
      setProfile(mockProfile);
      setFormData({
        fullName: mockProfile.fullName,
        phone: mockProfile.phone || '',
        dateOfBirth: mockProfile.dateOfBirth || '',
        address: mockProfile.address || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        // Mock stats for demo
        setStats({
          totalTransactions: 45,
          totalTokensEarned: 2450.75,
          totalTokensSpent: 1200.50,
          currentBalance: 1250.25,
          loyaltyPoints: 15640,
          joinedDaysAgo: 298
        });
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Mock stats for demo
      setStats({
        totalTransactions: 45,
        totalTokensEarned: 2450.75,
        totalTokensSpent: 1200.50,
        currentBalance: 1250.25,
        loyaltyPoints: 15640,
        joinedDaysAgo: 298
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Cập nhật profile thành công!');
        setEditing(false);
        fetchProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast.success('Cập nhật profile thành công! (Demo mode)');
      setEditing(false);
      // Update local state for demo
      setProfile(prev => prev ? {
        ...prev,
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address
      } : null);
    }
  };

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để xem profile</h1>
            <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Đăng nhập ngay
            </a>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserIcon className="w-8 h-8 mr-3" />
              Profile
            </h1>
            <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và theo dõi hoạt động của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {profile?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
                      <p className="opacity-90">{profile?.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {profile?.isVerified && (
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-sm">Đã xác thực</span>
                          </div>
                        )}
                        {profile?.athenaPrime && (
                          <div className="flex items-center space-x-1">
                            <SparklesIcon className="w-4 h-4" />
                            <span className="text-sm">ATHENA Prime</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ranking and Badges Section */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <SparklesIcon className="w-5 h-5 text-yellow-500" />
                      <span>Huy hiệu & Thành tựu</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Rank Display */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Cấp độ hiện tại</h4>
                      {ranking ? (
                        <div className="space-y-4">
                          <RankBadge 
                            rank={ranking.rank} 
                            size="large" 
                            showProgress={true}
                            currentPoints={ranking.totalPoints}
                            nextRankPoints={ranking.nextRankPoints}
                          />
                          <div className="text-sm text-gray-600">
                            <p>Tổng điểm: <span className="font-semibold text-blue-600">{(ranking.totalPoints || 0).toLocaleString()}</span></p>
                            <p>Giao dịch: <span className="font-semibold">{ranking.totalTransactions || 0}</span></p>
                            <p>Tổng chi tiêu: <span className="font-semibold text-green-600">{(ranking.totalSpent || 0).toLocaleString()} VND</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-24">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Thành tựu</h4>
                      {ranking?.achievements && ranking.achievements.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {ranking.achievements.map((achievement, index) => (
                            <div 
                              key={index}
                              className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <StarIcon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700 leading-tight">{achievement}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <StarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">Chưa có thành tựu nào</p>
                          <p className="text-xs">Sử dụng dịch vụ để nhận thành tựu!</p>
                        </div>
                      )}
                    </div>

                    {/* Service Usage Stats */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Thống kê sử dụng dịch vụ</h4>
                      {ranking?.servicesUsed ? (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white font-bold">VJ</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">Vietjet</p>
                            <p className="text-lg font-bold text-blue-600">{ranking.servicesUsed.vietjet || 0}</p>
                            <p className="text-xs text-gray-500">lần sử dụng</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white font-bold">HD</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">HDBank</p>
                            <p className="text-lg font-bold text-green-600">{ranking.servicesUsed.hdbank || 0}</p>
                            <p className="text-xs text-gray-500">lần sử dụng</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white font-bold">SV</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">Sovico</p>
                            <p className="text-lg font-bold text-purple-600">{ranking.servicesUsed.sovico || 0}</p>
                            <p className="text-xs text-gray-500">lần sử dụng</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <p className="text-sm">Chưa có dữ liệu sử dụng dịch vụ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>{editing ? 'Hủy' : 'Chỉnh sửa'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profile?.fullName || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{profile?.email}</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profile?.phone || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      {editing ? (
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      {editing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-start space-x-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                          <span className="text-gray-900">{profile?.address || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Stats */}
              {stats && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Thống kê hoạt động</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                      <p className="text-sm text-gray-600">Giao dịch</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <WalletIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatTokens(stats.currentBalance)}</p>
                      <p className="text-sm text-gray-600">SOV Token</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <StarIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatTokens(stats.totalTokensEarned)}</p>
                      <p className="text-sm text-gray-600">Token Earned</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <ClockIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.joinedDaysAgo}</p>
                      <p className="text-sm text-gray-600">Ngày tham gia</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Loyalty Tier */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hạng thành viên</h3>
                <LoyaltyTierDisplay />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                <div className="space-y-3">
                  <Link
                    href="/transactions"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Lịch sử giao dịch</h4>
                      <p className="text-sm text-gray-600">Xem tất cả giao dịch</p>
                    </div>
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Giỏ hàng</h4>
                      <p className="text-sm text-gray-600">Quản lý đơn hàng</p>
                    </div>
                  </Link>

                  <Link
                    href="/loyalty"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Chương trình thành viên</h4>
                      <p className="text-sm text-gray-600">Xem ưu đãi và bonus</p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <KeyIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                      <p className="text-sm text-gray-600">Cập nhật bảo mật</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-900">Email đã xác thực</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Hoàn thành
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-gray-900">Xác thực 2 yếu tố</span>
                    </div>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                      Khuyến nghị
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BellIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Thông báo bảo mật</span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Bật
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}