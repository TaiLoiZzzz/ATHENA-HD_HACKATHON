'use client';

import React from 'react';
import Layout from '@/components/Layout/Layout';
import PaymentTutorial from '@/components/Payment/PaymentTutorial';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';

export default function PaymentTutorialPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="payment-tutorial"
            amount={300000}
            category="tutorial"
            position="top"
            size="large"
          />
          
          <PaymentTutorial />
        </div>
      </div>
    </Layout>
  );
}
