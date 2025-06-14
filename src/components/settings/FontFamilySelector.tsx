
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { GoogleFontsService } from '@/services/googleFontsService';

interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
}

interface FontFamilySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  value,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const googleFonts = await GoogleFontsService.getPopularFonts();
        setFonts(googleFonts);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFonts(GoogleFontsService.getDefaultFonts());
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  const handleFontSelect = (fontFamily: string) => {
    const selectedFont = fonts.find(f => f.family === fontFamily);
    if (selectedFont) {
      // Load the font from Google Fonts
      GoogleFontsService.loadFont(fontFamily, selectedFont.variants.slice(0, 3));
      onValueChange(fontFamily);
    }
    setOpen(false);
  };

  const selectedFont = fonts.find(f => f.family === value);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sans-serif': return 'bg-blue-100 text-blue-800';
      case 'serif': return 'bg-green-100 text-green-800';
      case 'monospace': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Type className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading fonts...</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3"
        >
          <div className="flex items-center space-x-2">
            <Type className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium" style={{ fontFamily: selectedFont?.family || 'inherit' }}>
                {selectedFont?.family || 'Select font...'}
              </span>
              {selectedFont && (
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getCategoryColor(selectedFont.category)}`}>
                    {selectedFont.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedFont.variants.length} variant{selectedFont.variants.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search fonts..." className="h-9" />
          <CommandEmpty>No fonts found.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {fonts.map((font) => (
                <CommandItem
                  key={font.family}
                  value={font.family}
                  onSelect={() => handleFontSelect(font.family)}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <span 
                        className="font-medium text-base"
                        style={{ fontFamily: font.family }}
                      >
                        {font.family}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(font.category)}`}>
                          {font.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {font.variants.length} variant{font.variants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: font.family }}
                    >
                      Aa
                    </span>
                    <Check
                      className={`h-4 w-4 ${
                        value === font.family ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
