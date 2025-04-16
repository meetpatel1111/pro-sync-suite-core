
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingFallbackProps {
  message?: string;
  timeout?: number; // Add timeout option in milliseconds
  onTimeout?: () => void; // Callback when timeout occurs
  retryAction?: () => void; // Optional retry action
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading...", 
  timeout = 10000, // Default 10 second timeout
  onTimeout,
  retryAction
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeWaiting, setTimeWaiting] = useState(0);

  useEffect(() => {
    // Set a timeout to show a retry option if loading takes too long
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      if (onTimeout) onTimeout();
    }, timeout);

    // Update time waiting every second
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1000);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [timeout, onTimeout]);

  // Handle retry action
  const handleRetry = () => {
    if (retryAction) {
      retryAction();
      setIsTimedOut(false);
      setTimeWaiting(0);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {timeWaiting >= 5000 && !isTimedOut && (
        <p className="text-amber-500 mb-2">Still loading... Please wait</p>
      )}
      
      {isTimedOut && (
        <div className="flex flex-col items-center mt-4">
          <p className="text-amber-600 mb-2">This is taking longer than expected.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetry}
          >
            {retryAction ? 'Retry' : 'Refresh Page'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadingFallback;
