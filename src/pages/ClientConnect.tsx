
import React from 'react';
import { Users, MessageCircle, Calendar, Globe, Handshake, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ClientConnect = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-sky-100 bg-clip-text">
                  ClientConnect
                </h1>
                <p className="text-lg text-sky-100/90 font-medium">Client & Stakeholder Engagement Platform</p>
              </div>
            </div>
            
            <p className="text-lg text-sky-50/95 max-w-3xl mb-6 leading-relaxed">
              Build stronger relationships with clients through seamless communication, 
              project transparency, feedback management, and collaborative engagement tools.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                Client Portal
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Handshake className="h-4 w-4 mr-2" />
                Relationship Management
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                Meeting Scheduler
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Engagement Analytics
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>ClientConnect Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Client Engagement</h3>
                <p className="text-muted-foreground">
                  Your client and stakeholder engagement tools will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientConnect;
