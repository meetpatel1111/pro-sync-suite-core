
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { IntegrationProvider } from "@/context/IntegrationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserSettings from "./pages/UserSettings";
import ProfileSettings from "./pages/ProfileSettings";
import BudgetBuddy from "./pages/BudgetBuddy";
import TaskMaster from "./pages/TaskMaster";
import TimeTrackPro from "./pages/TimeTrackPro";
import CollabSpace from "./pages/CollabSpace";
import FileVault from "./pages/FileVault";
import ClientConnect from "./pages/ClientConnect";
import PlanBoard from "./pages/PlanBoard";
import RiskRadar from "./pages/RiskRadar";
import InsightIQ from "./pages/InsightIQ";
import ResourceHub from "./pages/ResourceHub";
import Integrations from "./pages/Integrations";
import AppPlaceholder from "./pages/AppPlaceholder";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <IntegrationProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/budgetbuddy" element={<BudgetBuddy />} />
                <Route path="/taskmaster" element={<TaskMaster />} />
                <Route path="/timetrackpro" element={<TimeTrackPro />} />
                <Route path="/collabspace" element={<CollabSpace />} />
                <Route path="/filevault" element={<FileVault />} />
                <Route path="/clientconnect" element={<ClientConnect />} />
                <Route path="/planboard" element={<PlanBoard />} />
                <Route path="/riskradar" element={<RiskRadar />} />
                <Route path="/insightiq" element={<InsightIQ />} />
                <Route path="/resourcehub" element={<ResourceHub />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/app/:appName" element={<AppPlaceholder title="App" description="Application placeholder" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </IntegrationProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
