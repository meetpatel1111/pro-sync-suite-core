
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  Minimize2, 
  Maximize2, 
  X,
  Zap,
  Clock,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string[];
  intent?: string;
}

interface SmartAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
  category: string;
}

const UniversalAIAssistant: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const smartActions: SmartAction[] = [
    {
      id: 'tasks-today',
      label: 'Tasks due today',
      icon: <CheckSquare className="h-4 w-4" />,
      query: 'Show me all my tasks that are due today',
      category: 'TaskMaster'
    },
    {
      id: 'time-summary',
      label: 'Time summary',
      icon: <Clock className="h-4 w-4" />,
      query: 'Summarize my time tracking for this week',
      category: 'TimeTrackPro'
    },
    {
      id: 'budget-status',
      label: 'Budget overview',
      icon: <DollarSign className="h-4 w-4" />,
      query: 'What is my current budget status across all projects?',
      category: 'BudgetBuddy'
    },
    {
      id: 'recent-messages',
      label: 'Recent messages',
      icon: <MessageCircle className="h-4 w-4" />,
      query: 'Show me important messages from the last 24 hours',
      category: 'CollabSpace'
    },
    {
      id: 'project-status',
      label: 'Project status',
      icon: <Calendar className="h-4 w-4" />,
      query: 'Give me a status update on all my active projects',
      category: 'PlanBoard'
    },
    {
      id: 'high-risks',
      label: 'High risks',
      icon: <AlertTriangle className="h-4 w-4" />,
      query: 'What are the highest priority risks I need to address?',
      category: 'RiskRadar'
    }
  ];

  useEffect(() => {
    if (user) {
      checkApiKey();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (!user || !message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(user.id, message, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        context: ['user_data', 'cross_app']
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartAction = (action: SmartAction) => {
    sendMessage(action.query);
    setActiveTab('chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
        
        {isOpen && (
          <Card className="absolute bottom-16 right-0 w-80 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center gap-2 justify-center">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                AI Assistant requires a Google Gemini API key to provide intelligent assistance across all ProSync Suite apps.
              </p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg animate-pulse"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className={`absolute bottom-16 right-0 shadow-2xl border-0 transition-all duration-200 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                ProSync Suite
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 h-[calc(100%-4rem)] flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 m-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                        <p className="text-sm">
                          Hi! I'm your AI assistant for ProSync Suite. I can help you with tasks, projects, time tracking, and more across all your apps.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.context && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.context.map((ctx, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {ctx}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-900 max-w-[80%] p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your work..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => sendMessage(inputMessage)}
                        disabled={isLoading || !inputMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="flex-1 m-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                          Quick insights from across your ProSync Suite
                        </p>
                      </div>
                      
                      {smartActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          onClick={() => handleSmartAction(action)}
                          className="w-full justify-start h-auto p-4 text-left"
                          disabled={isLoading}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{action.icon}</div>
                            <div className="flex-1">
                              <p className="font-medium">{action.label}</p>
                              <p className="text-xs text-muted-foreground">{action.category}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default UniversalAIAssistant;
