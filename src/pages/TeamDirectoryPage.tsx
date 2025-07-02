
import React from 'react';
import { Users, Network, UserCheck, Globe, Building, Star } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import TeamDirectory from '@/components/TeamDirectory';
import { Badge } from '@/components/ui/badge';

const TeamDirectoryPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-violet-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
                <p className="text-lg text-violet-100/90 font-medium">Connect & Collaborate</p>
              </div>
            </div>
            
            <p className="text-violet-50/95 max-w-3xl mb-4 leading-relaxed">
              Discover and connect with your team members across all projects and departments.
              Find expertise, share knowledge, and build stronger working relationships.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Network className="h-4 w-4 mr-2" />
                Team Network
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <UserCheck className="h-4 w-4 mr-2" />
                Skill Matching
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Building className="h-4 w-4 mr-2" />
                Department Views
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Star className="h-4 w-4 mr-2" />
                Expert Directory
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          <TeamDirectory />
        </div>
      </div>
    </AppLayout>
  );
};

export default TeamDirectoryPage;
