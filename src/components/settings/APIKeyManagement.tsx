
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { AIService } from '@/services/aiService';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const APIKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('gemini_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const testApiKey = async (keyId: string, keyValue: string) => {
    try {
      setIsLoading(true);
      const isValid = await AIService.testApiKey(keyValue);
      setTestResults(prev => ({ ...prev, [keyId]: isValid }));
      
      toast({
        title: isValid ? "API Key Valid" : "API Key Invalid",
        description: isValid ? "The API key is working correctly" : "The API key is not valid or has insufficient permissions",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResults(prev => ({ ...prev, [keyId]: false }));
      toast({
        title: "Test Failed",
        description: "Unable to test the API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addApiKey = async () => {
    if (!newKey.trim()) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gemini_api_keys')
        .insert({
          api_key: newKey,
          provider: 'google_gemini'
        })
        .select()
        .single();

      if (error) throw error;

      setApiKeys(prev => [data, ...prev]);
      setNewKey('');
      
      toast({
        title: "API Key Added",
        description: "Your API key has been saved successfully",
      });
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "Error",
        description: "Failed to save the API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('gemini_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete the API key",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string, show: boolean) => {
    if (show) return key;
    return key.slice(0, 8) + '...' + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for AI services like Google Gemini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-key">Add New API Key</Label>
              <Input
                id="new-key"
                type="password"
                placeholder="Enter your Google Gemini API key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <Button 
              onClick={addApiKey} 
              disabled={!newKey.trim() || isLoading}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API keys are encrypted and stored securely. They are only used for AI-powered features within the app.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{key.provider}</Badge>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {maskKey(key.api_key, showKeys[key.id])}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility(key.id)}
                  >
                    {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults[key.id] !== undefined && (
                    <Badge variant={testResults[key.id] ? "default" : "destructive"}>
                      {testResults[key.id] ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Invalid</>
                      )}
                    </Badge>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testApiKey(key.id, key.api_key)}
                    disabled={isLoading}
                  >
                    Test
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {apiKeys.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No API keys configured. Add one above to enable AI features.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeyManagement;
