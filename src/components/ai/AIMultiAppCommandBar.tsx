
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, Zap, Loader2, Brain, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const AIMultiAppCommandBar: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (user) {
      checkApiKey();
    }
  }, [user]);

  const checkApiKey = async () => {
    if (!user) return;
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const processCommand = async () => {
    if (!user || !command.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a command',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const prompt = `You are a multi-app command processor for ProSync Suite. Parse this natural language command and determine what actions should be taken across different apps (TaskMaster, PlanBoard, CollabSpace, FileVault, BudgetBuddy, etc.).

Command: "${command}"

Respond with JSON in this format:
{
  "intent": "create_task|schedule_meeting|send_message|update_budget|etc",
  "actions": [
    {
      "app": "TaskMaster|PlanBoard|CollabSpace|etc",
      "action": "specific action to take",
      "parameters": {"key": "value"}
    }
  ],
  "summary": "Plain language summary of what will be done"
}`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        setResults([parsed]);
      } catch (parseError) {
        setResults([{
          intent: 'general_command',
          actions: [{
            app: 'General',
            action: 'Process command',
            parameters: { response: response.substring(0, 200) }
          }],
          summary: 'Command processed successfully'
        }]);
      }
      
      toast({
        title: 'Command Processed',
        description: 'AI has interpreted your multi-app command'
      });
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: 'Processing Error',
        description: error instanceof Error ? error.message : 'Failed to process command',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      processCommand();
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            AI Multi-App Command Bar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Multi-App Command Bar requires a Google Gemini API key to process natural language commands.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Command className="h-5 w-5" />
          AI Multi-App Command Bar (Copilot)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Create task 'Review proposal' for John, schedule meeting tomorrow 2pm, notify team in CollabSpace..."
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={processCommand} 
            disabled={isProcessing || !command.trim()}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Examples: "Create urgent task for Sarah", "Schedule project review next Friday", "Add $500 to marketing budget"</p>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="space-y-2">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <CheckCircle className="h-3 w-3" />
                  Command Interpreted
                </Badge>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium mb-2">{result.summary}</p>
                  <div className="space-y-2">
                    {result.actions?.map((action: any, actionIndex: number) => (
                      <div key={actionIndex} className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{action.app}</Badge>
                        <span>{action.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMultiAppCommandBar;
