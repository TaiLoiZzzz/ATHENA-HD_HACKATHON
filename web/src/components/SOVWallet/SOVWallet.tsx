'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  ChartBarIcon,
  GiftIcon,
  CreditCardIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface TokenBalance {
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  netTokens: number;
  blockchainBalance?: string;
}

interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer';
  amount: number;
  description: string;
  serviceType?: string;
  status: string;
  createdAt: string;
}

interface SyncStatus {
  walletAddress: string;
  databaseBalance: number;
  blockchainBalance: string;
  synced: boolean;
}

interface ContractInfo {
  address: string;
  network: string;
  name?: string;
  symbol?: string;
  simulation?: boolean;
}

interface SOVWalletProps {
  className?: string;
  showFullInterface?: boolean;
  onPayment?: (amount: number) => void;
  requiredAmount?: number;
}

export default function SOVWallet({ 
  className = '', 
  showFullInterface = false,
  onPayment,
  requiredAmount = 0
}: SOVWalletProps) {
  const { user, hasAthenaPrime } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(requiredAmount);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    fetchBalance();
    if (showFullInterface) {
      fetchTransactions();
      fetchContractInfo();
    }
  }, [showFullInterface]);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/tokens/balance');
      setBalance(response);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast.error('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/tokens/blockchain-history?limit=10');
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchContractInfo = async () => {
    try {
      const response = await api.get('/tokens/contract-info');
      setContractInfo(response.contract);
    } catch (error) {
      console.error('Failed to fetch contract info:', error);
    }
  };

  const syncWithBlockchain = async () => {
    try {
      const response = await api.post('/tokens/sync-blockchain');
      setSyncStatus(response);
      toast.success('Blockchain sync completed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync with blockchain');
    }
  };

  const handlePayment = () => {
    if (!balance || balance.balance < paymentAmount) {
      toast.error('Insufficient SOV Token balance');
      return;
    }
    
    if (onPayment) {
      onPayment(paymentAmount);
    }
  };

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount * 10000); // 1 SOV ≈ 10,000 VND
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return ArrowUpIcon;
      case 'spend': return ArrowDownIcon;
      case 'transfer': return CurrencyDollarIcon;
      default: return CurrencyDollarIcon;
    }
  };

  if (loading) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('space-y-6', className)}
    >
      {/* Main Wallet Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg text-white overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">SOV Wallet</h3>
                <p className="text-primary-100 text-sm">Unified Payment System</p>
              </div>
            </div>
            {hasAthenaPrime() && (
              <div className="flex items-center space-x-1 bg-token-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                <SparklesIcon className="w-3 h-3" />
                <span>Prime 1.5x</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-primary-100 text-sm mb-1">Available Balance</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold">
                  {formatTokens(balance?.balance || 0)}
                </span>
                <span className="text-lg">SOV</span>
              </div>
              <p className="text-primary-200 text-sm">
                ≈ {formatCurrency(balance?.balance || 0)}
              </p>
              {balance?.balance === 10 && (
                <div className="mt-2 bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-xs font-medium inline-block">
                  🎁 Welcome bonus: 10 SOV
                </div>
              )}
              {balance?.blockchainBalance && (
                <div className="mt-2 p-2 bg-white/10 rounded-lg">
                  <p className="text-primary-100 text-xs">Blockchain Balance</p>
                  <p className="text-white text-sm font-medium">
                    {formatTokens(parseFloat(balance.blockchainBalance))} SOV
                  </p>
                </div>
              )}
            </div>

            {balance?.lockedBalance && balance.lockedBalance > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-primary-100 text-sm">Locked Balance</p>
                <p className="text-white font-medium">
                  {formatTokens(balance.lockedBalance)} SOV
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/10 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-primary-100 text-xs">Total Earned</p>
              <p className="text-white font-semibold">
                +{formatTokens(balance?.totalEarned || 0)}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-xs">Total Spent</p>
              <p className="text-white font-semibold">
                -{formatTokens(balance?.totalSpent || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Interface */}
      {(onPayment || requiredAmount > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCardIcon className="w-6 h-6 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">SOV Payment</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 top-3 text-gray-500 font-medium">
                  SOV
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ≈ {formatCurrency(paymentAmount)}
              </p>
            </div>

            {paymentAmount > (balance?.balance || 0) && (
              <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm">
                  Insufficient balance. Need {formatTokens(paymentAmount - (balance?.balance || 0))} more SOV
                </span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handlePayment}
                disabled={!balance || balance.balance < paymentAmount || paymentAmount <= 0}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay with SOV
              </button>
              <button
                onClick={() => setPaymentAmount(balance?.balance || 0)}
                className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Use All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showFullInterface && (
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-success-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Buy SOV</p>
                <p className="text-sm text-gray-500">Exchange VND</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">History</p>
                <p className="text-sm text-gray-500">Blockchain + Local</p>
              </div>
            </div>
          </button>

          <button
            onClick={syncWithBlockchain}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Sync</p>
                <p className="text-sm text-gray-500">Blockchain sync</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Blockchain Sync Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Address:</span>
              <code className="font-mono text-xs">{syncStatus.walletAddress?.slice(0, 8)}...{syncStatus.walletAddress?.slice(-6)}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database Balance:</span>
              <span className="font-medium">{formatTokens(syncStatus.databaseBalance)} SOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blockchain Balance:</span>
              <span className="font-medium">{formatTokens(parseFloat(syncStatus.blockchainBalance))} SOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${syncStatus.synced ? 'text-green-600' : 'text-yellow-600'}`}>
                {syncStatus.synced ? 'Synced' : 'Out of sync'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Smart Contract Info */}
      {contractInfo && showFullInterface && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
            Smart Contract
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Contract:</span>
              <code className="font-mono text-xs">{contractInfo.address?.slice(0, 8)}...{contractInfo.address?.slice(-6)}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium capitalize">{contractInfo.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className={`font-medium ${contractInfo.simulation ? 'text-yellow-600' : 'text-green-600'}`}>
                {contractInfo.simulation ? 'Simulation' : 'Mainnet'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <AnimatePresence>
        {showTransactions && showFullInterface && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Recent Transactions</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const Icon = getTransactionIcon(tx.type);
                  return (
                    <div key={tx.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          tx.type === 'earn' ? 'bg-success-100' : 'bg-error-100'
                        )}>
                          <Icon className={clsx(
                            'w-5 h-5',
                            tx.type === 'earn' ? 'text-success-600' : 'text-error-600'
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                            {tx.serviceType && ` • ${tx.serviceType}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={clsx(
                            'font-semibold',
                            tx.type === 'earn' ? 'text-success-600' : 'text-error-600'
                          )}>
                            {tx.type === 'earn' ? '+' : '-'}{formatTokens(tx.amount)} SOV
                          </p>
                          <p className="text-sm text-gray-500">
                            {tx.type === 'earn' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">Start using SOV tokens to see your history</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sovico Branding */}
      <div className="bg-gradient-to-r from-token-50 to-primary-50 rounded-xl border border-token-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-token-500 rounded-lg flex items-center justify-center">
            <GiftIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Sovico Ecosystem Benefits</h4>
            <p className="text-sm text-gray-600">
              One token, all services - HDBank, Vietjet, and more!
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-gray-700">Universal payments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-token-500 rounded-full"></div>
            <span className="text-gray-700">Cross-service rewards</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-gray-700">Exclusive discounts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-700">Prime bonuses</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

