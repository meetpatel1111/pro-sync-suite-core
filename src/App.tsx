import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
import ProfileSettings from '@/pages/ProfileSettings';
import UserSettings from '@/pages/UserSettings';
import TaskMaster from '@/pages/TaskMaster';
import Auth from '@/pages/Auth';
import { QueryClient } from '@tanstack/react-query';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <Toaster />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/taskmaster" element={<TaskMaster />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
