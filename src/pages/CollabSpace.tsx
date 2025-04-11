
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Plus, Phone, Video, FileText, Smile, Paperclip, Search, MoreHorizontal, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import TeamDirectory from '@/components/TeamDirectory';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const CollabSpace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">CollabSpace</h1>
          <p className="text-muted-foreground">Team communication and collaboration tools</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Meeting
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Channel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <Card className="p-4 lg:col-span-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search messages..." 
                className="pl-8"
              />
            </div>
          </div>
          
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
              <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
              <TabsTrigger value="mentions" className="flex-1">Mentions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="channels" className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">#</span>
                  <span>general</span>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">3</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer bg-accent">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">#</span>
                  <span>project-alpha</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">#</span>
                  <span>design-team</span>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">8</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">#</span>
                  <span>dev-team</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">#</span>
                  <span>marketing</span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="w-full justify-start mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </TabsContent>
            
            <TabsContent value="direct" className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src="/avatar-1.png" />
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                  <span>Alex Kim</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src="/avatar-2.png" />
                    <AvatarFallback>ML</AvatarFallback>
                  </Avatar>
                  <span>Morgan Lee</span>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">1</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src="/avatar-3.png" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span>Jordan Smith</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              
              <Button variant="ghost" size="sm" className="w-full justify-start mt-2">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </TabsContent>
            
            <TabsContent value="mentions" className="mt-4">
              <div className="text-center p-4 text-muted-foreground">
                <p>No recent mentions</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Main content area */}
        <Card className="p-4 lg:col-span-3">
          <Tabs defaultValue="chat" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Users className="h-4 w-4" />
                  <span>12</span>
                </Button>
                <Button variant="ghost" size="icon" size-sm>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="chat" className="mt-0 space-y-4">
              <div className="flex items-center mb-4">
                <div className="text-lg font-semibold mr-2"># project-alpha</div>
                <Badge variant="outline">12 members</Badge>
              </div>
              
              <ChatInterface />
              
              <div className="flex gap-2 items-center mt-4">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <Input 
                    placeholder="Type a message..." 
                    className="pr-10"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold"># project-alpha Files</div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Project Requirements.docx</p>
                    <p className="text-sm text-muted-foreground">2.4 MB · Shared by Alex Kim</p>
                  </div>
                </Card>
                
                <Card className="p-4 flex items-center space-x-4">
                  <div className="bg-emerald-100 p-3 rounded">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Design Assets.zip</p>
                    <p className="text-sm text-muted-foreground">15.8 MB · Shared by Morgan Lee</p>
                  </div>
                </Card>
                
                <Card className="p-4 flex items-center space-x-4">
                  <div className="bg-amber-100 p-3 rounded">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Timeline.pdf</p>
                    <p className="text-sm text-muted-foreground">1.2 MB · Shared by Alex Kim</p>
                  </div>
                </Card>
                
                <Card className="p-4 flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Budget Overview.xlsx</p>
                    <p className="text-sm text-muted-foreground">0.8 MB · Shared by Jordan Smith</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold"># project-alpha Tasks</div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
              
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Design system implementation</h3>
                    <Badge>High Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Implement the new design system across all pages of the application.</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="/avatar-2.png" />
                        <AvatarFallback>ML</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Assigned to Morgan Lee</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Due Apr 25</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">API integration planning</h3>
                    <Badge>Medium Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Plan the integration points for the new API services.</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="/avatar-3.png" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Assigned to Jordan Smith</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Due Apr 28</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">User feedback survey</h3>
                    <Badge>Low Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Prepare and distribute user feedback survey for the beta release.</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="/avatar-1.png" />
                        <AvatarFallback>AK</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Assigned to Alex Kim</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Due May 5</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="mt-0">
              <div className="text-lg font-semibold mb-4"># project-alpha Team</div>
              <TeamDirectory />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
