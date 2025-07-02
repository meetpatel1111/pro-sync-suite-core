
import React from 'react';
import AppLayout from '@/components/AppLayout';
import ServiceCore from '@/components/servicecore/ServiceCore';

const ServiceCorePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ServiceCore />
      </div>
    </AppLayout>
  );
};

export default ServiceCorePage;
