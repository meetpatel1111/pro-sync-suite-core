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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">ProSync Suite</CardTitle>
            <CardDescription>
              Login or create an account to access the complete suite of productivity tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="login">Login</TabsTrigger>
    <TabsTrigger value="signup">Sign Up</TabsTrigger>
  </TabsList>
              <TabsContent value="login">
              {/* Login Form */}
              <div className="flex gap-2 mb-2">
                <label>
                  <input
                    type="radio"
                    name="loginAuthType"
                    value="supabase"
                    checked={loginAuthType === 'supabase'}
                    onChange={() => setLoginAuthType('supabase')}
                  />{' '}
                  Supabase Email Auth
                </label>
                <label>
                  <input
                    type="radio"
                    name="loginAuthType"
                    value="custom"
                    checked={loginAuthType === 'custom'}
                    onChange={() => setLoginAuthType('custom')}
                  />{' '}
                  Custom Password
                </label>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      tabIndex={-1}
                        className="ml-2 text-xs text-gray-500 focus:outline-none"
                        aria-label={loginShowPw ? 'Hide password' : 'Show password'}
                        onClick={() => setLoginShowPw(v => !v)}
                      >
                        {loginShowPw ? '🙈' : '👁️'}
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
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} className="accent-blue-600"/>
                      Remember Me
                    </label>
                    <button type="button" className="text-blue-600 text-xs hover:underline" onClick={()=>navigate('/forgot-password')}>Forgot Password?</button>
                  </div>
                  <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={!loginEmail || !loginPassword || loading} aria-busy={loading}>
                    {loading && <span className="loader" aria-label="Loading"/>}
                    Login
                  </Button>
                  <div className="my-4 flex items-center gap-2">
                    <hr className="flex-1 border-gray-200"/>
                    <span className="text-gray-400 text-xs">OR</span>
                    <hr className="flex-1 border-gray-200"/>
                  </div>
                  {/* OAuth placeholder */}
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" className="oauth-btn google">Continue with Google</Button>
                    <Button type="button" variant="outline" className="oauth-btn microsoft">Continue with Microsoft</Button>
                  </div>
                  {/* Magic link placeholder */}
                  <div className="text-center mt-2">
                    <button type="button" className="text-blue-600 text-xs hover:underline" onClick={()=>alert('Magic link coming soon!')}>Email me a magic link</button>
                  </div>
                  {/* 2FA placeholder */}
                  <div className="text-center mt-2 text-xs text-gray-400">2FA coming soon</div>
                </form>
              </TabsContent>

                            <TabsContent value="signup">
                {/* Signup Form */}
                <div className="flex gap-2 mb-2">
  <label>
    <input type="radio" name="signupAuthType" value="supabase" checked={signupAuthType==='supabase'} onChange={()=>setSignupAuthType('supabase')} /> Supabase Email Auth
  </label>
  <label>
    <input type="radio" name="signupAuthType" value="custom" checked={signupAuthType==='custom'} onChange={()=>setSignupAuthType('custom')} /> Custom Password
  </label>
</div>
<form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupName">Full Name</Label>
                    <Input 
                      id="signupName" 
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input 
                      id="signupEmail" 
                      type="email" 
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signupPassword" 
                        type={signupShowPw ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-describedby="pw-rules"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={signupShowPw ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-2 text-gray-500"
                        onClick={() => setSignupShowPw(v => !v)}
                      >
                        {signupShowPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div id="pw-rules" className="mt-2 text-xs">
                      {passwordRules.map((r,i)=>(
                        <span key={i} className={r.test(signupPassword)?'text-green-600 mr-2':'text-gray-400 mr-2'}>
                          {r.test(signupPassword)?'✅':'⬜'} {r.label}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 text-xs">
                      Password strength: <span className={
                        passwordStrength(signupPassword)===0?'text-red-500':
                        passwordStrength(signupPassword)<3?'text-yellow-500':'text-green-600'
                      }>{['Very weak','Weak','Okay','Strong','Very strong'][passwordStrength(signupPassword)]}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupConfirm">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="signupConfirm"
                        type={signupShowConfirm ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-invalid={signupConfirm && signupPassword!==signupConfirm}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={signupShowConfirm ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-2 text-gray-500"
                        onClick={() => setSignupShowConfirm(v => !v)}
                      >
                        {signupShowConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {signupConfirm && signupPassword!==signupConfirm && <span className="text-red-500 text-xs">Passwords do not match</span>}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
  <input type="checkbox" checked={signupAgreed} onChange={e=>setSignupAgreed(e.target.checked)} className="accent-blue-600" required/>
  I agree to the <a href="/terms" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">Terms of Service</a> & <a href="/privacy" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
</label>
                  {/* CAPTCHA placeholder */}
                  <div className="text-center mt-2 text-xs text-gray-400">CAPTCHA coming soon</div>
                  <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={!signupName || !signupEmail || !signupPassword || !signupConfirm || !signupAgreed || signupPassword!==signupConfirm || !passwordRules.every(r=>r.test(signupPassword)) || loading} aria-busy={loading}>
                    {loading && <span className="loader" aria-label="Loading"/>}
                    Create Account
                  </Button>
                  <div className="my-4 flex items-center gap-2">
                    <hr className="flex-1 border-gray-200"/>
                    <span className="text-gray-400 text-xs">OR</span>
                    <hr className="flex-1 border-gray-200"/>
                  </div>
                  {/* OAuth placeholder */}
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" className="oauth-btn google">Continue with Google</Button>
                    <Button type="button" variant="outline" className="oauth-btn microsoft">Continue with Microsoft</Button>
                  </div>
                  <div className="text-center mt-2">
                    <button type="button" className="text-blue-600 text-sm hover:underline" onClick={()=>setActiveTab('login')}>Already have an account? Log In</button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground mt-2 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
