
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MessageSquare, 
  FileText, 
  X,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quickActions = [
    {
      icon: Calendar,
      label: 'New Task',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        navigate('/taskmaster');
        toast({ title: 'Opening TaskMaster', description: 'Create a new task' });
      }
    },
    {
      icon: Clock,
      label: 'Start Timer',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => {
        navigate('/timetrackpro');
        toast({ title: 'Opening TimeTrackPro', description: 'Start tracking your time' });
      }
    },
    {
      icon: MessageSquare,
      label: 'Team Chat',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: () => {
        navigate('/collabspace');
        toast({ title: 'Opening CollabSpace', description: 'Connect with your team' });
      }
    },
    {
      icon: FileText,
      label: 'New Project',
      color: 'bg-amber-500 hover:bg-amber-600',
      action: () => {
        navigate('/planboard');
        toast({ title: 'Opening PlanBoard', description: 'Create a new project' });
      }
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="floating-action">
      {/* Action Menu */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-64 animate-scale-in glass-morphism border-white/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </h3>
              {quickActions.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/20 transition-all duration-200"
                  onClick={() => handleActionClick(item.action)}
                >
                  <div className={`p-1.5 rounded-lg mr-3 ${item.color} transition-colors`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  {item.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary scale-100 hover:scale-110'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
