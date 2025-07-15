
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
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
import { AuthProvider } from '@/context/AuthContext';
import UniversalAIAssistant from '@/components/ai/UniversalAIAssistant';
import { AIContextProvider } from '@/components/ai/AIContextManager';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <AIContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
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
            </Routes>
            <UniversalAIAssistant />
          </Router>
        </AIContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
