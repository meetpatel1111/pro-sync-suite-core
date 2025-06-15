import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuthContext } from '@/context/AuthContext';

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
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          Please read these terms and conditions carefully
        </p>
      </div>
      
      <div className="prose max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only.
        </p>
        
        <h2>3. Disclaimer</h2>
        <p>
          The materials on this application are provided on an 'as is' basis. We make no warranties, expressed or implied.
        </p>
        
        <h2>4. Limitations</h2>
        <p>
          In no event shall the company or its suppliers be liable for any damages arising out of the use or inability to use this application.
        </p>
        
        <h2>5. Accuracy of Materials</h2>
        <p>
          The materials appearing on this application could include technical, typographical, or photographic errors.
        </p>
        
        <h2>6. Links</h2>
        <p>
          We have not reviewed all of the sites linked to our application and are not responsible for the contents of any such linked site.
        </p>
        
        <h2>7. Modifications</h2>
        <p>
          We may revise these terms of service at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
        </p>
        
        <h2>8. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts.
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

export default Terms;
