
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IntegrationProvider } from "@/context/IntegrationContext";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
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
