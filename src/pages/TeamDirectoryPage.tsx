
import React from 'react';
import { Users, Network, UserCheck, Globe, Building, Star, Heart, Sparkles } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TeamDirectory from '@/components/TeamDirectory';
import { Badge } from '@/components/ui/badge';

const TeamDirectoryPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-rose-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
              <div className="relative p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-bounce-soft">
                <Users className="h-8 w-8 animate-heartbeat" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-rose-100 to-purple-100 bg-clip-text animate-shimmer">Team Directory</h1>
                <p className="text-xl text-rose-100/95 font-semibold animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                  Connect & Collaborate 
                  <Heart className="h-5 w-5 text-red-300 animate-heartbeat" />
                </p>
              </div>
            </div>
            
            <p className="text-rose-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Discover and connect with your team members across all projects and departments.
              Find expertise, share knowledge, and build stronger working relationships through our intelligent networking platform.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Network className="h-5 w-5 mr-3 animate-wiggle" />
                Team Network
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <UserCheck className="h-5 w-5 mr-3 animate-wiggle" />
                Skill Matching
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Building className="h-5 w-5 mr-3 animate-wiggle" />
                Department Views
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-rubber-band">
                <Sparkles className="h-5 w-5 mr-3 animate-wiggle" />
                Expert Directory
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <TeamDirectory />
        </div>
      </div>
    </AppLayout>
  );
};

export default TeamDirectoryPage;
