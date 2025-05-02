// Update import statements
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import dbService from '@/services/dbService';
import { Label } from "@/components/ui/label";

const Auth = () => {
  const [type, setType] = useState("sign-in")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Signed in successfully',
        description: 'You have been signed in to your account',
      })
      navigate('/')
    } catch (error) {
      console.error('Sign-in error:', error)
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
          },
        },
      })
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Signed up successfully',
        description: 'Please check your email to verify your account',
      })
      navigate('/')
    } catch (error) {
      console.error('Sign-up error:', error)
      toast({
        title: 'Sign up failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomSignIn = async () => {
    setLoading(true);
    try {
      // Hash the password
      const hashedPassword = await dbService.hashPassword(password);

      // Check if the user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (fetchError) {
        toast({
          title: 'Sign in failed',
          description: 'User not found',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verify the password
      const isValidPassword = await dbService.verifyCustomPassword(existingUser.id, password);

      if (!isValidPassword) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid credentials',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create a custom user object
      const customUser = {
        id: existingUser.id,
        email: email,
        full_name: email.split('@')[0],
        customAuth: true,
      };

      // Store the custom user in localStorage
      localStorage.setItem('customUser', JSON.stringify(customUser));

      toast({
        title: 'Signed in successfully',
        description: 'You have been signed in to your account',
      });

      navigate('/');
    } catch (error) {
      console.error('Custom sign-in error:', error);
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSignUp = async () => {
    setLoading(true);
    try {
      // Hash the password
      const hashedPassword = await dbService.hashPassword(password);

      // Check if the user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast({
          title: 'Sign up failed',
          description: 'User already exists',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create a new user in the profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: email.split('@')[0],
          full_name: email.split('@')[0]
        });

      if (profileError) {
        toast({
          title: 'Sign up failed',
          description: profileError.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create a custom user object
      const customUser = {
        id: email.split('@')[0],
        email: email,
        full_name: email.split('@')[0],
        customAuth: true,
      };

      // Store the custom user in localStorage
      localStorage.setItem('customUser', JSON.stringify(customUser));

      toast({
        title: 'Signed up successfully',
        description: 'You have been signed up to your account',
      });

      navigate('/');
    } catch (error) {
      console.error('Custom sign-up error:', error);
      toast({
        title: 'Sign up failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative flex h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {type === "sign-in" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type === "sign-in"
              ? "Enter your email and password to sign in"
              : "Enter your email and password to create an account"}
          </p>
        </div>
        <Card className="border-0">
          <CardHeader className="space-y-0">
            <CardTitle>{type === "sign-in" ? "Sign In" : "Sign Up"}</CardTitle>
            <CardDescription>
              {type === "sign-in"
                ? "Enter your credentials to access your account."
                : "Create a new account to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <Button
              className="w-full"
              onClick={type === "sign-in" ? handleCustomSignIn : handleCustomSignUp}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                type === "sign-in" ? "Sign In" : "Sign Up"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              {type === "sign-in" ? (
                <>
                  Don't have an account?{" "}
                  <Link
                    to="/auth"
                    onClick={() => setType("sign-up")}
                    className="text-blue-500 hover:underline"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    to="/auth"
                    onClick={() => setType("sign-in")}
                    className="text-blue-500 hover:underline"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
