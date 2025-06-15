
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const APIKeyManagement: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (user) {
      checkExistingApiKey();
    }
  }, [user]);

  const checkExistingApiKey = async () => {
    if (!user) return;
    
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasExistingKey(hasKey);
    } catch (error) {
      console.error('Error checking API key:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!user || !apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await aiService.saveApiKey(user.id, apiKey.trim());
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Google Gemini API key saved successfully'
        });
        setHasExistingKey(true);
        setApiKey(''); // Clear the input for security
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API key. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage your Google Gemini API key to enable AI features across ProSync Suite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Gemini API Key Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Google Gemini API Key</h4>
              <p className="text-sm text-muted-foreground">
                Required for AI chat, task suggestions, and productivity insights
              </p>
            </div>
            {hasExistingKey && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configured
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="gemini-api-key">API Key</Label>
            <div className="relative">
              <Input
                id="gemini-api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasExistingKey ? '••••••••••••••••' : 'AIza...'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveApiKey}
                disabled={isLoading || !apiKey.trim()}
                size="sm"
              >
                {isLoading ? 'Saving...' : hasExistingKey ? 'Update Key' : 'Save Key'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Security Notice
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Your API key is encrypted and stored securely. It's only used to make requests to Google Gemini on your behalf. 
                  You can revoke access anytime by removing the key from your Google AI Studio account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Status */}
        {hasExistingKey && (
          <div className="space-y-4">
            <h4 className="font-medium">Available AI Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">AI Chat Assistant</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Task Suggestions</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Productivity Insights</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeyManagement;
