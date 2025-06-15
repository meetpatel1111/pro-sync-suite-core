
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Key, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

const APIKeyManagement: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      checkExistingApiKey();
    }
  }, [user]);

  const checkExistingApiKey = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('openai_api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setHasApiKey(true);
        setApiKey(data.api_key);
      } else {
        setHasApiKey(false);
        setApiKey('');
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!user || !apiKey.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('openai_api_keys')
        .upsert({
          user_id: user.id,
          api_key: apiKey.trim(),
          provider: 'openai'
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) throw error;

      setHasApiKey(true);
      toast({
        title: 'API Key Saved',
        description: 'Your OpenAI API key has been saved successfully. AI features are now available.',
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API key. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!user || !confirm('Are you sure you want to delete your API key? This will disable all AI features.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('openai_api_keys')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHasApiKey(false);
      setApiKey('');
      toast({
        title: 'API Key Deleted',
        description: 'Your OpenAI API key has been removed. AI features are now disabled.',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage your OpenAI API key to enable AI-powered features throughout ProSync Suite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {hasApiKey ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">AI Features Enabled</p>
                  <p className="text-sm text-muted-foreground">Your API key is configured and ready to use</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">AI Features Disabled</p>
                  <p className="text-sm text-muted-foreground">Add your OpenAI API key to enable AI features</p>
                </div>
              </>
            )}
          </div>
          <Badge variant={hasApiKey ? 'default' : 'secondary'}>
            {hasApiKey ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* API Key Input Section */}
        <div className="space-y-4">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={hasApiKey && !showApiKey ? maskApiKey(apiKey) : apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || isSaving}
              size="sm"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is encrypted and stored securely. Get your API key from the{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        {/* AI Features List */}
        <div className="space-y-3">
          <h4 className="font-medium">Available AI Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'AI Chat Assistant',
              'Smart Task Suggestions',
              'Productivity Insights',
              'Task Description Optimization',
              'Project Summaries',
              'Automated Recommendations'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delete API Key */}
        {hasApiKey && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Remove API Key</h4>
                <p className="text-sm text-muted-foreground">
                  This will disable all AI features until you add a new key
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteApiKey}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>Deleting...</>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeyManagement;
