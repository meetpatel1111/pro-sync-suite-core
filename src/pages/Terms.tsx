
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Terms = () => {
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
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Please read these terms and conditions carefully
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
            <FileText className="h-3 w-3 mr-1" />
            Legal Document
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200/50 dark:border-green-800/50">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Acceptance of Terms</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the service.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Use License</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only. This license shall automatically terminate if you violate any of these restrictions.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Disclaimer</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on this application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Limitations</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall the company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use this application.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    5
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Accuracy of Materials</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The materials appearing on this application could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    6
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Links</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We have not reviewed all of the sites linked to our application and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    7
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Modifications</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We may revise these terms of service at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    8
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Governing Law</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 m-0">Contact Information</h3>
              </div>
              <p className="text-blue-800 dark:text-blue-200 m-0">
                If you have any questions about these Terms of Service, please contact our support team through the application or visit our help center.
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

export default Terms;
