
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, Kanban, Clock } from 'lucide-react';

type ViewType = 'gantt' | 'timeline' | 'calendar' | 'board';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSelector = ({ currentView, onViewChange }: ViewSelectorProps) => {
  const views = [
    { id: 'gantt' as const, label: 'Gantt', icon: BarChart3 },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'board' as const, label: 'Board', icon: Kanban },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.id}
            variant={currentView === view.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view.id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {view.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ViewSelector;
