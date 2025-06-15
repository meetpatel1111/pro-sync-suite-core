
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Users, Calendar, Flag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FilterState {
  assignee?: string;
  status?: string;
  priority?: string;
  dateRange?: { start: string; end: string };
  showMilestonesOnly?: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  teamMembers: Array<{ id: string; name: string }>;
}

const FilterPanel = ({ filters, onFiltersChange, teamMembers }: FilterPanelProps) => {
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-2 p-4 border-b bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Assignee</label>
                <Select
                  value={filters.assignee || ''}
                  onValueChange={(value) => onFiltersChange({ ...filters, assignee: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All assignees</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => onFiltersChange({ ...filters, status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) => onFiltersChange({ ...filters, priority: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.assignee && (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {teamMembers.find(m => m.id === filters.assignee)?.name || 'Unknown'}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => clearFilter('assignee')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {filters.status && (
          <Badge variant="secondary" className="gap-1">
            Status: {filters.status}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => clearFilter('status')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {filters.priority && (
          <Badge variant="secondary" className="gap-1">
            <Flag className="h-3 w-3" />
            {filters.priority}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => clearFilter('priority')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
