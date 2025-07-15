import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
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
import { AuthProvider } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import LegalPage from '@/pages/LegalPage';
import AccountSettings from '@/components/settings/AccountSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DataSettings from '@/components/settings/DataSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import AICommandPalette from '@/components/ai/AICommandPalette';
import AIMultiAppCommandBar from '@/components/ai/AIMultiAppCommandBar';
import UniversalAIAssistant from '@/components/ai/UniversalAIAssistant';
import { AIContextProvider } from '@/components/ai/AIContextManager';

function App() {
  return (
    <QueryClient>
      <Toaster />
      <AuthProvider>
        <AIContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/legal" element={<LegalPage />} />
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
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/account" element={<AccountSettings />} />
              <Route path="/settings/appearance" element={<AppearanceSettings />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
              <Route path="/settings/data" element={<DataSettings />} />
              <Route path="/settings/integrations" element={<IntegrationsSettings />} />
              <Route path="/settings/billing" element={<BillingSettings />} />
              <Route path="/settings/team" element={<TeamSettings />} />
            </Routes>
            <UniversalAIAssistant />
          </Router>
        </AIContextProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
