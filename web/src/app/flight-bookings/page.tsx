'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface FlightBooking {
  id: string;
  flightDetails: {
    flightNumber: string;
    airline: string;
    departure: {
      airport: { code: string; city: string };
      time: string;
      date: string;
    };
    arrival: {
      airport: { code: string; city: string };
      time: string;
      date: string;
    };
    duration: string;
    price: { base: number };
    sovTokens: { standard: number; prime: number };
  };
  passengers: any[];
  totalPrice: number;
  sovTokensUsed: number;
  sovTokensEarned: number;
  bookingDate: string;
  status: string;
  paymentMethod: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export default function FlightBookings() {
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<FlightBooking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      const storedBookings = localStorage.getItem('flight_bookings');
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookingCard = (booking: FlightBooking) => (
    <motion.div
      key={booking.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => setSelectedBooking(booking)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.flightDetails.airline} {booking.flightDetails.flightNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {booking.flightDetails.departure.airport.code} → {booking.flightDetails.arrival.airport.code}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(booking.bookingDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{booking.flightDetails.departure.date}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{booking.flightDetails.duration}</span>
        </div>
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{booking.passengers.length} passenger(s)</span>
        </div>
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatCurrency(booking.totalPrice)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <SparklesIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Used: {booking.sovTokensUsed} SOV</span>
          </div>
          <div className="flex items-center space-x-1">
            <SparklesIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Earned: {booking.sovTokensEarned} SOV</span>
          </div>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );

  const renderBookingDetail = (booking: FlightBooking) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
        <button
          onClick={() => setSelectedBooking(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Flight Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Departure</h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{booking.flightDetails.departure.time}</p>
              <p className="text-lg font-medium text-gray-700">{booking.flightDetails.departure.airport.code}</p>
              <p className="text-sm text-gray-600">{booking.flightDetails.departure.airport.city}</p>
              <p className="text-sm text-gray-500">{booking.flightDetails.departure.date}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Arrival</h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{booking.flightDetails.arrival.time}</p>
              <p className="text-lg font-medium text-gray-700">{booking.flightDetails.arrival.airport.code}</p>
              <p className="text-sm text-gray-600">{booking.flightDetails.arrival.airport.city}</p>
              <p className="text-sm text-gray-500">{booking.flightDetails.arrival.date}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Flight Duration</p>
              <p className="font-medium">{booking.flightDetails.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Flight Number</p>
              <p className="font-medium">{booking.flightDetails.flightNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Airline</p>
              <p className="font-medium">{booking.flightDetails.airline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Passengers</h3>
        <div className="space-y-3">
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="flex items-center space-x-3">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Passport: {passenger.passportNumber} • DOB: {passenger.dateOfBirth}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-green-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-medium">{formatCurrency(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{booking.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">SOV Tokens</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens Used:</span>
                <span className="font-medium text-red-600">-{booking.sovTokensUsed} SOV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens Earned:</span>
                <span className="font-medium text-green-600">+{booking.sovTokensEarned} SOV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Booking Confirmed</p>
              <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Booked on</p>
            <p className="font-medium">{formatDate(booking.bookingDate)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Flight Bookings</h1>
                <p className="mt-2 text-blue-100">View your flight booking history</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-sm text-blue-100">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bonus Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <InlineBonusDisplay
            serviceType="flight-bookings"
            amount={600000}
            category="bookings"
            position="top"
            size="large"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedBooking ? (
            renderBookingDetail(selectedBooking)
          ) : (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <PaperAirplaneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-6">You haven't made any flight bookings yet.</p>
                  <button
                    onClick={() => window.location.href = '/vietjet'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Book a Flight
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                    <button
                      onClick={() => window.location.href = '/vietjet'}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Book Another Flight
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {bookings.map(renderBookingCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
