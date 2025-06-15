
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Copyright, Shield, Lock, Award, Zap, Sparkles } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();
  const { user } = useAuthContext();
  
  const handleBackClick = () => {
    // If user came from auth page or is not authenticated, go back to auth
    if (!user || location.state?.from === 'auth') {
      navigate('/auth');
    } else {
      navigate('/');
    }
  };

  const content = (
    <div className="space-y-8 animate-fade-in-up">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 mb-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          {user ? `Back to ${t('dashboard')}` : 'Back to Login'}
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              About ProSync Suite
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Proprietary project management platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50">
            <Copyright className="h-3 w-3 mr-1" />
            Proprietary Software
          </Badge>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/50">
            <Award className="h-3 w-3 mr-1" />
            Enterprise Grade
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
            Version 2.0
          </Badge>
        </div>
      </div>
      
      <Card className="modern-card shadow-xl border-0">
        <CardContent className="p-8 lg:p-12">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Proprietary Technology</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ProSync Suite is a proprietary project management platform developed exclusively for enterprise-level organizations. This software contains intellectual property, trade secrets, and proprietary algorithms that are protected by copyright and intellectual property laws.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Copyright className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Copyright Notice</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  © 2025 ProSync Technologies. All rights reserved. This software and its source code are the exclusive property of ProSync Technologies. No part of this software may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright owner.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Licensing & Usage</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  This software is licensed, not sold. Your use of ProSync Suite is governed by the licensing agreement provided upon installation or subscription. Unauthorized copying, modification, distribution, or reverse engineering of this software is strictly prohibited and may result in legal action.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Intellectual Property</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All trademarks, service marks, trade names, logos, and other intellectual property rights used in connection with ProSync Suite are the property of ProSync Technologies or their respective owners. The software includes proprietary features, algorithms, and methodologies developed through extensive research and development.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Enterprise Features</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ProSync Suite incorporates advanced project management methodologies, AI-powered analytics, real-time collaboration tools, and enterprise-grade security features. These capabilities represent years of development and refinement, making it a comprehensive solution for complex organizational needs.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Technology Stack</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Built on cutting-edge technologies including React, TypeScript, and advanced cloud infrastructure, ProSync Suite delivers exceptional performance, scalability, and reliability. The platform utilizes proprietary optimization techniques and custom-built components designed specifically for enterprise workflows.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground m-0">Company Information</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ProSync Technologies is a leading software development company specializing in enterprise project management solutions. Founded with the mission to revolutionize how organizations manage complex projects, we combine innovative technology with deep industry expertise to deliver unparalleled value to our clients.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-3 mb-3">
                <Copyright className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 m-0">Legal Notice</h3>
              </div>
              <p className="text-purple-800 dark:text-purple-200 m-0">
                This software is protected by copyright law and international treaties. Unauthorized reproduction or distribution of this software, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // If user is not authenticated, show without AppLayout
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return <AppLayout>{content}</AppLayout>;
};

export default About;
