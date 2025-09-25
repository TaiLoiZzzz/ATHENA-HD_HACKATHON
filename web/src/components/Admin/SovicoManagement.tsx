'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  MapPinIcon,
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface SovicoService {
  id: string;
  name: string;
  category: 'resort' | 'insurance' | 'travel' | 'lifestyle' | 'financial';
  description: string;
  price: {
    amount: number;
    currency: string;
    sovTokenPrice?: number;
    sovTokenDiscount?: number;
  };
  features: string[];
  images?: string[];
  location?: {
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    available: boolean;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    booked?: number;
  };
  policies?: {
    cancellation?: string;
    refund?: string;
    terms?: string;
  };
  ratings?: {
    average: number;
    count: number;
  };
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

interface SovicoManagementProps {
  onClose?: () => void;
}

export default function SovicoManagement({ onClose }: SovicoManagementProps) {
  const [services, setServices] = useState<SovicoService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<SovicoService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'resort' as 'resort' | 'insurance' | 'travel' | 'lifestyle' | 'financial',
    description: '',
    price: {
      amount: 0,
      currency: 'VND',
      sovTokenPrice: 0,
      sovTokenDiscount: 0
    },
    features: [''],
    images: [''],
    location: {
      address: '',
      city: '',
      country: 'Vietnam'
    },
    availability: {
      available: true,
      capacity: 0,
      booked: 0
    },
    policies: {
      cancellation: '',
      refund: '',
      terms: ''
    },
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const getAuthToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
  };

  const fetchServices = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/sovico/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        // Mock data for demo
        setServices([
          {
            id: '1',
            name: 'Phu Quoc Resort Package',
            category: 'resort',
            description: 'Gói nghỉ dưỡng 3 ngày 2 đêm tại Phú Quốc',
            price: {
              amount: 5000000,
              currency: 'VND',
              sovTokenPrice: 500,
              sovTokenDiscount: 20
            },
            features: ['Phòng view biển', 'Ăn sáng buffet', 'Xe đưa đón sân bay', 'Spa miễn phí'],
            images: ['/images/phu-quoc-resort.jpg'],
            location: {
              address: 'Bãi Trường, Phú Quốc',
              city: 'Phú Quốc',
              country: 'Vietnam'
            },
            availability: {
              available: true,
              capacity: 100,
              booked: 25
            },
            ratings: {
              average: 4.8,
              count: 127
            },
            is_active: true,
            is_featured: true,
            created_at: '2024-01-15'
          },
          {
            id: '2',
            name: 'Comprehensive Health Insurance',
            category: 'insurance',
            description: 'Bảo hiểm sức khỏe toàn diện cho gia đình',
            price: {
              amount: 12000000,
              currency: 'VND',
              sovTokenPrice: 1200,
              sovTokenDiscount: 15
            },
            features: ['Bảo hiểm nội trú', 'Bảo hiểm ngoại trú', 'Khám sức khỏe định kỳ', 'Hỗ trợ 24/7'],
            is_active: true,
            is_featured: true,
            created_at: '2024-01-10'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      const url = editingService 
        ? `/api/admin/sovico/services/${editingService.id}`
        : '/api/admin/sovico/services';
      
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(f => f.trim() !== ''),
          images: formData.images.filter(img => img.trim() !== '')
        })
      });

      if (response.ok) {
        toast.success(editingService ? 'Cập nhật thành công!' : 'Tạo dịch vụ thành công!');
        setShowModal(false);
        resetForm();
        fetchServices();
      } else {
        throw new Error('Failed to save service');
      }
    } catch (error) {
      toast.error('Không thể lưu dịch vụ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/sovico/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Xóa dịch vụ thành công!');
        fetchServices();
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error) {
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const handleEdit = (service: SovicoService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: {
        amount: service.price.amount,
        currency: service.price.currency,
        sovTokenPrice: service.price.sovTokenPrice || 0,
        sovTokenDiscount: service.price.sovTokenDiscount || 0
      },
      features: service.features || [''],
      images: service.images || [''],
      location: {
        address: service.location?.address || '',
        city: service.location?.city || '',
        country: service.location?.country || 'Vietnam'
      },
      availability: {
        available: service.availability?.available ?? true,
        capacity: service.availability?.capacity || 0,
        booked: service.availability?.booked || 0
      },
      policies: {
        cancellation: service.policies?.cancellation || '',
        refund: service.policies?.refund || '',
        terms: service.policies?.terms || ''
      },
      is_active: service.is_active,
      is_featured: service.is_featured
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'resort' as 'resort' | 'insurance' | 'travel' | 'lifestyle' | 'financial',
      description: '',
      price: {
        amount: 0,
        currency: 'VND',
        sovTokenPrice: 0,
        sovTokenDiscount: 0
      },
      features: [''],
      images: [''],
      location: {
        address: '',
        city: '',
        country: 'Vietnam'
      },
      availability: {
        available: true,
        capacity: 0,
        booked: 0
      },
      policies: {
        cancellation: '',
        refund: '',
        terms: ''
      },
      is_active: true,
      is_featured: false
    });
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resort': return 'text-blue-600 bg-blue-100';
      case 'insurance': return 'text-green-600 bg-green-100';
      case 'travel': return 'text-purple-600 bg-purple-100';
      case 'lifestyle': return 'text-pink-600 bg-pink-100';
      case 'financial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'resort': return 'Resort';
      case 'insurance': return 'Bảo hiểm';
      case 'travel': return 'Du lịch';
      case 'lifestyle': return 'Lifestyle';
      case 'financial': return 'Tài chính';
      default: return category;
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="w-8 h-8 mr-3 text-purple-600" />
            Quản lý dịch vụ Sovico
          </h2>
          <p className="text-gray-600 mt-2">Thêm, sửa, xóa các dịch vụ và gói ưu đãi</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="resort">Resort</option>
              <option value="insurance">Bảo hiểm</option>
              <option value="travel">Du lịch</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="financial">Tài chính</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm dịch vụ
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            {service.images && service.images.length > 0 && service.images[0] && (
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {service.is_featured && (
                  <div className="absolute top-2 right-2">
                    <StarIcon className="w-6 h-6 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                      {getCategoryLabel(service.category)}
                    </span>
                    {service.is_active ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

              {/* Price */}
              <div className="mb-4">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(service.price.amount)}
                </div>
                {service.price.sovTokenPrice && (
                  <div className="text-sm text-purple-600">
                    {service.price.sovTokenPrice} SOV
                    {service.price.sovTokenDiscount && (
                      <span className="text-green-600 ml-1">
                        (-{service.price.sovTokenDiscount}%)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="space-y-1">
                  {service.features?.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-sm text-gray-700 flex items-center">
                      <CheckIcon className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                  {service.features?.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{service.features.length - 3} tính năng khác
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {service.location?.city && (
                <div className="mb-4 flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {service.location.city}, {service.location.country}
                </div>
              )}

              {/* Ratings */}
              {service.ratings && service.ratings.count > 0 && (
                <div className="mb-4 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(service.ratings?.average || 0)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {service.ratings.average?.toFixed(1)} ({service.ratings.count} đánh giá)
                  </span>
                </div>
              )}

              {/* Availability */}
              {service.availability && (
                <div className="mb-4 text-sm">
                  <span className="text-gray-500">Trạng thái: </span>
                  <span className={`font-medium ${
                    service.availability.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {service.availability.available ? 'Có sẵn' : 'Hết chỗ'}
                  </span>
                  {service.availability.capacity && (
                    <div className="text-xs text-gray-500 mt-1">
                      Đã đặt: {service.availability.booked || 0}/{service.availability.capacity}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {new Date(service.created_at).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dịch vụ</h3>
          <p className="text-gray-600 mb-4">Chưa có dịch vụ nào khớp với bộ lọc</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Thêm dịch vụ đầu tiên
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên dịch vụ *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="resort">Resort</option>
                        <option value="insurance">Bảo hiểm</option>
                        <option value="travel">Du lịch</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="financial">Tài chính</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Giá dịch vụ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá (VND) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price.amount}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, amount: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá SOV Token
                        </label>
                        <input
                          type="number"
                          value={formData.price.sovTokenPrice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, sovTokenPrice: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giảm giá SOV (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={formData.price.sovTokenDiscount}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, sovTokenDiscount: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Địa điểm</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          value={formData.location.address}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, address: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố
                        </label>
                        <input
                          type="text"
                          value={formData.location.city}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quốc gia
                        </label>
                        <input
                          type="text"
                          value={formData.location.country}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, country: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tính năng
                    </label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Nhập tính năng..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Thêm tính năng
                    </button>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh (URL)
                    </label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImage}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Thêm hình ảnh
                    </button>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Tình trạng</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sức chứa
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.capacity}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, capacity: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đã đặt
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.booked}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, booked: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Kích hoạt dịch vụ
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                        Dịch vụ nổi bật
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {editingService ? 'Cập nhật' : 'Tạo dịch vụ'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
