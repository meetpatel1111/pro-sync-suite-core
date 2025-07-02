
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IntegrationProvider } from "./context/IntegrationContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserSettings from "./pages/UserSettings";

// Import all the app pages
import TaskMaster from "./pages/TaskMaster";
import TimeTrackPro from "./pages/TimeTrackPro";
import CollabSpace from "./pages/CollabSpace";
import PlanBoard from "./pages/PlanBoard";
import FileVault from "./pages/FileVault";
import ServiceCore from "./pages/ServiceCore";
import KnowledgeNest from "./pages/KnowledgeNest";
import BudgetBuddy from "./pages/BudgetBuddy";
import InsightIQ from "./pages/InsightIQ";
import ClientConnect from "./pages/ClientConnect";
import RiskRadar from "./pages/RiskRadar";
import ResourceHub from "./pages/ResourceHub";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <IntegrationProvider>
              <SettingsProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/settings" element={<UserSettings />} />
                        
                        {/* All App Routes */}
                        <Route path="/taskmaster" element={<TaskMaster />} />
                        <Route path="/timetrackpro" element={<TimeTrackPro />} />
                        <Route path="/collabspace" element={<CollabSpace />} />
                        <Route path="/planboard" element={<PlanBoard />} />
                        <Route path="/filevault" element={<FileVault />} />
                        <Route path="/servicecore" element={<ServiceCore />} />
                        <Route path="/knowledgenest" element={<KnowledgeNest />} />
                        <Route path="/budgetbuddy" element={<BudgetBuddy />} />
                        <Route path="/insightiq" element={<InsightIQ />} />
                        <Route path="/clientconnect" element={<ClientConnect />} />
                        <Route path="/riskradar" element={<RiskRadar />} />
                        <Route path="/resourcehub" element={<ResourceHub />} />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
              </SettingsProvider>
            </IntegrationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
