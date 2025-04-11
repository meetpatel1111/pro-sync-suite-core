
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

interface AppPlaceholderProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

const AppPlaceholder = ({ title, description, comingSoon = true }: AppPlaceholderProps) => {
  const navigate = useNavigate();

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
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 md:p-12">
        <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
        
        {comingSoon ? (
          <div className="mt-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>
        ) : null}
        
        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-3 w-full max-w-3xl">
          <div className="h-32 rounded-lg bg-accent animate-pulse-slow"></div>
          <div className="h-32 rounded-lg bg-accent animate-pulse-slow delay-150"></div>
          <div className="h-32 rounded-lg bg-accent animate-pulse-slow delay-300"></div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppPlaceholder;
