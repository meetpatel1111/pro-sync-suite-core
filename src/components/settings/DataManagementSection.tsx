
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
import { useSettings } from '@/context/SettingsContext';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const DATA_TYPES = [
  { id: 'tasks', name: 'Tasks & Projects', size: '2.3 MB', count: 1250 },
  { id: 'timeEntries', name: 'Time Entries', size: '890 KB', count: 3420 },
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
] as const;

export const DataManagementSection = () => {
  const { settings, updateSetting, updateNestedSetting, loading } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleAutoBackupToggle = async (enabled: boolean) => {
    await updateSetting('autoBackup', enabled);
  };

  const handleRealtimeSyncToggle = async (enabled: boolean) => {
    await updateSetting('realtimeSync', enabled);
  };

  const handleRetentionChange = async (dataType: string, period: string) => {
    await updateNestedSetting('dataRetention', dataType, period);
    
    toast({
      title: 'Success',
      description: `Retention period for ${dataType} updated to ${period === 'never' ? 'never delete' : period + ' days'}`,
    });
  };

  const handleExport = async (dataType: string, format: typeof EXPORT_FORMATS[number]['value']) => {
    if (!user) return;

    setIsExporting(true);
    setExportProgress(0);
    
    try {
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
      
      const result = await settingsService.exportData(user.id, format);
      
      toast({
        title: 'Export Complete',
        description: `Your ${dataType} data has been exported successfully`,
      });
      
      // In a real app, this would trigger a download
      if (result.downloadUrl && result.downloadUrl !== '#') {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkArchive = async (dataType: string) => {
    if (!user) return;

    try {
      const retentionDays = parseInt(settings.dataRetention[dataType as keyof typeof settings.dataRetention] || '365');
      const result = await settingsService.archiveData(user.id, dataType, retentionDays);
      
      toast({
        title: 'Archive Complete',
        description: `${result.archivedCount || 0} items archived successfully`,
      });
    } catch (error) {
      toast({
        title: 'Archive Failed',
        description: 'Failed to archive data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your data? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        // In a real app, this would call a secure data deletion endpoint
        console.log('Deleting all user data...');
        toast({
          title: 'Data Deletion Requested',
          description: 'Your data deletion request has been submitted and will be processed within 30 days.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit data deletion request',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">Loading data management settings...</div>;
  }

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
                <Select 
                  value={settings.dataRetention[type.id as keyof typeof settings.dataRetention] || '365'}
                  onValueChange={(value) => handleRetentionChange(type.id, value)}
                >
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
            <Switch 
              checked={settings.autoBackup}
              onCheckedChange={handleAutoBackupToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Real-time Sync</Label>
              <p className="text-xs text-muted-foreground">
                Keep data synchronized across devices
              </p>
            </div>
            <Switch 
              checked={settings.realtimeSync}
              onCheckedChange={handleRealtimeSyncToggle}
            />
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
            <Button 
              variant="outline"
              onClick={() => handleExport('all', 'json')}
            >
              <Download className="h-4 w-4 mr-2" />
              Request Data Export
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleDeleteAllData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
