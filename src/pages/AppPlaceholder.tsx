
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Rocket, Zap } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AppPlaceholderProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export const AppPlaceholder = ({ title, description, comingSoon = true }: AppPlaceholderProps) => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Modern Placeholder Content */}
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-32 h-32 mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-2xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-full animate-bounce delay-300"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
            
            {comingSoon && (
              <div className="flex justify-center">
                <Badge className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white border-0 shadow-lg">
                  <Rocket className="h-4 w-4 mr-2" />
                  Coming Soon
                </Badge>
              </div>
            )}
          </div>
          
          {/* Feature Preview Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 w-full max-w-4xl mt-12">
            <Card className="modern-card h-40 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-center">Smart Features</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">AI-powered capabilities</p>
              </CardContent>
            </Card>

            <Card className="modern-card h-40 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 delay-75">
              <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-center">Lightning Fast</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Optimized performance</p>
              </CardContent>
            </Card>

            <Card className="modern-card h-40 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 delay-150">
              <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-center">Modern Interface</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Beautiful and intuitive</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="px-8 py-3 text-lg hover:bg-primary hover:text-white transition-all duration-300 border-2 hover:border-primary"
            >
              Explore Other Apps
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppPlaceholder;
