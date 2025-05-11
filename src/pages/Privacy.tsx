import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Privacy = () => {
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
              This application is currently in development. This Privacy Policy is for demonstration purposes only and is not legally binding. The final Privacy Policy will be provided when the application is released for production use.
            </AlertDescription>
          </Alert>

          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including but not limited to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Account information (name, email, etc.)</li>
                <li>Profile information</li>
                <li>Content you create, upload, or share</li>
                <li>Communications with us</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Provide and maintain our services</li>
                <li>Improve user experience</li>
                <li>Send important notifications</li>
                <li>Analyze usage patterns</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Data Storage and Security</h2>
              <p>We implement appropriate security measures to protect your personal information. Your data is stored securely using industry-standard encryption.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Service providers who assist our operations</li>
                <li>Law enforcement when required by law</li>
                <li>Other users (only information you choose to share)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request data deletion</li>
                <li>Object to data processing</li>
                <li>Export your data</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience and collect usage data. You can control these through your browser settings.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Children's Privacy</h2>
              <p>Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Contact Us</h2>
              <p>For privacy-related inquiries, please contact our Data Protection Officer at privacy@prosync-suite.com</p>
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

export default Privacy;
