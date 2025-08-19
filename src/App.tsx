
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import TaskMaster from '@/pages/TaskMaster';
import TimeTrackPro from '@/pages/TimeTrackPro';
import BudgetBuddy from '@/pages/BudgetBuddy';
import CollabSpace from '@/pages/CollabSpace';
import FileVault from '@/pages/FileVault';
import ResourceHub from '@/pages/ResourceHub';
import ClientConnect from '@/pages/ClientConnect';
import RiskRadar from '@/pages/RiskRadar';
import ServiceCore from '@/pages/ServiceCore';
import KnowledgeNestPage from '@/pages/KnowledgeNestPage';
import SettingsPage from '@/pages/SettingsPage';
import AIFeatures from '@/pages/AIFeatures';
import PlanBoardPage from '@/pages/PlanBoardPage';
import TeamDirectoryPage from '@/pages/TeamDirectoryPage';
import Notifications from '@/pages/Notifications';
import ProfileSettings from '@/pages/ProfileSettings';
import Integrations from '@/pages/Integrations';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import About from '@/pages/About';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { IntegrationProvider } from '@/context/IntegrationContext';
import UniversalAIAssistant from '@/components/ai/UniversalAIAssistant';
import { AIContextProvider } from '@/components/ai/AIContextManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/taskmaster" element={<ProtectedRoute><TaskMaster /></ProtectedRoute>} />
      <Route path="/timetrackpro" element={<ProtectedRoute><TimeTrackPro /></ProtectedRoute>} />
      <Route path="/budgetbuddy" element={<ProtectedRoute><BudgetBuddy /></ProtectedRoute>} />
      <Route path="/collabspace" element={<ProtectedRoute><CollabSpace /></ProtectedRoute>} />
      <Route path="/filevault" element={<ProtectedRoute><FileVault /></ProtectedRoute>} />
      <Route path="/resourcehub" element={<ProtectedRoute><ResourceHub /></ProtectedRoute>} />
      <Route path="/clientconnect" element={<ProtectedRoute><ClientConnect /></ProtectedRoute>} />
      <Route path="/riskradar" element={<ProtectedRoute><RiskRadar /></ProtectedRoute>} />
      <Route path="/servicecore" element={<ProtectedRoute><ServiceCore /></ProtectedRoute>} />
      <Route path="/knowledgenest" element={<ProtectedRoute><KnowledgeNestPage /></ProtectedRoute>} />
      <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/planboard" element={<ProtectedRoute><PlanBoardPage /></ProtectedRoute>} />
      <Route path="/team-directory" element={<ProtectedRoute><TeamDirectoryPage /></ProtectedRoute>} />
      <Route path="/notification-center" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      
      {/* Catch all route - redirect to auth if not logged in, dashboard if logged in */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AuthProvider>
          <IntegrationProvider>
            <AIContextProvider>
              <Router>
                <AppRoutes />
                <UniversalAIAssistant />
              </Router>
            </AIContextProvider>
          </IntegrationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
