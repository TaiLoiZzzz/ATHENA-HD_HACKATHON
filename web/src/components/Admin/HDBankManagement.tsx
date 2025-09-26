'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface HDBankProduct {
  id: string;
  name: string;
  type: 'cards' | 'loans' | 'savings' | 'insurance';
  description: string;
  features: string[];
  is_active: boolean;
  annual_fee?: { fiat: number; sovToken: number };
  credit_limit?: { min: number; max: number };
  applicable_cashback?: number;
  applicable_rewards?: number;
  interest_rate?: { min: number; max: number };
  loan_amount?: { min: number; max: number };
  term?: { min: number; max: number };
  min_investment?: number;
  expected_returns?: { low: number; high: number };
  risk_level?: 'low' | 'medium' | 'high';
  coverage?: { min: number; max: number };
  premium?: { monthly: number; yearly: number };
  created_at: string;
}

interface HDBankManagementProps {
  onClose?: () => void;
}

export default function HDBankManagement({ onClose }: HDBankManagementProps) {
  const [products, setProducts] = useState<HDBankProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HDBankProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'cards' as 'cards' | 'loans' | 'savings' | 'insurance',
    description: '',
    features: [''],
    is_active: true,
    annual_fee: { fiat: 0, sovToken: 0 },
    credit_limit: { min: 0, max: 0 },
    applicable_cashback: 0,
    applicable_rewards: 0,
    interest_rate: { min: 0, max: 0 },
    loan_amount: { min: 0, max: 0 },
    term: { min: 12, max: 60 },
    min_investment: 0,
    expected_returns: { low: 0, high: 0 },
      risk_level: 'low' as 'low' | 'medium' | 'high',
    coverage: { min: 0, max: 0 },
    premium: { monthly: 0, yearly: 0 }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const getAuthToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/hdbank', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Mock data for demo
        setProducts([
          {
            id: '1',
            name: 'HDBank Platinum Credit Card',
            type: 'cards',
            description: 'Thẻ tín dụng cao cấp với nhiều ưu đãi',
            features: ['Cashback 2%', 'Miễn phí rút tiền ATM', 'Bảo hiểm du lịch'],
            is_active: true,
            annual_fee: { fiat: 2000000, sovToken: 200 },
            credit_limit: { min: 50000000, max: 500000000 },
            applicable_cashback: 2.0,
            applicable_rewards: 100,
            created_at: '2024-01-15'
          },
          {
            id: '2',
            name: 'HDBank Home Loan',
            type: 'loans',
            description: 'Vay mua nhà với lãi suất ưu đãi',
            features: ['Lãi suất thả nổi', 'Thời hạn vay linh hoạt'],
            is_active: true,
            interest_rate: { min: 8.5, max: 12.0 },
            loan_amount: { min: 500000000, max: 10000000000 },
            term: { min: 120, max: 300 },
            created_at: '2024-01-10'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      const url = editingProduct 
        ? `/api/admin/hdbank/${editingProduct.id}`
        : '/api/admin/hdbank';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(f => f.trim() !== '')
        })
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!');
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      toast.error('Không thể lưu sản phẩm');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/hdbank/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Xóa sản phẩm thành công!');
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleEdit = (product: HDBankProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      description: product.description,
      features: product.features || [''],
      is_active: product.is_active,
      annual_fee: product.annual_fee || { fiat: 0, sovToken: 0 },
      credit_limit: product.credit_limit || { min: 0, max: 0 },
      applicable_cashback: product.applicable_cashback || 0,
      applicable_rewards: product.applicable_rewards || 0,
      interest_rate: product.interest_rate || { min: 0, max: 0 },
      loan_amount: product.loan_amount || { min: 0, max: 0 },
      term: product.term || { min: 12, max: 60 },
      min_investment: product.min_investment || 0,
      expected_returns: product.expected_returns || { low: 0, high: 0 },
      risk_level: product.risk_level || 'low',
      coverage: product.coverage || { min: 0, max: 0 },
      premium: product.premium || { monthly: 0, yearly: 0 }
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      type: 'cards' as 'cards' | 'loans' | 'savings' | 'insurance',
      description: '',
      features: [''],
      is_active: true,
      annual_fee: { fiat: 0, sovToken: 0 },
      credit_limit: { min: 0, max: 0 },
      applicable_cashback: 0,
      applicable_rewards: 0,
      interest_rate: { min: 0, max: 0 },
      loan_amount: { min: 0, max: 0 },
      term: { min: 12, max: 60 },
      min_investment: 0,
      expected_returns: { low: 0, high: 0 },
      risk_level: 'low' as 'low' | 'medium' | 'high',
      coverage: { min: 0, max: 0 },
      premium: { monthly: 0, yearly: 0 }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cards': return CreditCardIcon;
      case 'loans': return BanknotesIcon;
      case 'savings': return ChartBarIcon;
      case 'insurance': return ShieldCheckIcon;
      default: return CreditCardIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cards': return 'text-blue-600 bg-blue-100';
      case 'loans': return 'text-green-600 bg-green-100';
      case 'savings': return 'text-yellow-600 bg-yellow-100';
      case 'insurance': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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
            <div className="bg-blue-50 rounded-lg p-2 mr-3">
              <img 
                src="/logo-hd-bank-file-vector-02.jpg" 
                alt="HD Bank" 
                className="w-8 h-8 object-contain"
              />
            </div>
            Quản lý sản phẩm HDBank
          </h2>
          <p className="text-gray-600 mt-2">Thêm, sửa, xóa các sản phẩm ngân hàng</p>
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="cards">Thẻ tín dụng</option>
              <option value="loans">Vay vốn</option>
              <option value="savings">Tiết kiệm</option>
              <option value="insurance">Bảo hiểm</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const IconComponent = getTypeIcon(product.type);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <img 
                        src="/logo-hd-bank-file-vector-02.jpg" 
                        alt="HD Bank" 
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div className={`p-2 rounded-lg ${getTypeColor(product.type)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(product.type)}`}>
                        {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.is_active ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                
                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tính năng</h4>
                  <div className="space-y-1">
                    {product.features?.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-sm text-gray-700 flex items-center">
                        <CheckIcon className="w-3 h-3 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                    {product.features?.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{product.features.length - 3} tính năng khác
                      </div>
                    )}
                  </div>
                </div>

                {/* Type-specific info */}
                {product.type === 'cards' && product.annual_fee && (
                  <div className="text-sm">
                    <span className="text-gray-500">Phí thường niên: </span>
                    <span className="font-medium">{formatCurrency(product.annual_fee.fiat)}</span>
                  </div>
                )}

                {product.type === 'loans' && product.interest_rate && (
                  <div className="text-sm">
                    <span className="text-gray-500">Lãi suất: </span>
                    <span className="font-medium">{product.interest_rate.min}% - {product.interest_rate.max}%</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có sản phẩm</h3>
          <p className="text-gray-600 mb-4">Chưa có sản phẩm nào khớp với bộ lọc</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thêm sản phẩm đầu tiên
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
                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
                        Tên sản phẩm *
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
                        Loại sản phẩm *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="cards">Thẻ tín dụng</option>
                        <option value="loans">Vay vốn</option>
                        <option value="savings">Tiết kiệm</option>
                        <option value="insurance">Bảo hiểm</option>
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

                  {/* Type-specific fields */}
                  {formData.type === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phí thường niên (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.annual_fee.fiat}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            annual_fee: { ...prev.annual_fee, fiat: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cashback (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.applicable_cashback}
                          onChange={(e) => setFormData(prev => ({ ...prev, applicable_cashback: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hạn mức tối thiểu (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.credit_limit.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            credit_limit: { ...prev.credit_limit, min: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hạn mức tối đa (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.credit_limit.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            credit_limit: { ...prev.credit_limit, max: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type === 'loans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lãi suất tối thiểu (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interest_rate.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            interest_rate: { ...prev.interest_rate, min: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lãi suất tối đa (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interest_rate.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            interest_rate: { ...prev.interest_rate, max: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tiền vay tối thiểu (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.loan_amount.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            loan_amount: { ...prev.loan_amount, min: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tiền vay tối đa (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.loan_amount.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            loan_amount: { ...prev.loan_amount, max: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Kích hoạt sản phẩm
                    </label>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
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
