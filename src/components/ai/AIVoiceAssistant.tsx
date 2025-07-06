
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const AIVoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();

  const toggleListening = () => {
    if (!isEnabled) {
      toast({
        title: 'Voice Assistant Disabled',
        description: 'Please enable microphone permissions to use voice features.',
        variant: 'destructive'
      });
      return;
    }

    setIsListening(!isListening);
    toast({
      title: isListening ? 'Stopped Listening' : 'Started Listening',
      description: isListening ? 'Voice input disabled' : 'Speak your command now...'
    });
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    toast({
      title: isSpeaking ? 'Audio Stopped' : 'Audio Started',
      description: isSpeaking ? 'Voice output disabled' : 'AI will now speak responses'
    });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          AI Voice Assistant
        </CardTitle>
        <CardDescription>
          Voice-enabled AI assistant for hands-free interaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isEnabled ? 'default' : 'destructive'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {isListening && (
              <Badge variant="outline" className="animate-pulse">
                Listening...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="outline" className="animate-pulse">
                Speaking...
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>

          <Button
            onClick={toggleSpeaking}
            variant={isSpeaking ? 'destructive' : 'outline'}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Say "Hey ProSync" to activate</p>
          <p>• Ask questions about your projects</p>
          <p>• Create tasks with voice commands</p>
          <p>• Get verbal summaries and reports</p>
        </div>

        {isListening && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Listening for voice commands...</span>
            </div>
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIVoiceAssistant;
