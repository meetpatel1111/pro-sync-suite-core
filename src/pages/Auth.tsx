import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '@/services/dbService';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// --- Password helpers ---
const passwordRules = [
  { test: (pw: string) => pw.length >= 8, label: 'At least 8 characters' },
  { test: (pw: string) => /[A-Z]/.test(pw), label: 'One uppercase letter' },
  { test: (pw: string) => /[0-9]/.test(pw), label: 'One number' },
  { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: 'One special character' },
];
const passwordStrength = (pw: string) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const Auth: React.FC = () => {
  const { setProfile: setUserProfile } = useAuthContext();
  // ...existing state
  const [signupAuthType, setSignupAuthType] = useState<'supabase'|'custom'>('supabase');
  const [loginAuthType, setLoginAuthType] = useState<'supabase'|'custom'>('supabase');
  // ...rest of state
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login'|'signup'|'reset'|'reset-confirm'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [animateError, setAnimateError] = useState(false);
  // Login
  // loginEmail is required for login form and logic
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupShowPw, setSignupShowPw] = useState(false);
  const [signupShowConfirm, setSignupShowConfirm] = useState(false);
  const [signupAgreed, setSignupAgreed] = useState(false);
  // Reset
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      setResetSent(true);
      toast({ title: 'Password reset email sent', description: 'Please check your inbox for instructions.' });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };
  // Reset-confirm
  const [newPassword, setNewPassword] = useState('');
  const [newConfirm, setNewConfirm] = useState('');
  const [resetShowPw, setResetShowPw] = useState(false);
  const [resetShowConfirm, setResetShowConfirm] = useState(false);
  // Accessibility: focus error on error
  const errorRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Check if the user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const clearError = () => setError(null);

  const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError();

  if (!signupEmail || !signupPassword || !signupName) {
    setError('Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    if (signupAuthType === 'supabase') {
      // Supabase Auth sign up
      const username = signupEmail.split('@')[0];
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            username: username,
          },
        },
      });
      if (error) throw error;
      // Fetch user profile from custom users table after signup
      let profile = null;
      if (data?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, email, username, full_name, avatar_url')
          .eq('id', data.user.id)
          .single();
        if (!profileError) {
          profile = userProfile;
          setUserProfile && setUserProfile(profile);
        }
        const { error: userTableError } = await supabase.from('users').insert({
          id: data.user.id,
          email: signupEmail,
          username: username,
          full_name: signupName,
        });
        if (userTableError) {
          console.error('Error inserting into users table:', userTableError);
          toast({ title: 'Profile incomplete', description: 'Account created, but profile not fully saved.', variant: 'destructive' });
        }
      }
      toast({
        title: 'Account created',
        description: 'Please check your email for verification link',
      });
      setActiveTab('login');
    } else {
      // Custom password sign up
      const username = signupEmail.split('@')[0];
      const password_hash = await dbService.hashPassword(signupPassword);
      const id = uuidv4();
      const { data, error } = await supabase.from('users').insert({
        id,
        email: signupEmail,
        username: username,
        full_name: signupName,
        custom_password_hash: password_hash,
      });
      if (error) throw error;
      toast({ title: 'Account created', description: 'You can now log in with your custom password.' });
      setActiveTab('login');
    }
  } catch (error: any) {
    setError(error.message || 'An error occurred during sign up');
  } finally {
    setLoading(false);
  }
};

  
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError();

  if (!loginEmail || !loginPassword) {
    setError('Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    if (loginAuthType === 'supabase') {
      // Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      const userId = data?.user?.id;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, username, full_name, avatar_url')
          .eq('id', userId)
          .single();
        if (!profileError) {
          setUserProfile && setUserProfile(profile);
        }
      }
    } else {
      // Custom password login
      const user = await dbService.verifyCustomPassword(loginEmail, loginPassword);
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      setUserProfile && setUserProfile(user);
      // You may want to set a custom session/cookie here
    }
  } catch (error: any) {
    setError(error.message || 'Invalid login credentials');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-bg min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <Card className="auth-card border-0 shadow-xl backdrop-blur-md bg-white/90 dark:bg-gray-900/80">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">ProSync Suite</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Your all-in-one productivity platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-4 border-0 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-lg mb-6 bg-gray-100/80 dark:bg-gray-800/50 p-1">
                <TabsTrigger value="login" className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-fade-in">
                {/* Login Form */}
                <div className="flex gap-2 mb-4 justify-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="loginAuthType"
                      value="supabase"
                      checked={loginAuthType === 'supabase'}
                      onChange={() => setLoginAuthType('supabase')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Email Auth</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="loginAuthType"
                      value="custom"
                      checked={loginAuthType === 'custom'}
                      onChange={() => setLoginAuthType('custom')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Custom Password</span>
                  </label>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="loginPassword" className="text-sm font-medium">Password</Label>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="text-xs text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
                        aria-label={loginShowPw ? 'Hide password' : 'Show password'}
                        onClick={() => setLoginShowPw(v => !v)}
                      >
                        {loginShowPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={loginShowPw ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        aria-invalid={!!error}
                        className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                      Remember Me
                    </label>
                    <button 
                      type="button" 
                      className="text-indigo-600 text-sm hover:underline focus:outline-none transition-colors" 
                      onClick={()=>navigate('/forgot-password')}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={!loginEmail || !loginPassword || loading} 
                    aria-busy={loading}
                  >
                    {loading && <span className="loader" aria-label="Loading"/>}
                    Login
                  </Button>
                  <div className="my-4 flex items-center gap-2">
                    <hr className="flex-1 border-gray-200 dark:border-gray-700"/>
                    <span className="text-gray-400 text-xs font-medium">OR</span>
                    <hr className="flex-1 border-gray-200 dark:border-gray-700"/>
                  </div>
                  {/* OAuth placeholder */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.1 7.3c.7.1 2.5.9 2.5 3.1 0 2.5-1.7 3.7-1.7 3.7l.1.1c.5 1.4 1.2 2.8 2 3.9h-4.1c-.7-.9-1.3-1.9-1.7-2.9-2.3.6-4.3-1.4-4.3-3.5 0-1.9 1.2-3.1 2.9-3.5 1.8-.4 3.4.4 3.9 2.1.5-.2 1-.6 1-.6-.1-1.4-1.3-1.9-2.4-2-1.9-.2-3.5.5-4.5 2.2-1.5-.1-3 .5-3.9 1.7-.9 1.3-.9 3-.1 4.3.1.1.2.2.3.4-.4.1-.7.2-1.1.3-.6.2-.9.8-.7 1.4.2.6.8 1 1.4.8.5-.2 1.1-.4 1.6-.7.5.3 1 .5 1.6.6.5.1 1-.3 1.1-.8.1-.5-.3-1-.8-1.1-.4-.1-.7-.2-1-.4.5-.9.5-2 0-2.8.5-.8 1.3-1.2 2.2-1.1 0 .4.1.9.2 1.3.1.7.8 1.1 1.5 1 .6-.1 1.1-.8 1-1.4-.1-.3-.1-.7-.1-1 .4-.6.6-1.3.6-1.9.1-.8-.4-2.2-1.9-2.8-.7-2.3-2.8-3.8-5.1-3.8-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c.1 0 .2 0 .3 0-.1.1-.1.2-.2.4-.3.6-.1 1.4.5 1.7.6.3 1.4.1 1.7-.5.2-.5.5-1 .7-1.5.5.2 1 .3 1.5.2-.5 1.2-1.5 2.1-2.7 2.4-3 .6-5.5-1.7-5.5-4.4 0-1.9 1.2-3.5 3-4.2.3-3.2 3-5.7 6.3-5.7 3.5 0 6.3 2.9 6.3 6.5 0 .3 0 .5-.1.8z" fill="#00A2ED"/>
                      </svg>
                      Continue with Microsoft
                    </Button>
                  </div>
                  {/* Magic link placeholder */}
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      className="text-indigo-600 text-sm hover:underline focus:outline-none" 
                      onClick={()=>alert('Magic link coming soon!')}
                    >
                      Email me a magic link
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
                {/* Signup Form */}
                <div className="flex gap-2 mb-4 justify-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="signupAuthType" value="supabase" checked={signupAuthType==='supabase'} onChange={()=>setSignupAuthType('supabase')} className="rounded text-indigo-600 focus:ring-indigo-500" /> 
                    Email Auth
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="signupAuthType" value="custom" checked={signupAuthType==='custom'} onChange={()=>setSignupAuthType('custom')} className="rounded text-indigo-600 focus:ring-indigo-500" /> 
                    Custom Password
                  </label>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupName" className="text-sm font-medium">Full Name</Label>
                    <Input 
                      id="signupName" 
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="signupEmail" 
                      type="email" 
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={signupShowPw ? 'Hide password' : 'Show password'}
                        className="text-xs text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
                        onClick={() => setSignupShowPw(v => !v)}
                      >
                        {signupShowPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Input 
                        id="signupPassword" 
                        type={signupShowPw ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-describedby="pw-rules"
                        className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div id="pw-rules" className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {passwordRules.map((r,i)=>(
                        <div key={i} className={`flex items-center gap-1 ${r.test(signupPassword)?'text-green-600':'text-gray-400'} transition-colors`}>
                          <span className="text-sm">{r.test(signupPassword) ? '✓' : '○'}</span>
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-xs">
                      Password strength: 
                      <span className={
                        passwordStrength(signupPassword)===0 ? 'text-red-500 ml-1' :
                        passwordStrength(signupPassword)===1 ? 'text-yellow-500 ml-1' : 'text-green-600 ml-1'
                      }>
                        {['Very weak','Weak','Okay','Strong','Very strong'][passwordStrength(signupPassword)]}
                      </span>
                      <div className="w-full h-1 mt-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-1 transition-all ${
                            passwordStrength(signupPassword) === 0 ? 'w-0 bg-red-500' :
                            passwordStrength(signupPassword) === 1 ? 'w-1/4 bg-red-500' :
                            passwordStrength(signupPassword) === 2 ? 'w-2/4 bg-yellow-500' :
                            passwordStrength(signupPassword) === 3 ? 'w-3/4 bg-green-500' :
                            'w-full bg-green-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signupConfirm" className="text-sm font-medium">Confirm Password</Label>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={signupShowConfirm ? 'Hide password' : 'Show password'}
                        className="text-xs text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
                        onClick={() => setSignupShowConfirm(v => !v)}
                      >
                        {signupShowConfirm ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Input 
                        id="signupConfirm"
                        type={signupShowConfirm ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-invalid={signupConfirm && signupPassword!==signupConfirm}
                        className="h-11 bg-white/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    {signupConfirm && signupPassword!==signupConfirm && 
                      <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> 
                        Passwords do not match
                      </div>
                    }
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                    <input 
                      type="checkbox" 
                      checked={signupAgreed} 
                      onChange={e=>setSignupAgreed(e.target.checked)} 
                      className="rounded text-indigo-600 focus:ring-indigo-500" 
                      required
                    />
                    I agree to the <a href="/terms" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms</a> & <a href="/privacy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  </label>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={!signupName || !signupEmail || !signupPassword || !signupConfirm || !signupAgreed || signupPassword!==signupConfirm || !passwordRules.every(r=>r.test(signupPassword)) || loading} 
                    aria-busy={loading}
                  >
                    {loading && <span className="loader" aria-label="Loading"/>}
                    Create Account
                  </Button>
                  <div className="my-4 flex items-center gap-2">
                    <hr className="flex-1 border-gray-200 dark:border-gray-700"/>
                    <span className="text-gray-400 text-xs font-medium">OR</span>
                    <hr className="flex-1 border-gray-200 dark:border-gray-700"/>
                  </div>
                  {/* OAuth placeholder */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.1 7.3c.7.1 2.5.9 2.5 3.1 0 2.5-1.7 3.7-1.7 3.7l.1.1c.5 1.4 1.2 2.8 2 3.9h-4.1c-.7-.9-1.3-1.9-1.7-2.9-2.3.6-4.3-1.4-4.3-3.5 0-1.9 1.2-3.1 2.9-3.5 1.8-.4 3.4.4 3.9 2.1.5-.2 1-.6 1-.6-.1-1.4-1.3-1.9-2.4-2-1.9-.2-3.5.5-4.5 2.2-1.5-.1-3 .5-3.9 1.7-.9 1.3-.9 3-.1 4.3.1.1.2.2.3.4-.4.1-.7.2-1.1.3-.6.2-.9.8-.7 1.4.2.6.8 1 1.4.8.5-.2 1.1-.4 1.6-.7.5.3 1 .5 1.6.6.5.1 1-.3 1.1-.8.1-.5-.3-1-.8-1.1-.4-.1-.7-.2-1-.4.5-.9.5-2 0-2.8.5-.8 1.3-1.2 2.2-1.1 0 .4.1.9.2 1.3.1.7.8 1.1 1.5 1 .6-.1 1.1-.8 1-1.4-.1-.3-.1-.7-.1-1 .4-.6.6-1.3.6-1.9.1-.8-.4-2.2-1.9-2.8-.7-2.3-2.8-3.8-5.1-3.8-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c.1 0 .2 0 .3 0-.1.1-.1.2-.2.4-.3.6-.1 1.4.5 1.7.6.3 1.4.1 1.7-.5.2-.5.5-1 .7-1.5.5.2 1 .3 1.5.2-.5 1.2-1.5 2.1-2.7 2.4-3 .6-5.5-1.7-5.5-4.4 0-1.9 1.2-3.5 3-4.2.3-3.2 3-5.7 6.3-5.7 3.5 0 6.3 2.9 6.3 6.5 0 .3 0 .5-.1.8z" fill="#00A2ED"/>
                      </svg>
                      Continue with Microsoft
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      className="text-indigo-600 text-sm hover:underline focus:outline-none" 
                      onClick={()=>setActiveTab('login')}
                    >
                      Already have an account? Log In
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="px-8 py-4 border-t border-gray-100 dark:border-gray-800/60">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center w-full">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
