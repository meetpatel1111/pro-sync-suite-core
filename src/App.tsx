
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IntegrationProvider } from "@/context/IntegrationContext";
import { AuthProvider } from "@/context/AuthContext";
import { useAuthContext } from "@/context/AuthContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TaskMaster from "./pages/TaskMaster";
import TimeTrackPro from "./pages/TimeTrackPro";
import CollabSpace from "./pages/CollabSpace";
import PlanBoard from "./pages/PlanBoard";
import FileVault from "./pages/FileVault";
import BudgetBuddy from "./pages/BudgetBuddy";
import InsightIQ from "./pages/InsightIQ";
import ClientConnect from "./pages/ClientConnect";
import RiskRadar from "./pages/RiskRadar";
import ResourceHub from "./pages/ResourceHub";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";
import UserSettings from "./pages/UserSettings";
import Notifications from "./pages/Notifications";
import { useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // If auth loading takes too long, we'll show the user a way to proceed
  useEffect(() => {
    // If loading is already false, no need to set up timeout
    if (!loading) return;
    
    // Set a longer timeout for the initial auth check
    const timeoutId = setTimeout(() => {
      console.log("Auth loading timed out, redirecting to auth page");
      setLoadingTimedOut(true);
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // If not loading or already timed out and no user, redirect to auth
  if ((!loading || loadingTimedOut) && !user) {
    console.log("No authenticated user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Show loading state only if we're still loading and haven't timed out
  if (loading && !loadingTimedOut) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingFallback 
          message="Loading user information..." 
          timeout={8000}
          onTimeout={() => {
            console.log("Loading user timed out");
            setLoadingTimedOut(true);
          }}
        />
      </div>
    );
  }

  // If we reach here, user is authenticated
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <IntegrationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                {/* Make Index route protected */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/taskmaster" 
                  element={
                    <ProtectedRoute>
                      <TaskMaster />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/timetrackpro" element={<ProtectedRoute><TimeTrackPro /></ProtectedRoute>} />
                <Route path="/collabspace" element={<ProtectedRoute><CollabSpace /></ProtectedRoute>} />
                <Route path="/planboard" element={<ProtectedRoute><PlanBoard /></ProtectedRoute>} />
                <Route path="/filevault" element={<ProtectedRoute><FileVault /></ProtectedRoute>} />
                <Route path="/budgetbuddy" element={<ProtectedRoute><BudgetBuddy /></ProtectedRoute>} />
                <Route path="/insightiq" element={<ProtectedRoute><InsightIQ /></ProtectedRoute>} />
                <Route path="/clientconnect" element={<ProtectedRoute><ClientConnect /></ProtectedRoute>} />
                <Route path="/riskradar" element={<ProtectedRoute><RiskRadar /></ProtectedRoute>} />
                <Route path="/resourcehub" element={<ProtectedRoute><ResourceHub /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </IntegrationProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
