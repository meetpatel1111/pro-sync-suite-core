
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Star, Archive, MoreHorizontal, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  start_date?: string;
  end_date?: string;
  member_count?: number;
}

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
}

const ProjectSidebar = ({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject,
  onEditProject,
  onArchiveProject 
}: ProjectSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showArchived ? project.status === 'archived' : project.status !== 'archived';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-80 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button onClick={onCreateProject} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectProject(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="font-medium truncate">{project.name}</h3>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    
                    {project.member_count && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {project.member_count}
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchiveProject(project)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="w-full justify-start"
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? 'Show Active' : 'Show Archived'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectSidebar;
