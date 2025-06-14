
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Globe, 
  Clock, 
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const RECENT_SESSIONS = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'New York, US',
    ip: '192.168.1.1',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'New York, US',
    ip: '192.168.1.2',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: '3',
    device: 'Chrome on MacOS',
    location: 'San Francisco, US',
    ip: '10.0.0.1',
    lastActive: '2 days ago',
    current: false
  },
];

export const SecuritySettingsSection = () => {
  const { settings, updateSetting, loading } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast({
        title: 'Error',
        description: 'Please enter your current password',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: 'Error',
        description: 'Password is too weak. Please choose a stronger password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // In a real app, this would call a secure password change endpoint
      console.log('Changing password...');
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    await updateSetting('twoFactorAuth', enabled);
    
    if (enabled) {
      toast({
        title: 'Two-Factor Authentication',
        description: 'Please scan the QR code with your authenticator app',
      });
    } else {
      toast({
        title: 'Two-Factor Authentication',
        description: 'Two-factor authentication has been disabled',
      });
    }
  };

  const handleAutoLogoutToggle = async (enabled: boolean) => {
    await updateSetting('autoLogout', enabled);
  };

  const handleLoginNotificationsToggle = async (enabled: boolean) => {
    await updateSetting('loginNotifications', enabled);
  };

  const handleSensitiveActionsToggle = async (enabled: boolean) => {
    await updateSetting('requirePasswordForSensitive', enabled);
  };

  const handleLogoutAllDevices = async () => {
    try {
      // In a real app, this would invalidate all sessions except current
      console.log('Logging out from all devices...');
      toast({
        title: 'Success',
        description: 'Logged out from all devices successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout from all devices',
        variant: 'destructive',
      });
    }
  };

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      console.log(`Logging out device: ${sessionId}`);
      toast({
        title: 'Success',
        description: 'Device logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout device',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Your account security status and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Strong Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 rounded-lg ${
              settings.twoFactorAuth 
                ? 'bg-green-50 dark:bg-green-950' 
                : 'bg-yellow-50 dark:bg-yellow-950'
            }`}>
              {settings.twoFactorAuth ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {settings.twoFactorAuth ? '2FA Enabled' : '2FA Recommended'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {settings.twoFactorAuth ? 'Extra security active' : 'Add extra security'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">3 Active Sessions</p>
                <p className="text-xs text-muted-foreground">Across your devices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password & Authentication
          </CardTitle>
          <CardDescription>
            Manage your password and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={handleTwoFactorToggle}
              />
            </div>
            
            {settings.twoFactorAuth && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is enabled. You'll need your authenticator app to sign in.
                  <Button variant="link" className="h-auto p-0 ml-2">
                    View recovery codes
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Change Password */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Change Password</Label>
            
            <div className="space-y-3 max-w-md">
              <div>
                <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <Label htmlFor="new-password" className="text-sm">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            passwordStrength < 25 ? 'bg-red-500' :
                            passwordStrength < 50 ? 'bg-yellow-500' :
                            passwordStrength < 75 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {passwordStrength < 25 ? 'Weak' :
                         passwordStrength < 50 ? 'Fair' :
                         passwordStrength < 75 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                className="w-full"
                disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices and browsers with access to your account
              </CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogoutAllDevices}>
              Logout All Devices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_SESSIONS.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="secondary">Current Session</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {session.lastActive}
                    </p>
                  </div>
                </div>
                
                {!session.current && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLogoutDevice(session.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription>
            Configure additional security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-logout on inactivity</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sign out after 1 hour of inactivity
              </p>
            </div>
            <Switch 
              checked={settings.autoLogout}
              onCheckedChange={handleAutoLogoutToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Login notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when someone signs into your account
              </p>
            </div>
            <Switch 
              checked={settings.loginNotifications}
              onCheckedChange={handleLoginNotificationsToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Require password for sensitive actions</Label>
              <p className="text-xs text-muted-foreground">
                Confirm your password before changing security settings
              </p>
            </div>
            <Switch 
              checked={settings.requirePasswordForSensitive}
              onCheckedChange={handleSensitiveActionsToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
