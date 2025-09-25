'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface VietjetFlight {
  id: string;
  flight_number: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    terminal?: string;
  };
  aircraft?: string;
  duration: string;
  price: {
    economy: number;
    business?: number;
    sovTokenDiscount?: number;
  };
  availability: {
    economy: number;
    business?: number;
  };
  baggage?: {
    checkedIncluded: number;
    handCarryIncluded: number;
  };
  amenities?: string[];
  is_active: boolean;
  departure_date: string;
  created_at: string;
}

interface VietjetManagementProps {
  onClose?: () => void;
}

export default function VietjetManagement({ onClose }: VietjetManagementProps) {
  const [flights, setFlights] = useState<VietjetFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<VietjetFlight | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('all');
  const [formData, setFormData] = useState({
    flight_number: '',
    airline: 'Vietjet Air',
    departure: {
      airport: '',
      city: '',
      time: '',
      terminal: ''
    },
    arrival: {
      airport: '',
      city: '',
      time: '',
      terminal: ''
    },
    aircraft: '',
    duration: '',
    price: {
      economy: 0,
      business: 0,
      sovTokenDiscount: 10
    },
    availability: {
      economy: 0,
      business: 0
    },
    baggage: {
      checkedIncluded: 20,
      handCarryIncluded: 7
    },
    amenities: [''],
    is_active: true,
    departure_date: ''
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const getAuthToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
  };

  const fetchFlights = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/vietjet/flights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data.flights || []);
      } else {
        // Mock data for demo
        setFlights([
          {
            id: '1',
            flight_number: 'VJ123',
            airline: 'Vietjet Air',
            departure: {
              airport: 'SGN',
              city: 'Ho Chi Minh City',
              time: '08:30',
              terminal: 'T1'
            },
            arrival: {
              airport: 'HAN',
              city: 'Hanoi',
              time: '10:45',
              terminal: 'T1'
            },
            aircraft: 'A321',
            duration: '2h 15m',
            price: {
              economy: 1500000,
              business: 3500000,
              sovTokenDiscount: 10
            },
            availability: {
              economy: 150,
              business: 20
            },
            baggage: {
              checkedIncluded: 20,
              handCarryIncluded: 7
            },
            amenities: ['WiFi', 'Meals', 'Entertainment'],
            is_active: true,
            departure_date: '2024-02-01',
            created_at: '2024-01-15'
          },
          {
            id: '2',
            flight_number: 'VJ456',
            airline: 'Vietjet Air',
            departure: {
              airport: 'HAN',
              city: 'Hanoi',
              time: '14:00',
              terminal: 'T1'
            },
            arrival: {
              airport: 'SGN',
              city: 'Ho Chi Minh City',
              time: '16:15',
              terminal: 'T1'
            },
            aircraft: 'A320',
            duration: '2h 15m',
            price: {
              economy: 1600000,
              business: 3600000,
              sovTokenDiscount: 10
            },
            availability: {
              economy: 120,
              business: 15
            },
            is_active: true,
            departure_date: '2024-02-05',
            created_at: '2024-01-10'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      toast.error('Không thể tải danh sách chuyến bay');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      const url = editingFlight 
        ? `/api/admin/vietjet/flights/${editingFlight.id}`
        : '/api/admin/vietjet/flights';
      
      const method = editingFlight ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amenities: formData.amenities.filter(a => a.trim() !== '')
        })
      });

      if (response.ok) {
        toast.success(editingFlight ? 'Cập nhật thành công!' : 'Tạo chuyến bay thành công!');
        setShowModal(false);
        resetForm();
        fetchFlights();
      } else {
        throw new Error('Failed to save flight');
      }
    } catch (error) {
      toast.error('Không thể lưu chuyến bay');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chuyến bay này?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/vietjet/flights/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Xóa chuyến bay thành công!');
        fetchFlights();
      } else {
        throw new Error('Failed to delete flight');
      }
    } catch (error) {
      toast.error('Không thể xóa chuyến bay');
    }
  };

  const handleEdit = (flight: VietjetFlight) => {
    setEditingFlight(flight);
    setFormData({
      flight_number: flight.flight_number,
      airline: flight.airline,
      departure: {
        airport: flight.departure.airport,
        city: flight.departure.city,
        time: flight.departure.time,
        terminal: flight.departure.terminal || ''
      },
      arrival: {
        airport: flight.arrival.airport,
        city: flight.arrival.city,
        time: flight.arrival.time,
        terminal: flight.arrival.terminal || ''
      },
      aircraft: flight.aircraft || '',
      duration: flight.duration,
      price: {
        economy: flight.price.economy,
        business: flight.price.business || 0,
        sovTokenDiscount: flight.price.sovTokenDiscount || 10
      },
      availability: {
        economy: flight.availability.economy,
        business: flight.availability.business || 0
      },
      baggage: flight.baggage || { checkedIncluded: 20, handCarryIncluded: 7 },
      amenities: flight.amenities || [''],
      is_active: flight.is_active,
      departure_date: flight.departure_date
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFlight(null);
    setFormData({
      flight_number: '',
      airline: 'Vietjet Air',
      departure: {
        airport: '',
        city: '',
        time: '',
        terminal: ''
      },
      arrival: {
        airport: '',
        city: '',
        time: '',
        terminal: ''
      },
      aircraft: '',
      duration: '',
      price: {
        economy: 0,
        business: 0,
        sovTokenDiscount: 10
      },
      availability: {
        economy: 0,
        business: 0
      },
      baggage: {
        checkedIncluded: 20,
        handCarryIncluded: 7
      },
      amenities: [''],
      is_active: true,
      departure_date: ''
    });
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.departure.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.arrival.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = filterRoute === 'all' || 
                        `${flight.departure.airport}-${flight.arrival.airport}` === filterRoute;
    return matchesSearch && matchesRoute;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const updateAmenity = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((a, i) => i === index ? value : a)
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
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
            <PaperAirplaneIcon className="w-8 h-8 mr-3 text-green-600" />
            Quản lý chuyến bay Vietjet
          </h2>
          <p className="text-gray-600 mt-2">Thêm, sửa, xóa các chuyến bay</p>
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
              placeholder="Tìm kiếm chuyến bay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả tuyến</option>
              <option value="SGN-HAN">SGN - HAN</option>
              <option value="HAN-SGN">HAN - SGN</option>
              <option value="SGN-DAD">SGN - DAD</option>
              <option value="DAD-SGN">DAD - SGN</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm chuyến bay
            </button>
          </div>
        </div>
      </div>

      {/* Flights List */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Flight Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-lg text-gray-900">{flight.flight_number}</span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {flight.airline}
                      </span>
                      {flight.is_active ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(flight)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(flight.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.departure.time}</div>
                        <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                        <div className="text-xs text-gray-500">{flight.departure.city}</div>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <ClockIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <div className="text-sm text-gray-600">{flight.duration}</div>
                          {flight.aircraft && (
                            <div className="text-xs text-gray-500">{flight.aircraft}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{flight.arrival.time}</div>
                        <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                        <div className="text-xs text-gray-500">{flight.arrival.city}</div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Giá vé</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Phổ thông:</span>
                          <span className="font-medium">{formatCurrency(flight.price.economy)}</span>
                        </div>
                        {flight.price.business && (
                          <div className="flex justify-between text-sm">
                            <span>Thương gia:</span>
                            <span className="font-medium">{formatCurrency(flight.price.business)}</span>
                          </div>
                        )}
                        {flight.price.sovTokenDiscount && (
                          <div className="text-xs text-green-600">
                            Giảm {flight.price.sovTokenDiscount}% với SOV Token
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ghế trống</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Phổ thông:</span>
                          <span className="font-medium">{flight.availability.economy}</span>
                        </div>
                        {flight.availability.business && (
                          <div className="flex justify-between text-sm">
                            <span>Thương gia:</span>
                            <span className="font-medium">{flight.availability.business}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ngày khởi hành</h4>
                      <div className="text-sm font-medium">
                        {new Date(flight.departure_date).toLocaleDateString('vi-VN')}
                      </div>
                      {flight.amenities && flight.amenities.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Tiện ích:</div>
                          <div className="text-xs text-gray-700">
                            {flight.amenities.slice(0, 3).join(', ')}
                            {flight.amenities.length > 3 && '...'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFlights.length === 0 && (
        <div className="text-center py-12">
          <PaperAirplaneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có chuyến bay</h3>
          <p className="text-gray-600 mb-4">Chưa có chuyến bay nào khớp với bộ lọc</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Thêm chuyến bay đầu tiên
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
                    {editingFlight ? 'Sửa chuyến bay' : 'Thêm chuyến bay mới'}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số hiệu chuyến bay *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.flight_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, flight_number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VJ123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hãng hàng không
                      </label>
                      <input
                        type="text"
                        value={formData.airline}
                        onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máy bay
                      </label>
                      <input
                        type="text"
                        value={formData.aircraft}
                        onChange={(e) => setFormData(prev => ({ ...prev, aircraft: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="A321"
                      />
                    </div>
                  </div>

                  {/* Departure & Arrival */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Điểm khởi hành</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          placeholder="Mã sân bay (SGN)"
                          value={formData.departure.airport}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            departure: { ...prev.departure, airport: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Thành phố"
                          value={formData.departure.city}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            departure: { ...prev.departure, city: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="time"
                          required
                          value={formData.departure.time}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            departure: { ...prev.departure, time: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Terminal"
                          value={formData.departure.terminal}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            departure: { ...prev.departure, terminal: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Điểm đến</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          placeholder="Mã sân bay (HAN)"
                          value={formData.arrival.airport}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arrival: { ...prev.arrival, airport: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Thành phố"
                          value={formData.arrival.city}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arrival: { ...prev.arrival, city: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="time"
                          required
                          value={formData.arrival.time}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arrival: { ...prev.arrival, time: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Terminal"
                          value={formData.arrival.terminal}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arrival: { ...prev.arrival, terminal: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian bay *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="2h 15m"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày khởi hành *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.departure_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Giá vé</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phổ thông (VND) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price.economy}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, economy: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thương gia (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.price.business}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, business: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giảm giá SOV Token (%)
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

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Số ghế</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phổ thông *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.availability.economy}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, economy: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thương gia
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.availability.business}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, business: Number(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiện ích
                    </label>
                    {formData.amenities.map((amenity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => updateAmenity(index, e.target.value)}
                          placeholder="Nhập tiện ích..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Thêm tiện ích
                    </button>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Kích hoạt chuyến bay
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {editingFlight ? 'Cập nhật' : 'Tạo chuyến bay'}
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
