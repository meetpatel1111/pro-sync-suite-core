import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Palette, Monitor, Type, Layout, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { FontFamilySelector } from './FontFamilySelector';
import { GoogleFontsService } from '@/services/googleFontsService';

const THEMES = [
  { value: 'light', label: 'Light', description: 'Clean and bright interface' },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
  { value: 'system', label: 'System', description: 'Follow system preference' },
];

const UI_DENSITIES = [
  { value: 'compact', label: 'Compact', description: 'More content, less spacing' },
  { value: 'standard', label: 'Standard', description: 'Balanced layout' },
  { value: 'comfortable', label: 'Comfortable', description: 'More spacing, easier to read' },
];

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#dc2626', '#ea580c', 
  '#d97706', '#65a30d', '#059669', '#0891b2',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
];

const FONT_SIZE_PRESETS = [
  { value: 'xs', label: 'Extra Small', size: 12 },
  { value: 'sm', label: 'Small', size: 14 },
  { value: 'base', label: 'Base', size: 16 },
  { value: 'lg', label: 'Large', size: 18 },
  { value: 'xl', label: 'Extra Large', size: 20 },
  { value: '2xl', label: '2X Large', size: 24 },
];

// Helper function to convert hex to HSL
const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const AppearanceSettingsSection = () => {
  const { settings, updateSetting, loading } = useSettings();
  const [customColor, setCustomColor] = useState(settings.primaryColor || '#2563eb');
  const [customFontSize, setCustomFontSize] = useState(
    typeof settings.fontSize === 'number' ? settings.fontSize : 16
  );

  useEffect(() => {
    setCustomColor(settings.primaryColor || '#2563eb');
    if (typeof settings.fontSize === 'number') {
      setCustomFontSize(settings.fontSize);
    } else {
      // Convert legacy string values to numbers
      const legacyMap = { small: 14, medium: 16, large: 18 };
      setCustomFontSize(legacyMap[settings.fontSize as keyof typeof legacyMap] || 16);
    }
  }, [settings.primaryColor, settings.fontSize]);

  // Apply settings immediately when they change
  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply primary color
    if (settings.primaryColor) {
      const hslColor = hexToHsl(settings.primaryColor);
      document.documentElement.style.setProperty('--primary', hslColor);
    }

    // Apply font family - updated implementation
    if (settings.fontFamily) {
      const fontSlug = GoogleFontsService.getFontSlug(settings.fontFamily);
      const fontClass = `font-${fontSlug}`;
      
      // Remove existing font classes
      document.body.className = document.body.className.replace(/font-[\w-]+/g, '');
      
      // Add new font class
      document.body.classList.add(fontClass);
      
      // Set CSS custom property
      document.documentElement.style.setProperty('--font-family', `"${settings.fontFamily}", system-ui, -apple-system, sans-serif`);
      
      // Load the font if not already loaded
      GoogleFontsService.loadFont(settings.fontFamily);
    }

    // Apply font size
    const fontSize = typeof settings.fontSize === 'number' ? settings.fontSize : customFontSize;
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Apply animations
    if (!settings.animationsEnabled) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('transition-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('transition-duration');
    }

    // Apply UI density - remove existing density classes first
    document.documentElement.className = document.documentElement.className.replace(/density-\w+/g, '');
    if (settings.uiDensity) {
      document.documentElement.classList.add(`density-${settings.uiDensity}`);
    }
  }, [settings.theme, settings.primaryColor, settings.fontFamily, settings.fontSize, settings.animationsEnabled, settings.uiDensity, customFontSize]);

  const handleThemeChange = async (theme: string) => {
    await updateSetting('theme', theme);
  };

  const handleColorChange = async (color: string) => {
    setCustomColor(color);
    await updateSetting('primaryColor', color);
  };

  const handleFontFamilyChange = async (fontFamily: string) => {
    await updateSetting('fontFamily', fontFamily);
  };

  const handleAnimationsChange = async (enabled: boolean) => {
    await updateSetting('animationsEnabled', enabled);
  };

  const handleDensityChange = async (density: string) => {
    await updateSetting('uiDensity', density);
  };

  const handleFontSizeChange = async (fontSize: number | string) => {
    await updateSetting('fontSize', fontSize);
  };

  const handleSliderFontSizeChange = async (value: number[]) => {
    const newSize = value[0];
    setCustomFontSize(newSize);
    await handleFontSizeChange(newSize);
  };

  const currentFontSize = typeof settings.fontSize === 'number' ? settings.fontSize : customFontSize;

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading appearance settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme & Colors
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Color Theme</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <div
                  key={theme.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    settings.theme === theme.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleThemeChange(theme.value)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="h-4 w-4" />
                    <span className="font-medium">{theme.label}</span>
                    {settings.theme === theme.value && (
                      <Badge variant="secondary" className="ml-auto">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Primary Color */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Primary Color</Label>
            <div className="space-y-4">
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md border-2 ${
                      settings.primaryColor === color 
                        ? 'border-foreground scale-110' 
                        : 'border-transparent hover:scale-105'
                    } transition-transform`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
              
              <div className="flex items-center space-x-3">
                <Label htmlFor="custom-color">Custom:</Label>
                <input
                  id="custom-color"
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-muted-foreground">{customColor}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Font Settings */}
          <div className="space-y-6">
            {/* Font Family */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Family
              </Label>
              <FontFamilySelector
                value={settings.fontFamily || 'Inter'}
                onValueChange={handleFontFamilyChange}
              />
            </div>

            {/* Font Size - Enhanced */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Font Size</Label>
              
              {/* Preset Sizes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FONT_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-left ${
                      currentFontSize === preset.size
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleFontSizeChange(preset.size)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{preset.label}</span>
                      <span className="text-xs text-muted-foreground">{preset.size}px</span>
                    </div>
                    <p className="text-xs text-muted-foreground" style={{ fontSize: `${Math.min(preset.size, 14)}px` }}>
                      Sample text
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom Size Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Custom Size</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{currentFontSize}px</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFontSizeChange(16)}
                      className="text-xs px-2 py-1"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                
                <div className="px-2">
                  <Slider
                    value={[currentFontSize]}
                    onValueChange={handleSliderFontSizeChange}
                    min={10}
                    max={32}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10px</span>
                    <span>32px</span>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-2">Live Preview:</p>
                  <p style={{ fontSize: `${currentFontSize}px` }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* UI Density */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Interface Density</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {UI_DENSITIES.map((density) => (
                <div
                  key={density.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    settings.uiDensity === density.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleDensityChange(density.value)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Layout className="h-4 w-4" />
                    <span className="font-medium">{density.label}</span>
                    {settings.uiDensity === density.value && (
                      <Badge variant="secondary" className="ml-auto">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{density.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Enable Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Smooth transitions and micro-interactions
              </p>
            </div>
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={handleAnimationsChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings affect the interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <span className="font-medium">Sample Component</span>
              </div>
              <Badge>Preview</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              This is how components will look with your selected theme and colors.
            </p>
            <Button 
              size="sm" 
              className="transition-all duration-200"
              style={{ 
                backgroundColor: settings.primaryColor,
                borderColor: settings.primaryColor 
              }}
            >
              Sample Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
