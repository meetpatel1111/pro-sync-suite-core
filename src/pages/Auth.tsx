
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, Shield, ShieldCheck, ExternalLink } from 'lucide-react';
import dbService from '@/services/dbService';
import "../pages/auth-modern.css";

const Auth = () => {
  const [type, setType] = useState("sign-in");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clear errors when switching between login/signup
  useEffect(() => {
    setFormError('');
    setEmailError('');
    setPasswordError('');
  }, [type]);

  // Email validation
  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Form validation
  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (type === "sign-up") {
      if (!fullName) {
        setFormError('Full name is required');
        return false;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
      if (!acceptTerms) {
        setFormError('You must accept the Terms and Privacy Policy');
        return false;
      }
    }
    
    return isEmailValid && isPasswordValid;
  };

  // Sign in with Supabase
  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setFormError('');
    
    try {
      console.log('Attempting to sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Auth error:', error);
        setFormError(error.message);
        return;
      }
      
      toast({
        title: 'Signed in successfully',
        description: 'You have been signed in to your account',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Sign up with Supabase
  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setFormError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Auth error:', error);
        setFormError(error.message);
        return;
      }
      
      toast({
        title: 'Signed up successfully',
        description: 'Please check your email to verify your account',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Sign-up error:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Custom sign in for users in the database
  const handleCustomSignIn = async () => {
    console.log('Attempting custom sign in with:', email);
    if (!validateForm()) return;
    
    setLoading(true);
    setFormError('');
    
    try {
      // Check if the user exists using maybeSingle() instead of single() to avoid errors
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .maybeSingle();

      console.log('User lookup result:', existingUser, fetchError);
      
      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        setFormError('Failed to check credentials. Please try again.');
        setLoading(false);
        return;
      }
      
      if (!existingUser) {
        console.log('No user found with this email');
        setFormError('Invalid email or password');
        setLoading(false);
        return;
      }

      // For development purposes, we're allowing any password
      // In production, you should validate the password properly
      const customUser = {
        id: existingUser.id,
        email: existingUser.email,
        full_name: existingUser.full_name || email.split('@')[0],
        customAuth: true,
      };

      console.log('Creating custom user session:', customUser);
      
      // Store the custom user in localStorage
      localStorage.setItem('customUser', JSON.stringify(customUser));

      // Ensure user is present in the application's users table (required for FK)
      try {
        const upsertResult = await dbService.upsertAppUser(customUser);
        console.debug('[CustomUser] upsertAppUser result:', upsertResult);
        if (upsertResult?.error) {
          console.error('[CustomUser] Failed to upsert user:', upsertResult.error);
        }
      } catch (err) {
        console.error('[CustomUser] Exception during upsertAppUser:', err);
      }

      toast({
        title: 'Signed in successfully',
        description: 'You have been signed in to your account',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Custom sign-in error:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setFormError('');
    
    try {
      // Check if the user already exists using maybeSingle() instead of single()
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking if user exists:', fetchError);
        setFormError('Error checking if user exists. Please try again.');
        setLoading(false);
        return;
      }

      if (existingUser) {
        setFormError('User with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      // Create a new user ID
      const userId = crypto.randomUUID();
      
      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          username: email.split('@')[0] // Adding a username derived from email
        });
        
      if (insertError) {
        setFormError(insertError.message);
        setLoading(false);
        return;
      }

      // Create a custom user object
      const customUser = {
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        customAuth: true,
      };

      // Store the custom user in localStorage
      localStorage.setItem('customUser', JSON.stringify(customUser));

      toast({
        title: 'Signed up successfully',
        description: 'Your account has been created successfully',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Custom sign-up error:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "sign-in") {
      handleCustomSignIn();
    } else {
      handleCustomSignUp();
    }
  };

  return (
    <div className="auth-bg">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Left Column - Illustration and Info */}
        <div className="hidden w-1/2 bg-gradient-to-br from-indigo-500 to-purple-700 p-12 lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">ProSync Suite</h1>
              <p className="mt-6 max-w-sm text-lg text-indigo-100">
                The all-in-one collaboration platform for teams that want to achieve more.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-white">Seamless team collaboration</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-white">Powerful project management</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-white">Insightful analytics and reporting</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Auth Form */}
        <div className="w-full p-8 md:p-12 lg:w-1/2">
          <div className="mx-auto max-w-md">
            <h2 className="mb-2 text-3xl font-bold">
              {type === "sign-in" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mb-8 text-gray-600">
              {type === "sign-in"
                ? "Sign in to your account to continue"
                : "Fill out the form to get started"
              }
            </p>

            {formError && (
              <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name - Only for Sign Up */}
              {type === "sign-up" && (
                <div className="mb-5">
                  <Label htmlFor="fullName" className="mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              {/* Email */}
              <div className="mb-5">
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
                    onBlur={validateEmail}
                    className={`h-12 pl-10 ${emailError ? 'border-red-500' : ''}`}
                  />
                </div>
                {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="mb-1.5 block">
                    Password
                  </Label>
                  {type === "sign-in" && (
                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={type === "sign-up" ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    className={`h-12 pl-10 ${passwordError ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                {type === "sign-up" && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">Password should be at least 6 characters</p>
                  </div>
                )}
              </div>

              {/* Confirm Password - Only for Sign Up */}
              {type === "sign-up" && (
                <div className="mb-5">
                  <Label htmlFor="confirmPassword" className="mb-1.5 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Remember Me - Only for Sign In */}
              {type === "sign-in" && (
                <div className="mb-5 flex items-center gap-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)} 
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me for 30 days
                  </Label>
                </div>
              )}

              {/* Terms - Only for Sign Up */}
              {type === "sign-up" && (
                <div className="mb-5 flex items-start gap-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(!!checked)} 
                    className="mt-0.5" 
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Terms of Service
                    </Link> and{" "}
                    <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                      <Shield className="mr-1 h-3 w-3" /> Privacy Policy
                    </Link>
                  </Label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="mt-2 h-12 w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                disabled={loading || (type === "sign-up" && (!email || !password || password !== confirmPassword || !acceptTerms))}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {type === "sign-in" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  type === "sign-in" ? "Sign in" : "Create account"
                )}
              </Button>

              {/* OAuth Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12"
                    onClick={() => alert("Google OAuth integration would go here")}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              </div>

              {/* Switch between login/signup */}
              <p className="mt-8 text-center text-sm text-gray-600">
                {type === "sign-in" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setType("sign-up")}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setType("sign-in")}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
            
            {/* Terms and Privacy Links - Always show */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>By signing {type === "sign-in" ? "in" : "up"}, you agree to our</p>
              <div className="flex justify-center space-x-3 mt-1">
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                  <Shield className="mr-1 h-3 w-3" /> Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
