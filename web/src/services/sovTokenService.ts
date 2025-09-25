// SOV Token Service - Mock Implementation with localStorage
// Handles SOV token transactions, wallet management, and payments

export interface SOVTransaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'stake' | 'unstake' | 'reward';
  amount: number;
  description: string;
  serviceType?: string;
  serviceReferenceId?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SOVWallet {
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  netTokens: number;
  stakedAmount: number;
  stakingRewards: number;
  lastUpdated: string;
}

export interface SOVPayment {
  id: string;
  amount: number;
  serviceType: string;
  serviceId: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface MembershipTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  level: number;
  icon: string;
  color: string;
  bonusMultiplier: number;
  benefits: string[];
  minPoints: number;
  maxPoints?: number;
  stakingBonus: number;
  transactionFeeDiscount: number;
}

class SOVTokenService {
  private storageKey = 'sov_wallet';
  private transactionsKey = 'sov_transactions';
  private paymentsKey = 'sov_payments';

  // Initialize wallet for new users with generous starting balance
  initializeWallet(userId: string): SOVWallet {
    // Different starting balances based on user type
    let startingBalance = 10000; // Default generous amount
    
    if (userId.includes('admin') || userId.includes('premium')) {
      startingBalance = 50000; // Admin/Premium users get more
    } else if (userId.includes('demo')) {
      startingBalance = 25000; // Demo users get good amount
    }

    const initialWallet: SOVWallet = {
      balance: startingBalance,
      lockedBalance: 0,
      totalEarned: startingBalance,
      totalSpent: 0,
      netTokens: startingBalance,
      stakedAmount: 0,
      stakingRewards: 0,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(initialWallet);
    
    // Add initial transaction record
    this.addTransaction({
      type: 'earn',
      amount: startingBalance,
      description: 'Welcome bonus - Initial SOV tokens',
      serviceType: 'welcome',
      status: 'completed',
      metadata: { isInitialDeposit: true }
    });

    return initialWallet;
  }

  // Get current wallet balance
  getWallet(): SOVWallet {
    if (typeof window === 'undefined') {
      return this.initializeWallet('default');
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return this.initializeWallet('default');
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse wallet data:', error);
      return this.initializeWallet('default');
    }
  }

  // Save wallet to localStorage
  private saveWallet(wallet: SOVWallet): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(wallet));
    }
  }

  // Get all transactions
  getTransactions(): SOVTransaction[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.transactionsKey);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse transactions:', error);
      return [];
    }
  }

  // Save transactions to localStorage
  private saveTransactions(transactions: SOVTransaction[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
    }
  }

  // Add new transaction
  addTransaction(transaction: Omit<SOVTransaction, 'id' | 'createdAt' | 'updatedAt'>): SOVTransaction {
    const newTransaction: SOVTransaction = {
      id: this.generateId('tx'),
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTransaction);
    this.saveTransactions(transactions);

    return newTransaction;
  }

  // Earn SOV tokens
  earnTokens(amount: number, description: string, serviceType?: string, metadata?: any): SOVTransaction {
    const wallet = this.getWallet();
    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      totalEarned: wallet.totalEarned + amount,
      netTokens: wallet.netTokens + amount,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    return this.addTransaction({
      type: 'earn',
      amount,
      description,
      serviceType,
      serviceReferenceId: metadata?.referenceId,
      status: 'completed',
      metadata
    });
  }

  // Spend SOV tokens
  spendTokens(amount: number, description: string, serviceType?: string, metadata?: any): SOVTransaction {
    const wallet = this.getWallet();
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient SOV token balance');
    }

    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance - amount,
      totalSpent: wallet.totalSpent + amount,
      netTokens: wallet.netTokens - amount,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    return this.addTransaction({
      type: 'spend',
      amount: -amount,
      description,
      serviceType,
      serviceReferenceId: metadata?.referenceId,
      status: 'completed',
      metadata
    });
  }

  // Process payment with SOV tokens
  processPayment(amount: number, serviceType: string, serviceId: string, description: string): SOVPayment {
    const wallet = this.getWallet();
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient SOV token balance for payment');
    }

    // Create payment record
    const payment: SOVPayment = {
      id: this.generateId('pay'),
      amount,
      serviceType,
      serviceId,
      description,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    // Update wallet
    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance - amount,
      totalSpent: wallet.totalSpent + amount,
      netTokens: wallet.netTokens - amount,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    // Add transaction
    this.addTransaction({
      type: 'spend',
      amount: -amount,
      description: `Payment: ${description}`,
      serviceType,
      serviceReferenceId: serviceId,
      status: 'completed',
      metadata: { paymentId: payment.id }
    });

    // Save payment
    this.savePayment(payment);

    return payment;
  }

  // Save payment to localStorage
  private savePayment(payment: SOVPayment): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.paymentsKey);
      const payments = stored ? JSON.parse(stored) : [];
      payments.unshift(payment);
      localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
    }
  }

  // Get payments
  getPayments(): SOVPayment[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.paymentsKey);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse payments:', error);
      return [];
    }
  }

  // Stake SOV tokens
  stakeTokens(amount: number, duration: number = 30): SOVTransaction {
    const wallet = this.getWallet();
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient SOV token balance for staking');
    }

    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance - amount,
      lockedBalance: wallet.lockedBalance + amount,
      stakedAmount: wallet.stakedAmount + amount,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    return this.addTransaction({
      type: 'stake',
      amount: -amount,
      description: `Staked ${amount} SOV tokens for ${duration} days`,
      serviceType: 'staking',
      status: 'completed',
      metadata: { duration, stakingReward: amount * 0.12 / 365 * duration }
    });
  }

  // Unstake SOV tokens
  unstakeTokens(amount: number): SOVTransaction {
    const wallet = this.getWallet();
    
    if (wallet.lockedBalance < amount) {
      throw new Error('Insufficient staked SOV tokens');
    }

    const stakingReward = amount * 0.12 / 365 * 30; // 12% APY for 30 days
    const totalAmount = amount + stakingReward;

    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance + totalAmount,
      lockedBalance: wallet.lockedBalance - amount,
      stakedAmount: wallet.stakedAmount - amount,
      stakingRewards: wallet.stakingRewards + stakingReward,
      totalEarned: wallet.totalEarned + stakingReward,
      netTokens: wallet.netTokens + stakingReward,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    return this.addTransaction({
      type: 'unstake',
      amount: totalAmount,
      description: `Unstaked ${amount} SOV tokens + ${stakingReward.toFixed(2)} rewards`,
      serviceType: 'staking',
      status: 'completed',
      metadata: { stakedAmount: amount, reward: stakingReward }
    });
  }

  // Get membership tier based on total points
  getMembershipTier(totalPoints: number): MembershipTier {
    if (totalPoints >= 10000) {
      return {
        name: 'Diamond',
        level: 4,
        icon: '💎',
        color: '#B9F2FF',
        bonusMultiplier: 2.0,
        benefits: ['Concierge service', 'Maximum earning rates', 'Premium rewards', 'VIP support'],
        minPoints: 10000,
        stakingBonus: 0.15,
        transactionFeeDiscount: 0.5
      };
    } else if (totalPoints >= 5000) {
      return {
        name: 'Gold',
        level: 3,
        icon: '🥇',
        color: '#FFD700',
        bonusMultiplier: 1.5,
        benefits: ['VIP support', 'Higher earning rates', 'Exclusive rewards', 'Priority processing'],
        minPoints: 5000,
        maxPoints: 9999,
        stakingBonus: 0.12,
        transactionFeeDiscount: 0.3
      };
    } else if (totalPoints >= 1000) {
      return {
        name: 'Silver',
        level: 2,
        icon: '🥈',
        color: '#C0C0C0',
        bonusMultiplier: 1.2,
        benefits: ['Priority support', 'Exclusive offers', 'Enhanced rewards'],
        minPoints: 1000,
        maxPoints: 4999,
        stakingBonus: 0.10,
        transactionFeeDiscount: 0.2
      };
    } else {
      return {
        name: 'Bronze',
        level: 1,
        icon: '🥉',
        color: '#CD7F32',
        bonusMultiplier: 1.0,
        benefits: ['Welcome bonus', 'Basic support'],
        minPoints: 0,
        maxPoints: 999,
        stakingBonus: 0.08,
        transactionFeeDiscount: 0.1
      };
    }
  }

  // Calculate earning bonus based on membership tier
  calculateEarningBonus(amount: number, membershipTier: MembershipTier): number {
    return amount * (membershipTier.bonusMultiplier - 1);
  }

  // Calculate staking bonus based on membership tier
  calculateStakingBonus(amount: number, membershipTier: MembershipTier): number {
    return amount * membershipTier.stakingBonus;
  }

  // Transfer SOV tokens to another user (mock)
  transferTokens(amount: number, recipientId: string, description: string): SOVTransaction {
    const wallet = this.getWallet();
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient SOV token balance for transfer');
    }

    const updatedWallet: SOVWallet = {
      ...wallet,
      balance: wallet.balance - amount,
      totalSpent: wallet.totalSpent + amount,
      netTokens: wallet.netTokens - amount,
      lastUpdated: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    return this.addTransaction({
      type: 'transfer',
      amount: -amount,
      description: `Transfer to ${recipientId}: ${description}`,
      serviceType: 'transfer',
      status: 'completed',
      metadata: { recipientId }
    });
  }

  // Get wallet statistics
  getWalletStats(): {
    totalValue: number;
    availableBalance: number;
    stakedAmount: number;
    totalEarned: number;
    totalSpent: number;
    netGrowth: number;
    membershipTier: MembershipTier;
  } {
    const wallet = this.getWallet();
    const membershipTier = this.getMembershipTier(wallet.totalEarned);
    
    return {
      totalValue: wallet.balance + wallet.lockedBalance,
      availableBalance: wallet.balance,
      stakedAmount: wallet.stakedAmount,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      netGrowth: wallet.netTokens,
      membershipTier
    };
  }

  // Clear all data (for testing)
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.transactionsKey);
      localStorage.removeItem(this.paymentsKey);
    }
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate API delay
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const sovTokenService = new SOVTokenService();
export default sovTokenService;
