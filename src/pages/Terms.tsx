import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <Link to="/auth">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </Link>
        
        <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-lg">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Development Version</AlertTitle>
            <AlertDescription>
              This application is currently in development. These Terms of Service are for demonstration purposes only and are not legally binding. The final Terms of Service will be provided when the application is released for production use.
            </AlertDescription>
          </Alert>

          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing and using ProSync Suite, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Service Usage</h2>
              <p>Our services are provided "as is". We reserve the right to modify, suspend, or discontinue any part of the service at any time.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Data Usage</h2>
              <p>We collect and process your data in accordance with our Privacy Policy. By using our service, you consent to such processing.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Intellectual Property</h2>
              <p>The service and its original content, features, and functionality are owned by ProSync Suite and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Termination</h2>
              <p>We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Contact</h2>
              <p>If you have any questions about these Terms, please contact us at support@prosync-suite.com</p>
            </section>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: May 11, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
