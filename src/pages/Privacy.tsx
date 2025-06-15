
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Settings } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-8 animate-fade-in-up">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 mb-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          {user ? `Back to ${t('dashboard')}` : 'Back to Login'}
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your privacy is important to us
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200/50 dark:border-green-800/50">
            <Lock className="h-3 w-3 mr-1" />
            Privacy Protected
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
            Last updated: June 2025
          </Badge>
        </div>
      </div>
      
      <Card className="modern-card shadow-xl border-0">
        <CardContent className="p-8 lg:p-12">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Information We Collect</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any content you create within the application.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">How We Use Your Information</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Information Sharing</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information in certain limited circumstances, such as with service providers who assist us in operating our platform.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Data Security</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption and security protocols to safeguard your data.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Data Retention</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Your Rights</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. Contact us if you would like to exercise any of these rights.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Cookies</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, remember your preferences, and assist in our marketing efforts. You can control cookie settings through your browser.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Changes to This Policy</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date at the top of this policy.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Contact Us</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy, please contact us through our support channels or email us directly. We're here to help and ensure your privacy concerns are addressed.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-2xl border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 m-0">Privacy Commitment</h3>
              </div>
              <p className="text-green-800 dark:text-green-200 m-0">
                We are committed to protecting your privacy and being transparent about our data practices. Your trust is important to us, and we work hard to earn and maintain it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
