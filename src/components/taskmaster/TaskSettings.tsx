
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Save, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const TaskSettings = () => {
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your task settings have been saved successfully"
    });
  };
  
  const handleResetData = () => {
    localStorage.removeItem('tasks');
    setIsResetDialogOpen(false);
    
    toast({
      title: "Data reset",
      description: "All task data has been reset. Refresh the page to see the changes."
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="labels">Labels & Categories</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your task management preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="defaultView" />
                  <Label htmlFor="defaultView">Use board view as default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showCompleted" defaultChecked />
                  <Label htmlFor="showCompleted">Show completed tasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoArchive" />
                  <Label htmlFor="autoArchive">Auto-archive completed tasks after 30 days</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultPriority">Default task priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="defaultPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultProject">Default project</Label>
                <Select defaultValue="project1">
                  <SelectTrigger id="defaultProject">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Website Redesign</SelectItem>
                    <SelectItem value="project2">Mobile App</SelectItem>
                    <SelectItem value="project3">Marketing Campaign</SelectItem>
                    <SelectItem value="project4">Database Migration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Manage your project categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  {/* Project list */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <span>Website Redesign</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                      <span>Mobile App</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                      <span>Marketing Campaign</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                      <span>Database Migration</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input placeholder="New project name" />
                <Select defaultValue="blue">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members for task assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  {/* Team member list */}
                  <div className="flex items-center justify-between">
                    <span>Alex Johnson</span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jamie Smith</span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taylor Lee</span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Morgan Chen</span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input placeholder="New team member name" className="flex-1" />
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emailTaskAssigned" defaultChecked />
                    <Label htmlFor="emailTaskAssigned">When a task is assigned to me</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emailTaskDue" defaultChecked />
                    <Label htmlFor="emailTaskDue">When a task is due soon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emailTaskCompleted" />
                    <Label htmlFor="emailTaskCompleted">When a task is completed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emailTaskCommented" defaultChecked />
                    <Label htmlFor="emailTaskCommented">When someone comments on my task</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appTaskAssigned" defaultChecked />
                    <Label htmlFor="appTaskAssigned">When a task is assigned to me</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appTaskDue" defaultChecked />
                    <Label htmlFor="appTaskDue">When a task is due soon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appTaskStatusChanged" defaultChecked />
                    <Label htmlFor="appTaskStatusChanged">When a task status changes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appTaskCommented" defaultChecked />
                    <Label htmlFor="appTaskCommented">When someone comments on my task</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Task reminder time</Label>
                <Select defaultValue="1day">
                  <SelectTrigger id="reminderTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6hours">6 hours before due</SelectItem>
                    <SelectItem value="12hours">12 hours before due</SelectItem>
                    <SelectItem value="1day">1 day before due</SelectItem>
                    <SelectItem value="2days">2 days before due</SelectItem>
                    <SelectItem value="1week">1 week before due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your task data and exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download your task data in various formats for backup or analysis.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline">Export as CSV</Button>
                  <Button variant="outline">Export as JSON</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import task data from CSV or JSON files.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline">Import Data</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Reset Data</h3>
                <p className="text-sm text-muted-foreground">
                  Clear all task data and start fresh. This action cannot be undone.
                </p>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirm Data Reset
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reset all task data? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleResetData}>
                        Yes, Reset All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskSettings;
