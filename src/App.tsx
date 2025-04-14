
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IntegrationProvider } from "@/context/IntegrationContext";
import { useState, useEffect } from "react";
import { dbService } from "./services/dbService";
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

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database tables when the app loads
  useEffect(() => {
    const initDb = async () => {
      const result = await dbService.initializeDatabase();
      setDbInitialized(result);
    };
    
    initDb();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IntegrationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/taskmaster" element={<TaskMaster />} />
              <Route path="/timetrackpro" element={<TimeTrackPro />} />
              <Route path="/collabspace" element={<CollabSpace />} />
              <Route path="/planboard" element={<PlanBoard />} />
              <Route path="/filevault" element={<FileVault />} />
              <Route path="/budgetbuddy" element={<BudgetBuddy />} />
              <Route path="/insightiq" element={<InsightIQ />} />
              <Route path="/clientconnect" element={<ClientConnect />} />
              <Route path="/riskradar" element={<RiskRadar />} />
              <Route path="/resourcehub" element={<ResourceHub />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </IntegrationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
