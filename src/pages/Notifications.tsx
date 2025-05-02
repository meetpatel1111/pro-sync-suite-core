
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications
          </p>
        </div>
        
        {user ? <NotificationsPanel userId={user.id} /> : <p>Loading user information...</p>}
      </div>
    </AppLayout>
  );
};

export default Notifications;
