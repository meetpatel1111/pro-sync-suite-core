
import React from 'react';
import { FolderLock, Upload, Shield, Search, Share2, Archive } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FileVault = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <FolderLock className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-100 bg-clip-text">
                  FileVault
                </h1>
                <p className="text-lg text-purple-100/90 font-medium">Secure Document & File Management</p>
              </div>
            </div>
            
            <p className="text-lg text-purple-50/95 max-w-3xl mb-6 leading-relaxed">
              Secure file storage and management with advanced encryption, version control, 
              intelligent search, and collaborative sharing for teams and organizations.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Secure Storage
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Upload className="h-4 w-4 mr-2" />
                Easy Upload
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Search className="h-4 w-4 mr-2" />
                Smart Search
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2">
                <Archive className="h-4 w-4 mr-2" />
                Version Control
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-scale-in">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>FileVault Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <FolderLock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">File Management</h3>
                <p className="text-muted-foreground">
                  Your secure file storage and management features will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default FileVault;
