'use client';

import React from 'react';
import EnhancedSOVWallet from './EnhancedSOVWallet';

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
  return (
    <div className={className}>
      <EnhancedSOVWallet
        showFullInterface={showFullInterface}
        onPayment={onPayment}
        requiredAmount={requiredAmount}
      />
      </div>
  );
}

