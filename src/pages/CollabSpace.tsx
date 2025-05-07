
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, MessageSquare, Users, Video, Calendar, Send, Paperclip, Smile, Bell, Filter, ChevronDown, FileIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInterface from '@/components/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Channel, ChannelMember } from '@/utils/dbtypes';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CollabSpace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching channels:", error);
          toast({
            title: "Error",
            description: "Failed to load channels",
            variant: "destructive",
          });
        } else {
          setChannels(data as Channel[]);
          // Select the first channel by default
          if (data && data.length > 0) {
            setSelectedChannel(data[0]);
          }
        }
      } catch (error) {
        console.error("Exception fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
    
    // Subscribe to channel changes
    const channelsSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'channels',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChannels(prev => [...prev, payload.new as Channel]);
        } else if (payload.eventType === 'UPDATE') {
          setChannels(prev => 
            prev.map(ch => 
              ch.id === payload.new.id ? payload.new as Channel : ch
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => 
            prev.filter(ch => ch.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channelsSubscription);
    };
  }, [toast]);
  
  useEffect(() => {
    if (!selectedChannel) return;
    
    const fetchChannelMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members')
          .select('*')
          .eq('channel_id', selectedChannel.id);
          
        if (error) {
          console.error("Error fetching channel members:", error);
        } else {
          setChannelMembers(data as ChannelMember[]);
        }
      } catch (error) {
        console.error("Exception fetching channel members:", error);
      }
    };
    
    fetchChannelMembers();
  }, [selectedChannel]);

  const handleCreateChannel = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a channel",
        variant: "destructive",
      });
      return;
    }
    
    const channelName = prompt("Enter channel name:");
    if (!channelName) return;
    
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          created_by: user.id,
        })
        .select();
        
      if (error) {
        console.error("Error creating channel:", error);
        toast({
          title: "Error",
          description: "Failed to create channel",
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        // Join the channel immediately
        const { error: joinError } = await supabase
          .from('channel_members')
          .insert({
            channel_id: data[0].id,
            user_id: user.id,
          });
          
        if (joinError) {
          console.error("Error joining channel:", joinError);
        }
        
        setSelectedChannel(data[0]);
        toast({
          title: "Success",
          description: `Channel "${channelName}" created`,
        });
      }
    } catch (error) {
      console.error("Exception creating channel:", error);
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a channel",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
        });
        
      if (error) {
        console.error("Error joining channel:", error);
        toast({
          title: "Error",
          description: "Failed to join channel",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Joined channel successfully",
        });
      }
    } catch (error) {
      console.error("Exception joining channel:", error);
    }
  };
  
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
          <p className="text-muted-foreground">Team communication & collaboration platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" onClick={handleCreateChannel}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Spaces</h3>
            <Button variant="ghost" size="sm" onClick={handleCreateChannel}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search messages..." 
              className="pl-8"
            />
          </div>
          
          <Tabs defaultValue="channels">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="direct">Direct</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="channels" className="m-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {loading ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Loading channels...</p>
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No channels yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleCreateChannel}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Channel
                      </Button>
                    </div>
                  ) : (
                    channels.map(channel => (
                      <div 
                        key={channel.id}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          selectedChannel?.id === channel.id 
                            ? 'bg-secondary' 
                            : 'hover:bg-secondary/50'
                        } cursor-pointer`}
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                          <span># {channel.name}</span>
                        </div>
                        <Badge variant="secondary">3</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="direct" className="m-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <span>Sarah Chen</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md bg-secondary cursor-pointer">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <span>Alex Johnson</span>
                    </div>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <span>Miguel Patel</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span>Jamie Davis</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="meetings" className="m-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Daily Standup</h4>
                      <Badge variant="outline">10:00 AM</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">15 minutes • Recurring</p>
                    <div className="flex -space-x-2">
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">+3</div>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Project Review</h4>
                      <Badge variant="outline">2:30 PM</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">45 minutes • Today</p>
                    <div className="flex -space-x-2">
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">+2</div>
                    </div>
                  </Card>
                  
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
        
        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <div className="mr-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">
                  {selectedChannel ? `# ${selectedChannel.name}` : 'Select a channel'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedChannel ? `${channelMembers.length} members • 3 online` : 'No channel selected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="h-[500px]">
            <ChatInterface channelId={selectedChannel?.id} />
          </div>
        </Card>
        
        <Card className="p-4 lg:col-span-1">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="m-0 space-y-4">
              {selectedChannel ? (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChannel.about || selectedChannel.description || 
                       `${selectedChannel.name} - No description available.`}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Pinned Messages</h3>
                    <Card className="p-3 text-sm">
                      <p className="font-medium">@everyone Important Update</p>
                      <p className="text-muted-foreground">
                        All team members should update their project status before EOD Friday...
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">Alex Johnson</span>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </Card>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Select a channel to view details
                </p>
              )}
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Upcoming Events</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Team Meeting</p>
                      <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Project Deadline</p>
                      <p className="text-xs text-muted-foreground">Friday, Apr 15</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="members" className="m-0">
              <div className="mb-4 flex items-center justify-between">
                <div className="relative w-full mr-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search members..." 
                    className="pl-8 w-full"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Online</DropdownMenuItem>
                    <DropdownMenuItem>Offline</DropdownMenuItem>
                    <DropdownMenuItem>All Members</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Sarah Chen</p>
                        <p className="text-xs text-muted-foreground">Product Manager</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Alex Johnson</p>
                        <p className="text-xs text-muted-foreground">Team Lead</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Miguel Patel</p>
                        <p className="text-xs text-muted-foreground">Designer</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Jamie Davis</p>
                        <p className="text-xs text-muted-foreground">Developer</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>TW</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Taylor Wong</p>
                        <p className="text-xs text-muted-foreground">Developer</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="files" className="m-0">
              <div className="mb-4 flex items-center justify-between">
                <div className="relative w-full mr-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search files..." 
                    className="pl-8 w-full"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  <Card className="p-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 flex items-center justify-center rounded-md mr-3">
                        <FileIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Project Proposal.docx</p>
                        <p className="text-xs text-muted-foreground">1.4 MB • Yesterday</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 flex items-center justify-center rounded-md mr-3">
                        <FileIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Q2 Budget.xlsx</p>
                        <p className="text-xs text-muted-foreground">3.2 MB • Apr 10</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-amber-100 flex items-center justify-center rounded-md mr-3">
                        <FileIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Client Presentation.pptx</p>
                        <p className="text-xs text-muted-foreground">8.7 MB • Apr 8</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-red-100 flex items-center justify-center rounded-md mr-3">
                        <FileIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Design Assets.zip</p>
                        <p className="text-xs text-muted-foreground">24.2 MB • Apr 5</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
