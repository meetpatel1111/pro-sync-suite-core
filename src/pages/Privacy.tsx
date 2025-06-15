import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuthContext } from '@/context/AuthContext';

const Privacy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();
  const { user } = useAuthContext();
  
  const handleBackClick = () => {
    // If user came from auth page or is not authenticated, go back to auth
    if (!user || location.state?.from === 'auth') {
      navigate('/auth');
    } else {
      navigate('/');
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          {user ? `Back to ${t('dashboard')}` : 'Back to Login'}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Your privacy is important to us
        </p>
      </div>
      
      <div className="prose max-w-none">
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
        </p>
        
        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
        </p>
        
        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
        </p>
        
        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        
        <h2>Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide you services and comply with our legal obligations.
        </p>
        
        <h2>Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
        </p>
        
        <h2>Cookies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.
        </p>
        
        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us through our support channels.
        </p>
      </div>
    </div>
  );

  // If user is not authenticated, show without AppLayout
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return <AppLayout>{content}</AppLayout>;
};

export default Privacy;
