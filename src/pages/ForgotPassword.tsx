
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth',
      });
      
      if (error) throw error;
      
      setSent(true);
      toast({ 
        title: 'Recovery email sent', 
        description: 'Please check your inbox for instructions.' 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="w-full max-w-md p-4">
        <Card className="overflow-hidden rounded-2xl shadow-lg">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="mt-2 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            {sent ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-gray-600">
                  If an account exists for {email}, we've sent a password reset link.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full"
                    variant="outline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="resetEmail" className="mb-1.5 block">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="h-12 w-full bg-indigo-600 hover:bg-indigo-700" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending recovery email...
                    </>
                  ) : (
                    "Send reset instructions"
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
