
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TaskMasterPage from "./pages/TaskMasterPage";
import TimeTrackProPage from "./pages/TimeTrackProPage";
import BudgetBuddyPage from "./pages/BudgetBuddyPage";
import FileVaultPage from "./pages/FileVaultPage";
import CollabSpacePage from "./pages/CollabSpacePage";
import ResourceHubPage from "./pages/ResourceHubPage";
import ClientConnectPage from "./pages/ClientConnectPage";
import IntegrationHubPage from "./pages/IntegrationHubPage";
import InsightIQPage from "./pages/InsightIQPage";
import RiskRadarPage from "./pages/RiskRadarPage";
import KnowledgeNestPage from "./pages/KnowledgeNestPage";
import ServiceCorePage from "./pages/ServiceCorePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/taskmaster" element={<TaskMasterPage />} />
            <Route path="/timetrackpro" element={<TimeTrackProPage />} />
            <Route path="/budgetbuddy" element={<BudgetBuddyPage />} />
            <Route path="/filevault" element={<FileVaultPage />} />
            <Route path="/collabspace" element={<CollabSpacePage />} />
            <Route path="/resourcehub" element={<ResourceHubPage />} />
            <Route path="/clientconnect" element={<ClientConnectPage />} />
            <Route path="/integrationhub" element={<IntegrationHubPage />} />
            <Route path="/insightiq" element={<InsightIQPage />} />
            <Route path="/riskradar" element={<RiskRadarPage />} />
            <Route path="/knowledgenest" element={<KnowledgeNestPage />} />
            <Route path="/servicecore" element={<ServiceCorePage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthContextProvider>
  </QueryClientProvider>
);

export default App;
