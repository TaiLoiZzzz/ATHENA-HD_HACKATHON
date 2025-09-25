'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { mockVietjetFlights } from '@/lib/mockData';

interface FlightTestDataProps {
  onSelectFlight?: (flight: any) => void;
  className?: string;
}

const FlightTestData: React.FC<FlightTestDataProps> = ({ 
  onSelectFlight,
  className = '' 
}) => {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    route: 'all',
    priceRange: 'all',
    date: 'all'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRouteName = (departure: any, arrival: any) => {
    return `${departure.airport.code} → ${arrival.airport.code}`;
  };

  const getPriceRange = (price: number) => {
    if (price < 1500000) return 'budget';
    if (price < 2000000) return 'standard';
    return 'premium';
  };

  const getPriceRangeLabel = (range: string) => {
    const labels = {
      budget: 'Giá rẻ',
      standard: 'Tiêu chuẩn',
      premium: 'Cao cấp'
    };
    return labels[range as keyof typeof labels] || range;
  };

  const getPriceRangeColor = (range: string) => {
    const colors = {
      budget: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return colors[range as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredFlights = mockVietjetFlights.filter(flight => {
    if (filter.route !== 'all') {
      const route = getRouteName(flight.departure, flight.arrival);
      if (!route.toLowerCase().includes(filter.route.toLowerCase())) {
        return false;
      }
    }
    
    if (filter.priceRange !== 'all') {
      const priceRange = getPriceRange(flight.price.base);
      if (priceRange !== filter.priceRange) {
        return false;
      }
    }
    
    return true;
  });

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight.id);
    onSelectFlight?.(flight);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sample Flights for Testing
        </h2>
        <p className="text-gray-600">
          List of VietJet Air flights to test payment system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route
            </label>
            <select
              value={filter.route}
              onChange={(e) => setFilter(prev => ({ ...prev, route: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="sgn-han">SGN → HAN</option>
              <option value="han-sgn">HAN → SGN</option>
              <option value="sgn-dad">SGN → DAD</option>
              <option value="dad-sgn">DAD → SGN</option>
              <option value="sgn-pqc">SGN → PQC</option>
              <option value="han-cxr">HAN → CXR</option>
              <option value="sgn-bkk">SGN → BKK</option>
              <option value="sgn-sin">SGN → SIN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá
            </label>
            <select
              value={filter.priceRange}
              onChange={(e) => setFilter(prev => ({ ...prev, priceRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="budget">Giá rẻ (&lt; 1.5M)</option>
              <option value="standard">Tiêu chuẩn (1.5M - 2M)</option>
              <option value="premium">Cao cấp (&gt; 2M)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={filter.date}
              onChange={(e) => setFilter(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="february">Tháng 2</option>
              <option value="march">Tháng 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight List */}
      <div className="space-y-4">
        {filteredFlights.map((flight, index) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
              selectedFlight === flight.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Flight Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{flight.flightNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">VietJet Air</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceRangeColor(getPriceRange(flight.price.base))}`}>
                      {getPriceRangeLabel(getPriceRange(flight.price.base))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Route */}
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{flight.departure.time}</div>
                        <div className="text-sm text-gray-600">{flight.departure.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.departure.airport.city}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-gray-500">{flight.duration}</div>
                        <div className="w-full h-px bg-gray-300 my-1"></div>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 mx-auto" />
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{flight.arrival.time}</div>
                        <div className="text-sm text-gray-600">{flight.arrival.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.arrival.airport.city}</div>
                      </div>
                    </div>

                    {/* Date & Aircraft */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{formatDate(flight.departure.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{flight.aircraft}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{flight.availableSeats} ghế trống</span>
                      </div>
                    </div>

                    {/* Price & SOV Tokens */}
                    <div className="space-y-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(flight.price.base)}
                        </div>
                        <div className="text-sm text-gray-600">Giá cơ bản</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {flight.sovTokens.standard} SOV
                        </div>
                        <div className="text-xs text-gray-500">
                          ({flight.sovTokens.prime} SOV với Prime)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Tiện ích:</span>
                      {flight.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Hành lý:</span>
                      <span className="text-sm text-gray-700">
                        {flight.baggage.carry} xách tay, {flight.baggage.checked} ký gửi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="ml-6">
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      selectedFlight === flight.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedFlight === flight.id ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Đã chọn</span>
                      </div>
                    ) : (
                      'Chọn chuyến bay'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Hướng dẫn Test
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">Các chuyến bay mẫu:</h4>
            <ul className="space-y-1">
              <li>• <strong>Nội địa:</strong> SGN-HAN, HAN-SGN, SGN-DAD</li>
              <li>• <strong>Quốc tế:</strong> SGN-BKK, SGN-SIN</li>
              <li>• <strong>Đảo:</strong> SGN-PQC, HAN-CXR</li>
              <li>• <strong>Giá đa dạng:</strong> 1.1M - 2.8M VND</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">SOV Tokens:</h4>
            <ul className="space-y-1">
              <li>• <strong>Standard:</strong> 110-280 SOV</li>
              <li>• <strong>Prime:</strong> 165-420 SOV (1.5x bonus)</li>
              <li>• <strong>Diamond:</strong> 220-560 SOV (2x bonus)</li>
              <li>• <strong>Test thanh toán:</strong> Chọn chuyến bay và thanh toán</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTestData;
