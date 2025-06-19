
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image,
  Save,
  Eye,
  History
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onPreview?: () => void;
  onViewHistory?: () => void;
  placeholder?: string;
  showToolbar?: boolean;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSave,
  onPreview,
  onViewHistory,
  placeholder = "Start writing...",
  showToolbar = true,
  readOnly = false
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const handleTextareaSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selected = target.value.substring(target.selectionStart, target.selectionEnd);
    setSelectedText(selected);
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [content, onChange]);

  const toolbarActions = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Italic' },
    { icon: Underline, action: () => insertMarkdown('<u>', '</u>'), title: 'Underline' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), title: 'Link' },
    { icon: List, action: () => insertMarkdown('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. '), title: 'Numbered List' },
    { icon: Quote, action: () => insertMarkdown('> '), title: 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: 'Inline Code' },
    { icon: Image, action: () => insertMarkdown('![alt text](', ')'), title: 'Image' },
  ];

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^1\. (.*$)/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Card className="w-full">
      {showToolbar && !readOnly && (
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {toolbarActions.map(({ icon: Icon, action, title }, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action}
                  title={title}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {onViewHistory && (
                <Button variant="ghost" size="sm" onClick={onViewHistory}>
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              {onSave && (
                <Button size="sm" onClick={onSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        {isPreview ? (
          <div 
            className="p-4 min-h-96 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleTextareaSelect}
            placeholder={placeholder}
            className="min-h-96 border-0 resize-none focus-visible:ring-0 font-mono text-sm"
            readOnly={readOnly}
          />
        )}
      </CardContent>
      
      {showToolbar && (
        <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mr-2">
              {content.length} characters
            </Badge>
            <Badge variant="outline">
              {content.split('\n').length} lines
            </Badge>
          </div>
          <div>
            Supports Markdown formatting
          </div>
        </div>
      )}
    </Card>
  );
};

export default RichTextEditor;
