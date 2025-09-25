'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import ServiceBonusPreview from '@/components/Ranking/ServiceBonusPreview';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import FlightPayment from '@/components/Flight/FlightPayment';
import FlightBookingPayment from '@/components/Flight/FlightBookingPayment';
import api from '@/lib/api';
import { sovTokenService } from '@/services/sovTokenService';
import {
  PaperAirplaneIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  flightNumber: string;
  airline: string;
  aircraft: string;
  departure: {
    airport: Airport;
    time: string;
    date: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    date: string;
  };
  duration: string;
  price: {
    base: number;
    currency: string;
    breakdown: {
      baseFare: number;
      taxes: number;
      fees: number;
    };
  };
  sovTokens: {
    standard: number;
    prime: number;
  };
  cabin: string;
  availableSeats: number;
  baggage: {
    carry: string;
    checked: string;
  };
  amenities: string[];
  cancellationPolicy: string;
}

interface SearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: string;
}

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

export default function VietjetBooking() {
  const [currentStep, setCurrentStep] = useState<'search' | 'results' | 'details' | 'passengers' | 'payment' | 'confirmation'>('search');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    cabin: 'economy'
  });
  const [searchResults, setSearchResults] = useState<{ flights: Flight[], total: number, searchParams: any }>({ flights: [], total: 0, searchParams: {} });
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'sov_token' | 'fiat' | 'hybrid'>('fiat');
  const [bonusTokenPercentage, setBonusTokenPercentage] = useState<number>(0);
  const [sovTokenAmount, setSovTokenAmount] = useState<number>(0);
  const [fiatAmount, setFiatAmount] = useState<number>(0);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    emergencyContact: '',
    specialRequests: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    loadAirports();
    initializePassengers();
  }, [searchParams.passengers]);

  // Update SOV token amount when flight is selected
  useEffect(() => {
    if (selectedOutbound) {
      // Calculate SOV token amount based on flight price
      // For demo purposes, use 1 SOV = 10,000 VND
      const tokenAmount = Math.ceil(selectedOutbound.price.base / 10000);
      setSovTokenAmount(tokenAmount);
    }
  }, [selectedOutbound]);

  const loadAirports = async () => {
    try {
      const response = await api.getAirports();
      setAirports(response.airports || []);
    } catch (error: any) {
      toast.error('Failed to load airports');
      setAirports([]);
    }
  };

  const initializePassengers = () => {
    const newPassengers = Array(searchParams.passengers).fill(null).map((_, index) => ({
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'VN',
      passportNumber: '',
      passportExpiry: ''
    }));
    setPassengers(newPassengers);
  };

  const searchFlights = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      toast.error('Please fill all required search fields');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: searchParams.from,
        to: searchParams.to,
        departDate: searchParams.departDate,
        passengers: searchParams.passengers.toString(),
        cabin: searchParams.cabin
      });

      if (searchParams.returnDate) {
        params.append('returnDate', searchParams.returnDate);
      }

      const response = await api.searchVietjetFlights(searchParams);
      setSearchResults(response);
      setCurrentStep('results');
      toast.success(`Found ${response.flights.length} flights`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to search flights');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFlight = (flight: Flight, type: 'outbound' | 'return') => {
    if (type === 'outbound') {
      setSelectedOutbound(flight);
      // For one-way trips, go directly to details after selecting outbound
      if (!searchParams.returnDate) {
        setCurrentStep('details');
      }
    } else {
      setSelectedReturn(flight);
      // For round trips, go to details after selecting return flight
      setCurrentStep('details');
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    if (selectedOutbound) total += selectedOutbound.price.base;
    if (selectedReturn) total += selectedReturn.price.base;
    return total;
  };

  const calculateTotalTokens = (isPrime: boolean = false) => {
    let tokens = 0;
    if (selectedOutbound) {
      tokens += isPrime ? selectedOutbound.sovTokens.prime : selectedOutbound.sovTokens.standard;
    }
    if (selectedReturn) {
      tokens += isPrime ? selectedReturn.sovTokens.prime : selectedReturn.sovTokens.standard;
    }
    
    // Apply bonus percentage
    const bonusTokens = Math.floor(tokens * (bonusTokenPercentage / 100));
    return tokens + bonusTokens;
  };

  const proceedToPassengers = () => {
    setCurrentStep('passengers');
  };

  const proceedToPayment = () => {
    // Validate passenger information
    const isValid = passengers.every(p => 
      p.firstName && p.lastName && p.dateOfBirth && p.passportNumber && p.passportExpiry
    );

    if (!isValid) {
      toast.error('Please complete all passenger information');
      return;
    }

    if (!contactInfo.email || !contactInfo.phone) {
      toast.error('Please provide contact information');
      return;
    }

    setCurrentStep('payment');
  };


  const getBonusTokenOptions = () => [
    { value: 0, label: 'No Bonus', description: 'Standard token earning' },
    { value: 25, label: '25% Bonus', description: '+25% more tokens earned', cost: Math.floor(calculateTotalPrice() * 0.05) },
    { value: 50, label: '50% Bonus', description: '+50% more tokens earned', cost: Math.floor(calculateTotalPrice() * 0.1) },
    { value: 100, label: '100% Bonus', description: 'Double tokens earned!', cost: Math.floor(calculateTotalPrice() * 0.2) }
  ];

  const renderSearchForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <PaperAirplaneIcon className="h-8 w-8 text-blue-600 mr-3" />
        Search Flights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* From Airport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <select
            value={searchParams.from}
            onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select departure city</option>
            {(airports || []).map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
        </div>

        {/* To Airport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select
            value={searchParams.to}
            onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select destination city</option>
            {(airports || []).map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
          <input
            type="date"
            value={searchParams.departDate}
            onChange={(e) => setSearchParams({...searchParams, departDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Return (Optional)</label>
          <input
            type="date"
            value={searchParams.returnDate}
            onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
            min={searchParams.departDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSearchParams({...searchParams, passengers: Math.max(1, searchParams.passengers - 1)})}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={searchParams.passengers <= 1}
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 text-lg font-medium">{searchParams.passengers}</span>
            <button
              onClick={() => setSearchParams({...searchParams, passengers: Math.min(9, searchParams.passengers + 1)})}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={searchParams.passengers >= 9}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cabin Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
          <select
            value={searchParams.cabin}
            onChange={(e) => setSearchParams({...searchParams, cabin: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <button
        onClick={searchFlights}
        disabled={isLoading || !searchParams.from || !searchParams.to || !searchParams.departDate}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Search Flights</span>
          </>
        )}
      </button>
    </div>
  );

  const renderFlightCard = (flight: Flight, type: 'outbound' | 'return') => {
    const isSelected = (type === 'outbound' && selectedOutbound?.flightNumber === flight.flightNumber) ||
                      (type === 'return' && selectedReturn?.flightNumber === flight.flightNumber);
    
    return (
      <motion.div
        key={flight.flightNumber}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-transparent hover:border-blue-200'
        }`}
        onClick={() => selectFlight(flight, type)}
      >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900">{flight.flightNumber}</h3>
            {isSelected && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Selected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{flight.airline} • {flight.aircraft}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{flight.price.base.toLocaleString()} VND</p>
          <p className="text-sm text-gray-600">per person</p>
          
          {/* Rank Bonus Preview */}
          <div className="mt-2">
            <ServiceBonusPreview 
              serviceType="vietjet"
              category="flights"
              amount={flight.price.base}
              compact={true}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{flight.departure.time}</p>
          <p className="text-sm text-gray-600">{flight.departure.airport.code}</p>
          <p className="text-xs text-gray-500">{flight.departure.airport.city}</p>
        </div>
        
        <div className="flex-1 mx-6">
          <div className="flex items-center justify-center">
            <div className="border-t-2 border-gray-300 flex-1"></div>
            <div className="mx-3 text-center">
              <PaperAirplaneIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">{flight.duration}</p>
            </div>
            <div className="border-t-2 border-gray-300 flex-1"></div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{flight.arrival.time}</p>
          <p className="text-sm text-gray-600">{flight.arrival.airport.code}</p>
          <p className="text-xs text-gray-500">{flight.arrival.airport.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Baggage:</span> {flight.baggage.carry} + {flight.baggage.checked}
        </div>
        <div>
          <span className="font-medium">Seats:</span> {flight.availableSeats} available
        </div>
        <div>
          <span className="font-medium">Class:</span> {flight.cabin}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">SOV Tokens Earned</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">{flight.sovTokens.standard} tokens</p>
            <p className="text-xs text-gray-600">({flight.sovTokens.prime} for ATHENA Prime)</p>
          </div>
        </div>
      </div>

      {/* Select Button */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isSelected
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            selectFlight(flight, type);
          }}
        >
          {isSelected ? 'Selected ✓' : 'Select Flight'}
        </button>
      </div>
    </motion.div>
    );
  };

  const renderPassengerForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Information</h2>
      
      {passengers.map((passenger, index) => (
        <div key={index} className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Passenger {index + 1} {index === 0 && "(Lead Passenger)"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <select
                value={passenger.title}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].title = e.target.value;
                  setPassengers(newPassengers);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].firstName = e.target.value;
                  setPassengers(newPassengers);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].lastName = e.target.value;
                  setPassengers(newPassengers);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                value={passenger.dateOfBirth}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].dateOfBirth = e.target.value;
                  setPassengers(newPassengers);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number *</label>
              <input
                type="text"
                value={passenger.passportNumber}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].passportNumber = e.target.value;
                  setPassengers(newPassengers);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport Expiry *</label>
              <input
                type="date"
                value={passenger.passportExpiry}
                onChange={(e) => {
                  const newPassengers = [...passengers];
                  newPassengers[index].passportExpiry = e.target.value;
                  setPassengers(newPassengers);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      ))}

      {/* Contact Information */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <input
              type="tel"
              value={contactInfo.emergencyContact}
              onChange={(e) => setContactInfo({...contactInfo, emergencyContact: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
            <textarea
              value={contactInfo.specialRequests}
              onChange={(e) => setContactInfo({...contactInfo, specialRequests: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Wheelchair assistance, dietary requirements, etc."
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mt-8">
        <button
          onClick={() => setCurrentStep('details')}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Back to Flight Details
        </button>
        <button
          onClick={proceedToPayment}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">VietJet Air Booking</h1>
                <p className="mt-2 text-blue-100">Book your flight and earn SOV tokens</p>
              </div>
              <div className="hidden lg:block">
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                >
                  View SOV Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {currentStep === 'search' && renderSearchForm()}
              
              {currentStep === 'results' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Flights</h2>
                    <p className="text-gray-600">
                      {searchParams.from} → {searchParams.to} on {searchParams.departDate}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-medium text-gray-900">Outbound Flights</h3>
                    
                    {/* Bonus Display */}
                    <InlineBonusDisplay
                      serviceType="vietjet"
                      amount={searchResults.flights[0]?.price.base || 0}
                      category="flights"
                      position="top"
                      size="medium"
                    />
                    
                    {searchResults.flights.map(flight => renderFlightCard(flight, 'outbound'))}
                  </div>

                  {/* Selection Status */}
                  {selectedOutbound && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">Flight Selected!</h4>
                          <p className="text-sm text-green-700">
                            {selectedOutbound.airline} {selectedOutbound.flightNumber} - {selectedOutbound.departure.airport.code} to {selectedOutbound.arrival.airport.code}
                          </p>
                          <p className="text-sm text-green-600">
                            {selectedOutbound.price.base.toLocaleString()} VND • {selectedOutbound.sovTokens.standard} SOV tokens
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  {selectedOutbound && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Selected Flight</h3>
                          <p className="text-sm text-gray-600">
                            {selectedOutbound.airline} {selectedOutbound.flightNumber} - {selectedOutbound.departure.airport.code} to {selectedOutbound.arrival.airport.code}
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            {selectedOutbound.price.base.toLocaleString()} VND • {selectedOutbound.sovTokens.standard} SOV tokens
                          </p>
                        </div>
                        <button
                          onClick={() => setCurrentStep('details')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span>Continue to Details</span>
                          <ArrowRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'details' && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Flight Details</h2>
                  
                  {selectedOutbound && (
                    <div className="space-y-6">
                      {/* Flight Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Flight</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Departure</h4>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-900">{selectedOutbound.departure.time}</p>
                              <p className="text-lg font-medium text-gray-700">{selectedOutbound.departure.airport.code}</p>
                              <p className="text-sm text-gray-600">{selectedOutbound.departure.airport.city}</p>
                              <p className="text-sm text-gray-500">{selectedOutbound.departure.date}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Arrival</h4>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-900">{selectedOutbound.arrival.time}</p>
                              <p className="text-lg font-medium text-gray-700">{selectedOutbound.arrival.airport.code}</p>
                              <p className="text-sm text-gray-600">{selectedOutbound.arrival.airport.city}</p>
                              <p className="text-sm text-gray-500">{selectedOutbound.arrival.date}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Flight Duration</p>
                              <p className="font-medium">{selectedOutbound.duration}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Aircraft</p>
                              <p className="font-medium">{selectedOutbound.aircraft}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Cabin Class</p>
                              <p className="font-medium capitalize">{selectedOutbound.cabin}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Information */}
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Tokens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Price Breakdown</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Base Fare:</span>
                                <span className="font-medium">{selectedOutbound.price.breakdown.baseFare.toLocaleString()} VND</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Taxes:</span>
                                <span className="font-medium">{selectedOutbound.price.breakdown.taxes.toLocaleString()} VND</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fees:</span>
                                <span className="font-medium">{selectedOutbound.price.breakdown.fees.toLocaleString()} VND</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-900">Total:</span>
                                <span className="font-bold text-blue-600">{selectedOutbound.price.base.toLocaleString()} VND</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">SOV Tokens Earned</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Standard:</span>
                                <span className="font-medium text-purple-600">{selectedOutbound.sovTokens.standard} SOV</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">ATHENA Prime:</span>
                                <span className="font-medium text-purple-600">{selectedOutbound.sovTokens.prime} SOV</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Baggage & Amenities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Baggage Allowance</h4>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Carry-on: {selectedOutbound.baggage.carry}</p>
                            <p className="text-sm text-gray-600">Checked: {selectedOutbound.baggage.checked}</p>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOutbound.amenities.map((amenity, index) => (
                              <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentStep('results')}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span>Back to Flights</span>
                    </button>
                    <button
                      onClick={proceedToPassengers}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Continue to Passenger Info</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'passengers' && renderPassengerForm()}
              {currentStep === 'payment' && (
                <FlightBookingPayment
                  selectedOutbound={selectedOutbound}
                  selectedReturn={selectedReturn}
                  passengers={passengers}
                  bonusTokenPercentage={bonusTokenPercentage}
                  setBonusTokenPercentage={setBonusTokenPercentage}
                  calculateTotalPrice={calculateTotalPrice}
                  calculateTotalTokens={calculateTotalTokens}
                  sovTokenAmount={sovTokenAmount}
                  setCurrentStep={(step: any) => setCurrentStep(step)}
                  onBookingSuccess={() => setCurrentStep('confirmation')}
                />
              )}

              {currentStep === 'confirmation' && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="text-center mb-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                      Your flight has been successfully booked. You will receive a confirmation email shortly.
                    </p>
                  </div>

                  {/* Booking Summary */}
                  {selectedOutbound && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Flight Details</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Flight:</span> {selectedOutbound.airline} {selectedOutbound.flightNumber}</p>
                            <p><span className="text-gray-600">Route:</span> {selectedOutbound.departure.airport.code} → {selectedOutbound.arrival.airport.code}</p>
                            <p><span className="text-gray-600">Date:</span> {selectedOutbound.departure.date}</p>
                            <p><span className="text-gray-600">Time:</span> {selectedOutbound.departure.time} - {selectedOutbound.arrival.time}</p>
                            <p><span className="text-gray-600">Duration:</span> {selectedOutbound.duration}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Passenger & Payment</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Passengers:</span> {passengers.length}</p>
                            <p><span className="text-gray-600">Total Price:</span> {selectedOutbound.price.base.toLocaleString()} VND</p>
                            <p><span className="text-gray-600">SOV Tokens Used:</span> {sovTokenAmount}</p>
                            <p><span className="text-gray-600">SOV Tokens Earned:</span> {selectedOutbound.sovTokens.standard}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentStep('search')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Book Another Flight
                    </button>
                    <button
                      onClick={() => window.location.href = '/transactions'}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      View Transaction History
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80">
              {showWallet && (
                <div className="mb-6">
                  <SOVWallet />
                </div>
              )}
              
              {/* Progress Steps */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Progress</h3>
                <div className="space-y-3">
                  {[
                    { key: 'search', label: 'Search Flights' },
                    { key: 'results', label: 'Select Flights' },
                    { key: 'details', label: 'Flight Details' },
                    { key: 'passengers', label: 'Passenger Info' },
                    { key: 'payment', label: 'Payment' },
                    { key: 'confirmation', label: 'Confirmation' }
                  ].map((step, index) => (
                    <div key={step.key} className={`flex items-center space-x-3 ${
                      currentStep === step.key ? 'text-blue-600' : 
                      ['search', 'results', 'details', 'passengers', 'payment'].indexOf(currentStep) > index ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.key ? 'bg-blue-100 text-blue-600' :
                        ['search', 'results', 'details', 'passengers', 'payment'].indexOf(currentStep) > index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {['search', 'results', 'details', 'passengers', 'payment'].indexOf(currentStep) > index ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}