'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout/Layout';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import { safeGet, safeFormatCurrency, safeFormatPercentage, safeFormatRange, safeStringUpper } from '@/utils/safeDisplay';

interface LoanProduct {
  id: string;
  type: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRates: {
    standard: { annual: number; sovToken: number };
    prime: { annual: number; sovToken: number };
    vip: { annual: number; sovToken: number };
  };
  terms: number[];
  processingFee: {
    fiat: number;
    sovToken: number;
  };
  features: string[];
  userTier: string;
  applicableRates: { annual: number; sovToken: number };
}

interface UserServices {
  loans: any[];
  creditCards: any[];
  insurance: any[];
  investments: any[];
  summary: {
    totalServices: number;
    activeLoans: number;
    activeCreditCards: number;
    activeInsurance: number;
    activeInvestments: number;
  };
}

export default function HDBankPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'my-services'>('products');
  const [serviceType, setServiceType] = useState<'loans' | 'cards' | 'insurance' | 'investments'>('loans');
  const [products, setProducts] = useState<any[]>([]);
  const [userServices, setUserServices] = useState<UserServices | null>(null);
  const [loading, setLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>({});

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchUserServices();
    }
  }, [activeTab, serviceType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;
      switch (serviceType) {
        case 'loans':
          response = await api.getHDBankLoans();
          break;
        case 'cards':
          response = await api.getHDBankCreditCards();
          break;
        case 'investments':
          response = await api.getHDBankInvestments();
          break;
        default:
          response = await api.getHDBankLoans();
      }
      
      setProducts(response.products || []);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserServices = async () => {
    setLoading(true);
    try {
      // Mock user services data
      const mockUserServices = {
        loans: [
          {
            id: 'loan_001',
            loan_type: 'personal',
            amount: 50000000,
            term_months: 24,
            interest_rate: 10.5,
            monthly_payment: 2300000,
            purpose: 'Home renovation',
            status: 'approved'
          }
        ],
        creditCards: [],
        insurance: [],
        investments: [
          {
            id: 'inv_001',
            product_type: 'mutual_fund',
            amount: 10000000,
            current_value: 10500000,
            expected_return: 500000,
            risk_level: 'medium',
            status: 'active'
          }
        ],
        summary: {
          totalServices: 2,
          activeLoans: 1,
          activeCreditCards: 0,
          activeInsurance: 0,
          activeInvestments: 1
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUserServices(mockUserServices);
    } catch (error: any) {
      console.error('Failed to load services:', error);
      setUserServices(null);
    } finally {
      setLoading(false);
    }
  };

  const applyForProduct = async () => {
    if (!selectedProduct) return;

    try {
      let endpoint = '';
      let data = { ...applicationData };

      switch (serviceType) {
        case 'loans':
          endpoint = '/hdbank/loans/apply';
          data = {
            loanType: selectedProduct.type,
            amount: parseFloat(applicationData.amount || '0'),
            term: parseInt(applicationData.term || '12'),
            purpose: applicationData.purpose || 'Personal use',
            monthlyIncome: parseFloat(applicationData.monthlyIncome || '0'),
            employmentType: applicationData.employmentType || 'employee',
            documents: [],
            paymentMethod: applicationData.paymentMethod || 'sov_token',
            paymentDetails: {
              sovTokenAmount: applicationData.paymentMethod === 'sov_token' ? selectedProduct.processingFee.sovToken : 0,
              fiatAmount: applicationData.paymentMethod === 'fiat' ? selectedProduct.processingFee.fiat : 0
            }
          };
          break;
        
        case 'cards':
          endpoint = '/hdbank/credit-cards/apply';
          data = {
            cardType: selectedProduct.type,
            annualIncome: parseFloat(applicationData.annualIncome || '0'),
            employmentInfo: {
              company: applicationData.company || 'Demo Company',
              position: applicationData.position || 'Employee',
              workingYears: parseInt(applicationData.workingYears || '1')
            },
            requestedLimit: parseFloat(applicationData.requestedLimit || selectedProduct.creditLimit.min.toString()),
            paymentMethod: applicationData.paymentMethod || 'sov_token',
            applicationFee: selectedProduct.annualFee[applicationData.paymentMethod || 'fiat']
          };
          break;

        case 'investments':
          endpoint = '/hdbank/investments';
          data = {
            productType: selectedProduct.type,
            amount: parseFloat(applicationData.amount || '0'),
            riskLevel: selectedProduct.riskLevel,
            duration: parseInt(applicationData.duration || '12'),
            paymentMethod: applicationData.paymentMethod || 'sov_token',
            autoReinvest: applicationData.autoReinvest || false,
            paymentDetails: {
              sovTokenAmount: applicationData.paymentMethod === 'sov_token' ? parseFloat(applicationData.amount || '0') : 0,
              fiatAmount: applicationData.paymentMethod === 'fiat' ? parseFloat(applicationData.amount || '0') : 0
            }
          };
          break;
      }

      await api.post(endpoint, data);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationData({});
      setSelectedProduct(null);
      
      if (activeTab === 'my-services') {
        fetchUserServices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const formatCurrency = (amount: number, currency: 'VND' | 'USD' | 'SOV' = 'VND') => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    } else {
      return `${amount.toLocaleString()} SOV`;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'loans': return BanknotesIcon;
      case 'cards': return CreditCardIcon;
      case 'insurance': return ShieldCheckIcon;
      case 'investments': return ChartBarIcon;
      default: return BanknotesIcon;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BanknotesIcon className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">HDBank Services</h1>
          </div>
          <p className="text-gray-600">Comprehensive banking and financial services with SOV token integration</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Browse Products
            </button>
            <button
              onClick={() => setActiveTab('my-services')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'my-services'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              My Services
            </button>
          </div>
        </motion.div>

        {activeTab === 'products' && (
          <>
            {/* Service Type Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'loans', name: 'Loans', icon: BanknotesIcon },
                  { type: 'cards', name: 'Credit Cards', icon: CreditCardIcon },
                  { type: 'insurance', name: 'Insurance', icon: ShieldCheckIcon },
                  { type: 'investments', name: 'Investments', icon: ChartBarIcon }
                ].map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.type}
                      onClick={() => setServiceType(service.type as any)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        serviceType === service.type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">{service.name}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                products?.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                      {product.userTier === 'prime' && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          Prime
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{product.description}</p>

                    {/* Product Details */}
                    <div className="space-y-3 mb-6">
                      {serviceType === 'loans' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Amount Range:</span>
                            <span className="font-medium">
                              {product.minAmount ? formatCurrency(product.minAmount) : 'N/A'} - {product.maxAmount ? formatCurrency(product.maxAmount) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Interest Rate:</span>
                            <span className="font-medium text-green-600">
                              {product.applicableRates?.annual || 'N/A'}% (Fiat) / {product.applicableRates?.sovToken || 'N/A'}% (SOV)
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Processing Fee:</span>
                            <span className="font-medium">
                              {product.processingFee ? formatCurrency(product.processingFee.fiat) : 'N/A'} / {product.processingFee ? formatCurrency(product.processingFee.sovToken, 'SOV') : 'N/A'}
                            </span>
                          </div>
                        </>
                      )}

                      {serviceType === 'cards' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Annual Fee:</span>
                            <span className="font-medium">
                              {product.annualFee ? `${formatCurrency(product.annualFee.fiat)} / ${formatCurrency(product.annualFee.sovToken, 'SOV')}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Credit Limit:</span>
                            <span className="font-medium">
                              {product.creditLimit ? `${formatCurrency(product.creditLimit.min)} - ${formatCurrency(product.creditLimit.max)}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cashback:</span>
                            <span className="font-medium text-green-600">
                              {product.applicableCashback}% + {product.applicableRewards} SOV per 100k VND
                            </span>
                          </div>
                        </>
                      )}

                      {serviceType === 'investments' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min Investment:</span>
                            <span className="font-medium">
                              {formatCurrency(product.minInvestment)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expected Return:</span>
                            <span className="font-medium text-green-600">
                              {product.expectedReturns ? `${product.expectedReturns.low}% - ${product.expectedReturns.high}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                          <span className={`font-medium ${
                            product.riskLevel === 'low' ? 'text-green-600' :
                            product.riskLevel === 'medium' ? 'text-yellow-600' : 
                            product.riskLevel === 'high' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {product.riskLevel ? product.riskLevel.toUpperCase() : 'N/A'}
                          </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {product.features?.slice(0, 3).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowApplicationModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                    >
                      Apply Now
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          </>
        )}

        {activeTab === 'my-services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : userServices ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Services</p>
                        <p className="text-2xl font-bold text-gray-900">{userServices.summary.totalServices}</p>
                      </div>
                      <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Loans</p>
                        <p className="text-2xl font-bold text-gray-900">{userServices.summary.activeLoans}</p>
                      </div>
                      <BanknotesIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Credit Cards</p>
                        <p className="text-2xl font-bold text-gray-900">{userServices.summary.activeCreditCards}</p>
                      </div>
                      <CreditCardIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Investments</p>
                        <p className="text-2xl font-bold text-gray-900">{userServices.summary.activeInvestments}</p>
                      </div>
                      <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div className="space-y-6">
                  {userServices.loans.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">My Loans</h3>
                      <div className="space-y-4">
                        {userServices.loans.map((loan) => (
                          <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 capitalize">{loan.loan_type} Loan</h4>
                                <p className="text-sm text-gray-600">{loan.purpose}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                                loan.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {loan.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Amount:</span> {formatCurrency(loan.amount)}
                              </div>
                              <div>
                                <span className="font-medium">Term:</span> {loan.term_months} months
                              </div>
                              <div>
                                <span className="font-medium">Interest:</span> {loan.interest_rate}%
                              </div>
                              <div>
                                <span className="font-medium">Monthly:</span> {formatCurrency(loan.monthly_payment)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userServices.investments.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">My Investments</h3>
                      <div className="space-y-4">
                        {userServices.investments.map((investment) => (
                          <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 capitalize">
                                  {investment.product_type.replace('_', ' ')}
                                </h4>
                                <p className="text-sm text-gray-600">Risk Level: {investment.risk_level}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {investment.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Invested:</span> {formatCurrency(investment.amount)}
                              </div>
                              <div>
                                <span className="font-medium">Current Value:</span> {formatCurrency(investment.current_value)}
                              </div>
                              <div>
                                <span className="font-medium">Expected Return:</span> {formatCurrency(investment.expected_return)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                <p className="text-gray-600 mb-6">Start by applying for your first HDBank service</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                >
                  Browse Products
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Apply for {selectedProduct.name}
            </h3>

            <div className="space-y-4">
              {serviceType === 'loans' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                      <input
                        type="number"
                        value={applicationData.amount || ''}
                        onChange={(e) => setApplicationData({ ...applicationData, amount: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Min: ${formatCurrency(selectedProduct.minAmount)}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Term (months)</label>
                      <select
                        value={applicationData.term || ''}
                        onChange={(e) => setApplicationData({ ...applicationData, term: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {selectedProduct.terms.map((term: number) => (
                          <option key={term} value={term}>{term} months</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
                    <input
                      type="number"
                      value={applicationData.monthlyIncome || ''}
                      onChange={(e) => setApplicationData({ ...applicationData, monthlyIncome: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your monthly income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <input
                      type="text"
                      value={applicationData.purpose || ''}
                      onChange={(e) => setApplicationData({ ...applicationData, purpose: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Loan purpose"
                    />
                  </div>
                </>
              )}

              {serviceType === 'investments' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount</label>
                      <input
                        type="number"
                        value={applicationData.amount || ''}
                        onChange={(e) => setApplicationData({ ...applicationData, amount: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Min: ${formatCurrency(selectedProduct.minInvestment)}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                      <select
                        value={applicationData.duration || '12'}
                        onChange={(e) => setApplicationData({ ...applicationData, duration: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applicationData.autoReinvest || false}
                        onChange={(e) => setApplicationData({ ...applicationData, autoReinvest: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Auto-reinvest returns</span>
                    </label>
                  </div>
                </>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="sov_token"
                      checked={applicationData.paymentMethod === 'sov_token'}
                      onChange={(e) => setApplicationData({ ...applicationData, paymentMethod: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Pay with SOV Tokens</span>
                      <p className="text-sm text-gray-600">Get better rates and bonus rewards</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="fiat"
                      checked={applicationData.paymentMethod === 'fiat'}
                      onChange={(e) => setApplicationData({ ...applicationData, paymentMethod: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Pay with Fiat Currency</span>
                      <p className="text-sm text-gray-600">Traditional payment method</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyForProduct}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
              >
                Submit Application
              </button>
            </div>
          </motion.div>
        </div>
      )}
        
        {/* Right Sidebar - SOV Wallet */}
        <div className="lg:col-span-1">
          <SOVWallet 
            showFullInterface={true}
            onPayment={(amount) => {
              if (selectedProduct) {
                setApplicationData({ ...applicationData, paymentMethod: 'sov_token' });
                toast.success(`Payment method set to SOV tokens: ${amount} SOV`);
              }
            }}
            requiredAmount={selectedProduct?.processingFee || selectedProduct?.annualFee || 0}
          />
        </div>
      </div>
    </Layout>
  );
}

