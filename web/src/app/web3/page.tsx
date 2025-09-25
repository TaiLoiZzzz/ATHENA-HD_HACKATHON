'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WalletIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LinkIcon,
  DocumentTextIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout/Layout';

interface Web3Profile {
  wallet_address: string;
  wallet_type: string;
  reputation_score: number;
  governance_power: number;
  total_staked: number;
  token_balance: number;
  nft_count: number;
  completed_trades: number;
  staking_history: StakingRecord[];
  nft_collections: NFT[];
}

interface StakingRecord {
  amount: number;
  duration_days: number;
  apy_rate: number;
  start_date: string;
  end_date: string;
  status: string;
  rewards_earned: number;
}

interface NFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  attributes: any;
  rarity_score: number;
}

interface BlockchainTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  vnd_amount?: number;
  service_type?: string;
  wallet_address: string;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
  status: string;
  error_message?: string;
  metadata?: any;
  confirmations: number;
  created_at: string;
}

interface ContractInfo {
  address: string;
  network: string;
  simulation: boolean;
  features: string[];
}

export default function Web3Page() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Web3Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('');
  const [stakingDuration, setStakingDuration] = useState(30);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [blockchainTransactions, setBlockchainTransactions] = useState<BlockchainTransaction[]>([]);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [walletBalance, setWalletBalance] = useState<any>(null);

  useEffect(() => {
    fetchWeb3Profile();
    fetchContractInfo();
  }, []);

  const fetchWeb3Profile = async () => {
    try {
      const response = await api.getWeb3Profile();
      setProfile(response.profile);
      
      // Fetch additional Web3 data if wallet is connected
      if (response.profile?.wallet_address) {
        const walletAddress = response.profile.wallet_address;
        await Promise.all([
          fetchBlockchainTransactions(),
          fetchWalletBalance(walletAddress)
        ]);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load Web3 profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainTransactions = async () => {
    try {
      const response = await api.getWeb3Transactions();
      setBlockchainTransactions(response.transactions || []);
    } catch (error: any) {
      console.error('Failed to load blockchain transactions:', error);
    }
  };

  const fetchContractInfo = async () => {
    try {
      const response = await api.getWeb3ContractInfo();
      setContractInfo(response.contract);
    } catch (error: any) {
      console.error('Failed to load contract info:', error);
    }
  };

  const fetchWalletBalance = async (walletAddress: string) => {
    try {
      const response = await api.getWeb3WalletBalance(walletAddress);
      setWalletBalance(response.balance);
    } catch (error: any) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      toast.error('Please install MetaMask to connect your wallet');
      return;
    }

    setConnectingWallet(true);
    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      // Connect wallet via API
      const response = await api.post('/web3/wallet/connect', {
        walletAddress,
        walletType: 'metamask'
      });

      toast.success('Wallet connected successfully!');
      fetchWeb3Profile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnectingWallet(false);
    }
  };

  const stakeTokens = async () => {
    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      toast.error('Please enter a valid staking amount');
      return;
    }

    try {
      await api.post('/web3/stake', {
        amount: parseFloat(stakingAmount),
        duration: stakingDuration
      });

      toast.success('Tokens staked successfully!');
      setShowStakeModal(false);
      setStakingAmount('');
      fetchWeb3Profile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake tokens');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTransactionType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'earn_tokens': 'Token Earning',
      'redeem_tokens': 'Token Redemption',
      'marketplace_buy_order': 'Buy Order',
      'marketplace_sell_order': 'Sell Order',
      'stake': 'Token Staking',
      'unstake': 'Token Unstaking'
    };
    return typeMap[type] || type;
  };

  const getAPYRate = (duration: number) => {
    const rates: { [key: number]: number } = {
      30: 5.0,
      90: 8.0,
      180: 12.0,
      365: 18.0
    };
    return rates[duration] || 5.0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <WalletIcon className="h-24 w-24 text-purple-600 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Sovico Web3 Ecosystem
                </h1>
                <p className="text-gray-600 mb-8">
                  Connect your wallet to access advanced Web3 features including smart contract interactions, 
                  blockchain transactions, token staking, governance, NFTs, and DeFi services.
                </p>
                <button
                  onClick={connectWallet}
                  disabled={connectingWallet}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                  {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </button>
                
                {contractInfo && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Smart Contract Information</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Contract:</strong> {contractInfo.address}</p>
                      <p><strong>Network:</strong> {contractInfo.network}</p>
                      <p><strong>Mode:</strong> {contractInfo.simulation ? 'Simulation' : 'Mainnet'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4"
              >
                <SparklesIcon className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Web3 Dashboard
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage your digital assets, interact with smart contracts, and explore the future of decentralized finance
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center space-x-2 bg-white/10 backdrop-blur-lg rounded-2xl p-2">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'transactions', name: 'Blockchain Transactions', icon: DocumentTextIcon },
                { id: 'staking', name: 'Staking', icon: FireIcon },
                { id: 'contract', name: 'Smart Contract', icon: ShieldCheckIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Blockchain Balance</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {parseFloat(walletBalance).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-400">SOV Tokens</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <FireIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">18.5% APY</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Staked Tokens</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {profile.total_staked?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-orange-400">Earning rewards</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <TrophyIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">Platinum</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Reputation Score</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {profile.reputation_score || 100}
                    </p>
                    <p className="text-xs text-yellow-400">Top 5% users</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">NFT Collection</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {profile.nft_count || 0}
                    </p>
                    <p className="text-xs text-purple-400">Rare items owned</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Wallet Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <WalletIcon className="h-6 w-6 mr-2" />
                    Wallet Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-400">Wallet Address</span>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-mono text-sm text-white break-all">
                          {profile.wallet_address}
                        </p>
                        <button
                          onClick={() => copyToClipboard(profile.wallet_address)}
                          className="ml-2 p-1 hover:bg-white/20 rounded"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Wallet Type</span>
                      <p className="capitalize text-white">{profile.wallet_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Governance Power</span>
                      <p className="font-semibold text-white">{profile.governance_power?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </motion.div>

                {/* NFT Collection Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <SparklesIcon className="h-6 w-6 mr-2" />
                    NFT Collection
                  </h3>
                  {profile.nft_collections && profile.nft_collections.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {profile.nft_collections.slice(0, 4).map((nft) => (
                        <div key={nft.id} className="border border-white/20 rounded-lg p-3">
                          <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg mb-2"></div>
                          <p className="text-xs font-medium text-white truncate">{nft.name}</p>
                          <p className="text-xs text-gray-400">Rarity: {nft.rarity_score}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-400">No NFTs yet</p>
                      <p className="text-xs text-gray-500 mt-1">Create your profile NFT to get started</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          )}

          {/* Blockchain Transactions Tab */}
          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2" />
                Blockchain Transaction History
              </h3>
              
              {blockchainTransactions.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {blockchainTransactions.map((tx) => (
                    <div key={tx.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(tx.status)}
                          <div>
                            <p className="font-medium text-white">{formatTransactionType(tx.transaction_type)}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(tx.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {tx.amount.toLocaleString()} SOV
                          </p>
                          {tx.vnd_amount && (
                            <p className="text-sm text-gray-400">
                              {tx.vnd_amount.toLocaleString()} VND
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {tx.transaction_hash && (
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-2">
                            <span>TX Hash:</span>
                            <code className="bg-black/20 px-2 py-1 rounded">
                              {tx.transaction_hash.slice(0, 8)}...{tx.transaction_hash.slice(-6)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(tx.transaction_hash!)}
                              className="hover:text-white"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Block: {tx.block_number}</span>
                            <span>Confirmations: {tx.confirmations}</span>
                          </div>
                        </div>
                      )}
                      
                      {tx.gas_used && (
                        <div className="mt-2 text-xs text-gray-400">
                          Gas Used: {tx.gas_used.toLocaleString()} • 
                          Gas Price: {(parseInt(tx.gas_price?.toString() || '0') / 1e9).toFixed(2)} Gwei
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No blockchain transactions found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start using services to generate blockchain transactions
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Smart Contract Tab */}
          {activeTab === 'contract' && contractInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2" />
                Smart Contract Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Contract Address</label>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-white font-mono text-sm bg-black/20 px-3 py-2 rounded-lg">
                        {contractInfo.address}
                      </code>
                      <button
                        onClick={() => copyToClipboard(contractInfo.address)}
                        className="ml-2 p-2 hover:bg-white/20 rounded-lg"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Network</label>
                    <p className="text-white font-medium capitalize">{contractInfo.network}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Mode</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${contractInfo.simulation ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <span className="text-white">
                        {contractInfo.simulation ? 'Simulation Mode' : 'Mainnet'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-3 block">Available Functions</label>
                  <div className="space-y-2">
                    {contractInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {contractInfo.simulation && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-200">Simulation Mode Active</p>
                      <p className="text-sm text-yellow-300 mt-1">
                        This smart contract is running in simulation mode. All transactions are simulated 
                        and no real blockchain interactions occur. Perfect for testing and development.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FireIcon className="h-6 w-6 mr-2" />
                  Token Staking
                </h2>
                <button
                  onClick={() => setShowStakeModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Stake Tokens
                </button>
              </div>

              {profile.staking_history && profile.staking_history.length > 0 ? (
                <div className="space-y-4">
                  {profile.staking_history.map((stake, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">
                          {stake.amount.toLocaleString()} SOV
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          stake.status === 'active' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {stake.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-300">Duration</span>
                          {stake.duration_days} days
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">APY</span>
                          {stake.apy_rate}%
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Start Date</span>
                          {new Date(stake.start_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Rewards</span>
                          {stake.rewards_earned?.toLocaleString() || '0'} SOV
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FireIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No active staking positions</p>
                  <p className="text-sm text-gray-500">Start staking to earn rewards and governance power</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Staking Modal */}
        {showStakeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Stake SOV Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount to Stake
                  </label>
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Available: {parseFloat(walletBalance).toLocaleString()} SOV
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Staking Duration
                  </label>
                  <select
                    value={stakingDuration}
                    onChange={(e) => setStakingDuration(parseInt(e.target.value))}
                    className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={30}>30 days ({getAPYRate(30)}% APY)</option>
                    <option value={90}>90 days ({getAPYRate(90)}% APY)</option>
                    <option value={180}>180 days ({getAPYRate(180)}% APY)</option>
                    <option value={365}>1 year ({getAPYRate(365)}% APY)</option>
                  </select>
                </div>

                {stakingAmount && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                      <span className="font-medium">Estimated Rewards:</span>{' '}
                      {((parseFloat(stakingAmount) * getAPYRate(stakingDuration) / 100) * (stakingDuration / 365)).toFixed(2)} SOV
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 border border-gray-600 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={stakeTokens}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Stake Tokens
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}