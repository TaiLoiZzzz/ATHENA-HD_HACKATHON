'use client';

import React from 'react';
import Layout from '@/components/Layout/Layout';
import VikkibankDashboard from '@/components/Vikkibank/VikkibankDashboard';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';

export default function VikkibankPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="vikkibank"
            amount={1200000}
            category="banking"
            position="top"
            size="large"
          />
          
          <VikkibankDashboard />
        </div>
      </div>
    </Layout>
  );
}
