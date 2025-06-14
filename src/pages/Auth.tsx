import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Shield } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();

  // Field validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (activeTab === "login") {
      if (!password) {
        setPasswordError("Password is required");
        return false;
      }
      setPasswordError("");
      return true;
    }

    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (activeTab === "signup" && password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || !validatePassword() || !validateConfirmPassword()) {
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions required",
        description: "Please accept the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup successful",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?passwordReset=true`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link",
        });
        setForgotPasswordMode(false);
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveForm = () => {
    if (forgotPasswordMode) {
      return (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email address below and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`pl-10 transition-all duration-200 ${emailError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full hover:bg-muted/50 transition-colors"
              onClick={() => setForgotPasswordMode(false)}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      );
    }
    
    return (
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger 
            value="login" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all duration-200"
          >
            Login
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all duration-200"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="mt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`pl-10 transition-all duration-200 ${emailError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={() => setForgotPasswordMode(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 transition-all duration-200 ${passwordError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </p>}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="remember-me" className="text-sm text-muted-foreground">Remember me</Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Log In
                </div>
              )}
            </Button>
            
            <div className="text-center text-xs text-muted-foreground">
              By logging in, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" onClick={(e) => {
                e.preventDefault();
                alert("Terms of Service would open here");
              }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" onClick={(e) => {
                e.preventDefault();
                alert("Privacy Policy would open here");
              }}>
                Privacy Policy
              </a>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="signup" className="mt-6">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="signup-fullname" className="text-sm font-medium">Full Name</Label>
              <Input
                id="signup-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="transition-all duration-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`pl-10 transition-all duration-200 ${emailError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 transition-all duration-200 ${passwordError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </p>}
              <PasswordStrengthMeter password={password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 transition-all duration-200 ${confirmPasswordError ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPasswordError && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {confirmPasswordError}
              </p>}
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I accept the{" "}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" onClick={(e) => {
                  e.preventDefault();
                  alert("Terms of Service would open here");
                }}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" onClick={(e) => {
                  e.preventDefault();
                  alert("Privacy Policy would open here");
                }}>
                  Privacy Policy
                </a>
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            ProSync Suite
          </h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Welcome to your comprehensive project management workspace
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            {getActiveForm()}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Shield className="h-4 w-4" />
            <span>Secure & encrypted authentication</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Need help? <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
