
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

// Import all the colorful app pages
import TaskMaster from "./pages/TaskMaster";
import TimeTrackPro from "./pages/TimeTrackPro";
import CollabSpace from "./pages/CollabSpace";
import PlanBoard from "./pages/PlanBoard";
import FileVault from "./pages/FileVault";
import ServiceCore from "./pages/ServiceCore";
import KnowledgeNest from "./pages/KnowledgeNest";

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
                        
                        {/* Colorful App Routes */}
                        <Route path="/taskmaster" element={<TaskMaster />} />
                        <Route path="/timetrackpro" element={<TimeTrackPro />} />
                        <Route path="/collabspace" element={<CollabSpace />} />
                        <Route path="/planboard" element={<PlanBoard />} />
                        <Route path="/filevault" element={<FileVault />} />
                        <Route path="/servicecore" element={<ServiceCore />} />
                        <Route path="/knowledgenest" element={<KnowledgeNest />} />
                        
                        {/* Placeholder routes for other apps */}
                        <Route path="/budgetbuddy" element={<Navigate to="/" />} />
                        <Route path="/insightiq" element={<Navigate to="/" />} />
                        <Route path="/clientconnect" element={<Navigate to="/" />} />
                        <Route path="/riskradar" element={<Navigate to="/" />} />
                        <Route path="/resourcehub" element={<Navigate to="/" />} />
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
