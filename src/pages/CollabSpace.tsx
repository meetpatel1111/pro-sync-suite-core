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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-6 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 mb-6 text-muted-foreground hover:text-foreground" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                CollabSpace
              </h1>
              <p className="text-lg text-muted-foreground">Team communication & collaboration platform</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button size="sm" onClick={handleCreateChannel} className="gap-2 shadow-md">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1 bg-gradient-to-br from-card to-card/50 border-border/50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Spaces</h3>
                  <Button variant="ghost" size="sm" onClick={handleCreateChannel} className="h-8 w-8 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search messages..." 
                    className="pl-10 bg-background/50 border-border/50 focus:bg-background"
                  />
                </div>
                
                <Tabs defaultValue="channels" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
                    <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
                    <TabsTrigger value="direct" className="text-xs">Direct</TabsTrigger>
                    <TabsTrigger value="meetings" className="text-xs">Meetings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="channels" className="m-0">
                    <ScrollArea className="h-[450px] pr-2">
                      <div className="space-y-2">
                        {loading ? (
                          <div className="p-6 text-center">
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        ) : channels.length === 0 ? (
                          <div className="p-6 text-center space-y-3">
                            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">No channels yet</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
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
                              className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                                selectedChannel?.id === channel.id 
                                  ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                                  : 'hover:bg-secondary/50 border border-transparent'
                              }`}
                              onClick={() => setSelectedChannel(channel)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="font-medium"># {channel.name}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">3</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="direct" className="m-0">
                    <ScrollArea className="h-[450px] pr-2">
                      <div className="space-y-2">
                        {[
                          { name: "Sarah Chen", avatar: "SC", status: "online" },
                          { name: "Alex Johnson", avatar: "AJ", status: "online", unread: 2 },
                          { name: "Miguel Patel", avatar: "MP", status: "online" },
                          { name: "Jamie Davis", avatar: "JD", status: "offline" }
                        ].map((user, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="https://github.com/shadcn.png" />
                                  <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                                  user.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                                }`}></div>
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                            {user.unread && (
                              <Badge variant="destructive" className="text-xs">{user.unread}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="meetings" className="m-0">
                    <ScrollArea className="h-[450px] pr-2">
                      <div className="space-y-4">
                        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Daily Standup</h4>
                            <Badge variant="outline" className="bg-white">10:00 AM</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">15 minutes • Recurring</p>
                          <div className="flex -space-x-2">
                            {["SC", "AJ", "MP"].map((initial, idx) => (
                              <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                              </Avatar>
                            ))}
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">+3</div>
                          </div>
                        </Card>
                        
                        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Project Review</h4>
                            <Badge variant="outline" className="bg-white">2:30 PM</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">45 minutes • Today</p>
                          <div className="flex -space-x-2">
                            {["SC", "AJ"].map((initial, idx) => (
                              <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                              </Avatar>
                            ))}
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">+2</div>
                          </div>
                        </Card>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
            
            <Card className="lg:col-span-2 overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedChannel ? `# ${selectedChannel.name}` : 'Select a channel'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChannel ? `${channelMembers.length} members • 3 online` : 'No channel selected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {[Search, Bell, Users].map((Icon, idx) => (
                    <Button key={idx} variant="ghost" size="icon" className="h-9 w-9">
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="h-[520px] bg-gradient-to-b from-background/50 to-background">
                <ChatInterface channelId={selectedChannel?.id} />
              </div>
            </Card>
            
            <Card className="lg:col-span-1 bg-gradient-to-br from-card to-card/50 border-border/50">
              <div className="p-6">
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
                    <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
                    <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
                    <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="m-0 space-y-6">
                    {selectedChannel ? (
                      <>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base">Description</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg">
                            {selectedChannel.about || selectedChannel.description || 
                             `${selectedChannel.name} - No description available.`}
                          </p>
                        </div>
                        
                        <Separator className="bg-border/50" />
                        
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base">Pinned Messages</h3>
                          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                            <p className="font-medium text-sm">@everyone Important Update</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              All team members should update their project status before EOD Friday...
                            </p>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-200">
                              <span className="text-xs text-muted-foreground">Alex Johnson</span>
                              <span className="text-xs text-muted-foreground">Yesterday</span>
                            </div>
                          </Card>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 space-y-3">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Select a channel to view details</p>
                      </div>
                    )}
                    
                    <Separator className="bg-border/50" />
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base">Upcoming Events</h3>
                      <div className="space-y-3">
                        {[
                          { title: "Team Meeting", time: "Today, 2:00 PM" },
                          { title: "Project Deadline", time: "Friday, Apr 15" }
                        ].map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.time}</p>
                            </div>
                          </div>
                        ))}
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
