
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import { AuthProvider } from '@/context/AuthContext';
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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AuthProvider>
          <IntegrationProvider>
            <AIContextProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/taskmaster" element={<TaskMaster />} />
                  <Route path="/timetrackpro" element={<TimeTrackPro />} />
                  <Route path="/budgetbuddy" element={<BudgetBuddy />} />
                  <Route path="/collabspace" element={<CollabSpace />} />
                  <Route path="/filevault" element={<FileVault />} />
                  <Route path="/resourcehub" element={<ResourceHub />} />
                  <Route path="/clientconnect" element={<ClientConnect />} />
                  <Route path="/riskradar" element={<RiskRadar />} />
                  <Route path="/servicecore" element={<ServiceCore />} />
                  <Route path="/knowledgenest" element={<KnowledgeNestPage />} />
                  <Route path="/ai-features" element={<AIFeatures />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/planboard" element={<PlanBoardPage />} />
                  <Route path="/team-directory" element={<TeamDirectoryPage />} />
                  <Route path="/notification-center" element={<Notifications />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/about" element={<About />} />
                </Routes>
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
