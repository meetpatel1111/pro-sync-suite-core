
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingFallbackProps {
  message?: string;
  timeout?: number; // Add timeout option in milliseconds
  onTimeout?: () => void; // Callback when timeout occurs
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading...", 
  timeout = 10000, // Default 10 second timeout
  onTimeout 
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    // Set a timeout to show a retry option if loading takes too long
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      if (onTimeout) onTimeout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {isTimedOut && (
        <div className="flex flex-col items-center mt-4">
          <p className="text-amber-600 mb-2">This is taking longer than expected.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadingFallback;
