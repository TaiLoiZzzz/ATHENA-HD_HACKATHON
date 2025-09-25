'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { sovTokenService } from '@/services/sovTokenService';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function TestWallet() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [testAmount, setTestAmount] = useState(100);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = () => {
    const walletData = sovTokenService.getWallet();
    const transactionData = sovTokenService.getTransactions();
    setWallet(walletData);
    setTransactions(transactionData.slice(0, 10)); // Show last 10 transactions
  };

  const testSpend = () => {
    try {
      sovTokenService.spendTokens(testAmount, `Test spend: ${testAmount} SOV`, 'test');
      loadWalletData();
      alert(`Successfully spent ${testAmount} SOV`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const testEarn = () => {
    try {
      sovTokenService.earnTokens(testAmount, `Test earn: ${testAmount} SOV`, 'test');
      loadWalletData();
      alert(`Successfully earned ${testAmount} SOV`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const testPayment = () => {
    try {
      sovTokenService.processPayment(testAmount, 'test', `test_${Date.now()}`, `Test payment: ${testAmount} SOV`);
      loadWalletData();
      alert(`Successfully processed payment of ${testAmount} SOV`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const resetWallet = () => {
    if (confirm('Are you sure you want to reset the wallet? This will clear all data.')) {
      sovTokenService.clearAllData();
      loadWalletData();
      alert('Wallet reset successfully');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Test Page</h1>
          
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="test-wallet"
            amount={500000}
            category="testing"
            position="top"
            size="large"
          />
          
          {wallet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Wallet Balance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Available:</span> {wallet.balance.toLocaleString()} SOV</p>
                  <p><span className="font-medium">Total Earned:</span> {wallet.totalEarned.toLocaleString()} SOV</p>
                  <p><span className="font-medium">Total Spent:</span> {wallet.totalSpent.toLocaleString()} SOV</p>
                  <p><span className="font-medium">Net Tokens:</span> {wallet.netTokens.toLocaleString()} SOV</p>
                </div>
              </div>

              {/* Test Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Amount (SOV)
                    </label>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={(e) => setTestAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={testSpend}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Test Spend
                    </button>
                    <button
                      onClick={testEarn}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Test Earn
                    </button>
                    <button
                      onClick={testPayment}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Test Payment
                    </button>
                  </div>
                  
                  <button
                    onClick={resetWallet}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 w-full"
                  >
                    Reset Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {tx.type === 'earn' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'earn' ? '+' : ''}{tx.amount} SOV
                    </p>
                    <p className="text-sm text-gray-600">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
