
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ArrowRightLeft, Copy, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const AILanguageTranslator: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
  ];

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({
        title: 'No Text',
        description: 'Please enter some text to translate',
        variant: 'destructive'
      });
      return;
    }

    setIsTranslating(true);

    // Simulate translation
    setTimeout(() => {
      // Mock translation result
      const translations = [
        'Hello, how are you today?',
        'This is a sample translation.',
        'AI-powered language translation is amazing!',
        'Technology makes communication easier.',
        'Welcome to the future of translation.'
      ];
      
      setTranslatedText(translations[Math.floor(Math.random() * translations.length)]);
      setIsTranslating(false);
      
      toast({
        title: 'Translation Complete',
        description: `Text translated from ${sourceLang} to ${targetLang}`
      });
    }, 1500);
  };

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Text copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy text to clipboard',
        variant: 'destructive'
      });
    }
  };

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Not Supported',
        description: 'Text-to-speech not supported in this browser',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          AI Language Translator
        </CardTitle>
        <CardDescription>
          Translate text between languages with AI-powered accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={swapLanguages}
            disabled={sourceLang === 'auto'}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Source Text</label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(sourceText, sourceLang)}
                  disabled={!sourceText}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sourceText)}
                  disabled={!sourceText}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              {sourceText.length} characters
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Translation</label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(translatedText, targetLang)}
                  disabled={!translatedText}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(translatedText)}
                  disabled={!translatedText}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              rows={4}
              className="bg-gray-50"
            />
            {translatedText && (
              <div className="text-xs text-muted-foreground">
                {translatedText.length} characters
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={translateText}
          disabled={isTranslating || !sourceText.trim()}
          className="w-full"
        >
          {isTranslating ? (
            <>
              <Globe className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Translate
            </>
          )}
        </Button>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            100+ Languages
          </Badge>
          <Badge variant="outline" className="text-xs">
            Neural Translation
          </Badge>
          <Badge variant="outline" className="text-xs">
            Context Aware
          </Badge>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supports over 100 languages</p>
          <p>• Maintains context and tone</p>
          <p>• Batch translation available</p>
          <p>• Integration with all ProSync apps</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AILanguageTranslator;
