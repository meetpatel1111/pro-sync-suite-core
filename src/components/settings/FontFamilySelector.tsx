
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Type, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const FONT_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handwriting' },
];

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  value,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const googleFonts = await GoogleFontsService.getPopularFonts();
        console.log('Loaded fonts:', googleFonts.length);
        setFonts(googleFonts);
        setFilteredFonts(googleFonts);
      } catch (error) {
        console.error('Error loading fonts:', error);
        const defaultFonts = GoogleFontsService.getDefaultFonts();
        setFonts(defaultFonts);
        setFilteredFonts(defaultFonts);
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    let filtered = [...fonts];

    // Filter by category first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(font => font.category === selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(font => 
        font.family.toLowerCase().includes(query)
      );
    }

    console.log('Filtered fonts:', filtered.length, 'from', fonts.length, 'total fonts');
    setFilteredFonts(filtered);
  }, [fonts, selectedCategory, searchQuery]);

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
      case 'sans-serif': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'serif': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'monospace': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'display': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'handwriting': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
      <PopoverContent className="w-[500px] p-0" align="start">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="p-3 border-b">
            <TabsList className="grid grid-cols-6 w-full h-8">
              {FONT_CATEGORIES.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="text-xs px-2"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search fonts..." 
              className="h-9" 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No fonts found.</CommandEmpty>
            <CommandList className="max-h-[400px]">
              <CommandGroup>
                {filteredFonts.map((font) => (
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
                        className="text-lg text-muted-foreground"
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

          {/* Font count indicator */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filteredFonts.length} font{filteredFonts.length !== 1 ? 's' : ''} available
              </span>
              <span className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {selectedCategory !== 'all' && `${selectedCategory}`}
                {searchQuery && `"${searchQuery}"`}
              </span>
            </div>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
