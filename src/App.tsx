
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IntegrationProvider } from "./context/IntegrationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TaskMaster from "./pages/TaskMaster";
import TimeTrackPro from "./pages/TimeTrackPro";
import BudgetBuddy from "./pages/BudgetBuddy";
import FileVault from "./pages/FileVault";
import CollabSpace from "./pages/CollabSpace";
import ResourceHub from "./pages/ResourceHub";
import ClientConnect from "./pages/ClientConnect";
import Integrations from "./pages/Integrations";
import InsightIQ from "./pages/InsightIQ";
import RiskRadar from "./pages/RiskRadar";
import KnowledgeNestPage from "./pages/KnowledgeNestPage";
import ServiceCorePage from "./pages/ServiceCorePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <IntegrationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/taskmaster" element={<TaskMaster />} />
              <Route path="/timetrackpro" element={<TimeTrackPro />} />
              <Route path="/budgetbuddy" element={<BudgetBuddy />} />
              <Route path="/filevault" element={<FileVault />} />
              <Route path="/collabspace" element={<CollabSpace />} />
              <Route path="/resourcehub" element={<ResourceHub />} />
              <Route path="/clientconnect" element={<ClientConnect />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/insightiq" element={<InsightIQ />} />
              <Route path="/riskradar" element={<RiskRadar />} />
              <Route path="/knowledgenest" element={<KnowledgeNestPage />} />
              <Route path="/servicecore" element={<ServiceCorePage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </IntegrationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
