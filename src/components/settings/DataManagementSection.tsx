
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  Shield, 
  Zap,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';

const DATA_TYPES = [
  { id: 'tasks', name: 'Tasks & Projects', size: '2.3 MB', count: 1250 },
  { id: 'time_entries', name: 'Time Entries', size: '890 KB', count: 3420 },
  { id: 'expenses', name: 'Expenses & Budgets', size: '156 KB', count: 89 },
  { id: 'files', name: 'Files & Documents', size: '45.2 MB', count: 234 },
  { id: 'messages', name: 'Chat Messages', size: '8.9 MB', count: 5670 },
];

const RETENTION_PERIODS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '3 months' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: 'never', label: 'Never delete' },
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
  { value: 'json', label: 'JSON', description: 'Developer friendly' },
  { value: 'pdf', label: 'PDF', description: 'Print ready reports' },
];

export const DataManagementSection = () => {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (dataType: string, format: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    console.log(`Exporting ${dataType} as ${format}`);
  };

  const handleBulkArchive = (dataType: string) => {
    console.log(`Archiving old ${dataType}`);
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>
            View your data usage and manage storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Storage Used</span>
              <span className="text-sm text-muted-foreground">57.4 MB of 1 GB</span>
            </div>
            <Progress value={5.74} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {DATA_TYPES.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{type.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {type.count} items • {type.size}
                    </p>
                  </div>
                  <Badge variant="secondary">{type.size}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download your data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isExporting && (
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Exporting your data... {exportProgress}%</p>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXPORT_FORMATS.map((format) => (
              <div key={format.value} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{format.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{format.description}</p>
                
                <Select>
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">All Data</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={isExporting}
                  onClick={() => handleExport('all', format.value)}
                >
                  Export {format.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>
            Configure how long data is kept before automatic deletion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DATA_TYPES.map((type) => (
            <div key={type.id} className="flex items-center justify-between py-3">
              <div>
                <Label className="text-sm font-medium">{type.name}</Label>
                <p className="text-xs text-muted-foreground">
                  Currently: {type.count} items
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select defaultValue="365">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RETENTION_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkArchive(type.id)}
                >
                  Archive Now
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Backup & Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup & Sync
          </CardTitle>
          <CardDescription>
            Configure data backup and synchronization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Automatic Backups</Label>
              <p className="text-xs text-muted-foreground">
                Create daily backups of your data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Real-time Sync</Label>
              <p className="text-xs text-muted-foreground">
                Keep data synchronized across devices
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Last Backup</Label>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">2 hours ago</span>
              </div>
              <Badge variant="secondary">Complete</Badge>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Latest Backup
          </Button>
        </CardContent>
      </Card>

      {/* Connected Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connected Services
          </CardTitle>
          <CardDescription>
            Manage integrations and third-party connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <div>
                <p className="text-sm font-medium">Slack Integration</p>
                <p className="text-xs text-muted-foreground">Sync notifications and updates</p>
              </div>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm font-medium">Zapier</p>
                <p className="text-xs text-muted-foreground">Automate workflows</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium">Google Workspace</p>
                <p className="text-xs text-muted-foreground">Calendar and drive sync</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Privacy & Compliance
          </CardTitle>
          <CardDescription>
            Manage your data rights and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You have the right to request deletion of your personal data. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Request Data Export
            </Button>
            
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
