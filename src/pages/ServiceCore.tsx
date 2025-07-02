
import React from 'react';
import AppLayout from '@/components/AppLayout';
import ServiceCoreEnhanced from '@/components/servicecore/ServiceCoreEnhanced';

const ServiceCorePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ServiceCore
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                IT Service Management & Support Desk Platform
              </p>
            </div>
          </div>
          <ServiceCoreEnhanced />
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceCorePage;
