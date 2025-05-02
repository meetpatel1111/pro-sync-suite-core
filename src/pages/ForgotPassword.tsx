
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import "../pages/auth-modern.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // For non-Supabase auth, we can create a custom solution
      // For Supabase auth, use the proper password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        setError(error.message);
      } else {
        setEmailSent(true);
        toast({
          title: 'Email sent',
          description: 'If an account exists with this email, you will receive password reset instructions.',
        });
      }
    } catch (err: any) {
      console.error('Exception during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="w-full max-w-md p-8 mx-auto rounded-2xl bg-white shadow-lg card-appear">
        <div className="text-center mb-6">
          {emailSent ? (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Check your email</h2>
            </div>
          ) : (
            <h2 className="text-2xl font-bold">Reset your password</h2>
          )}
        </div>
        
        {!emailSent ? (
          <>
            <p className="text-gray-600 text-center mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    autoFocus
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset instructions"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <Link 
                  to="/auth" 
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              If an account exists with <strong>{email}</strong>, we've sent password reset instructions to this email address.
            </p>
            
            <p className="text-gray-600 text-center text-sm">
              Please check your inbox and spam folder. The email should arrive within a few minutes.
            </p>
            
            <div className="flex flex-col space-y-4 mt-6">
              <Button
                type="button"
                className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                onClick={() => setEmailSent(false)}
              >
                Send to a different email
              </Button>
              
              <Link to="/auth">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full"
                >
                  Return to login
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <div className="flex justify-center space-x-3 mt-1">
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
