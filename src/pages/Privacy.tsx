import React from 'react';
import AppLayout from '@/components/AppLayout';

const PrivacyPolicy: React.FC = () => (
  <AppLayout>
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
      <strong>Development Disclaimer:</strong> This service is currently in development. This policy does not constitute a binding legal agreement. Use at your own risk. We strive for the highest service security and privacy from our side.
    </div>
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Pro Sync Suite.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information Collection</h2>
      <p className="mb-2">We collect information you provide when you sign up, such as your name, email, and username.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Information</h2>
      <p className="mb-2">We use your information to provide and improve our services, communicate with you, and ensure security.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <p className="mb-2">We do not share your personal information with third parties except as required by law or to provide our services.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-2">We implement reasonable security measures to protect your data from unauthorized access.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Policy</h2>
      <p className="mb-2">We may update this policy from time to time. We will notify you of significant changes.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@prosyncsuite.com.</p>
    </div>
  </AppLayout>
);

export default PrivacyPolicy;
