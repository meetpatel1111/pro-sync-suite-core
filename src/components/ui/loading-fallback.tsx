
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingFallbackProps {
  message?: string;
  timeout?: number; // Add timeout option in milliseconds
  onTimeout?: () => void; // Callback when timeout occurs
  retryAction?: () => void; // Optional retry action
  showTimeoutIndicator?: boolean; // Controls whether to show countdown indicator
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading...", 
  timeout = 15000, // Increase default timeout to 15 seconds
  onTimeout,
  retryAction,
  showTimeoutIndicator = true
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to show a retry option if loading takes too long
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      setIsLoading(false);
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
      setIsLoading(true);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full">
      {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />}
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {timeWaiting >= 5000 && !isTimedOut && showTimeoutIndicator && (
        <p className="text-amber-500 mb-2">
          Still loading... {Math.ceil((timeout - timeWaiting) / 1000)}s remaining
        </p>
      )}
      
      {isTimedOut && (
        <div className="flex flex-col items-center mt-4">
          <p className="text-amber-600 mb-2">Loading timed out. Please try again.</p>
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
