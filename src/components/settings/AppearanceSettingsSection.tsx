
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Palette, Monitor, Type, Layout, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

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

const FONT_SIZES = [
  { value: 'small', label: 'Small', size: '14px' },
  { value: 'medium', label: 'Medium', size: '16px' },
  { value: 'large', label: 'Large', size: '18px' },
];

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#dc2626', '#ea580c', 
  '#d97706', '#65a30d', '#059669', '#0891b2',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
];

export const AppearanceSettingsSection = () => {
  const { settings, updateSetting, loading } = useSettings();
  const [customColor, setCustomColor] = useState(settings.primaryColor || '#2563eb');

  useEffect(() => {
    setCustomColor(settings.primaryColor || '#2563eb');
  }, [settings.primaryColor]);

  const handleThemeChange = async (theme: string) => {
    await updateSetting('theme', theme);
    
    // Apply theme to document root for immediate effect
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleColorChange = async (color: string) => {
    setCustomColor(color);
    await updateSetting('primaryColor', color);
    
    // Apply color to CSS custom property for immediate effect
    document.documentElement.style.setProperty('--primary', color);
  };

  const handleAnimationsChange = async (enabled: boolean) => {
    await updateSetting('animationsEnabled', enabled);
    
    // Apply animation preference for immediate effect
    if (!enabled) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  };

  const handleDensityChange = async (density: string) => {
    await updateSetting('uiDensity', density);
    
    // Apply density class for immediate effect
    document.documentElement.className = document.documentElement.className
      .replace(/density-\w+/g, '') + ` density-${density}`;
  };

  const handleFontSizeChange = async (fontSize: string) => {
    await updateSetting('fontSize', fontSize);
    
    // Apply font size for immediate effect
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize as keyof typeof fontSizeMap]);
  };

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

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FONT_SIZES.map((font) => (
                <div
                  key={font.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    settings.fontSize === font.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleFontSizeChange(font.value)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{font.label}</span>
                    {settings.fontSize === font.value && (
                      <Badge variant="secondary" className="ml-auto">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ fontSize: font.size }}>
                    Sample text
                  </p>
                </div>
              ))}
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
            <Button size="sm" style={{ backgroundColor: settings.primaryColor }}>
              Sample Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
