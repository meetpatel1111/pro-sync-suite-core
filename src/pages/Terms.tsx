import React from 'react';
import AppLayout from '@/components/AppLayout';

const TermsOfService: React.FC = () => (
  <AppLayout>
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
      <strong>Development Disclaimer:</strong> This service is currently in development. These terms do not constitute a binding legal agreement. Use at your own risk. We strive for the highest service security and privacy from our side.
    </div>
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Welcome to Pro Sync Suite! By using our services, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-2">By accessing or using our platform, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. User Responsibilities</h2>
      <p className="mb-2">You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Prohibited Activities</h2>
      <p className="mb-2">You may not use the service for any unlawful or prohibited purpose.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Modifications</h2>
      <p className="mb-2">We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact</h2>
      <p>If you have any questions about these Terms, please contact us at support@prosyncsuite.com.</p>
    </div>
  </AppLayout>
);

export default TermsOfService;
