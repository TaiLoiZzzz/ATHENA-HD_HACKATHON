'use client';

import React from 'react';
import Layout from '@/components/Layout/Layout';
import PaymentDemo from '@/components/Payment/PaymentDemo';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';

export default function DemoPaymentPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="demo-payment"
            amount={500000}
            category="demo"
            position="top"
            size="large"
          />
          
          <PaymentDemo />
        </div>
      </div>
    </Layout>
  );
}
