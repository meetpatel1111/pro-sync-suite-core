
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectSelector from './ProjectSelector';
import BoardSelector from './BoardSelector';
import AdvancedTaskBoard from './AdvancedTaskBoard';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';
import TaskReports from './TaskReports';
import TaskSettings from './TaskSettings';
import type { Project, Board, BoardViewType } from '@/types/taskmaster';

const TaskMasterMain: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [selectedBoard, setSelectedBoard] = useState<Board | undefined>();
  const [currentView, setCurrentView] = useState<'projects' | 'boards' | 'tasks'>('projects');
  const [activeTab, setActiveTab] = useState<BoardViewType>('board');

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedBoard(undefined);
    setCurrentView('boards');
  };

  const handleBoardSelect = (board: Board) => {
    setSelectedBoard(board);
    setCurrentView('tasks');
  };

  const handleBack = () => {
    if (currentView === 'tasks') {
      setCurrentView('boards');
      setSelectedBoard(undefined);
    } else if (currentView === 'boards') {
      setCurrentView('projects');
      setSelectedProject(undefined);
    }
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    if (currentView !== 'projects') {
      items.push(
        <Button key="back" variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      );
    }

    if (selectedProject) {
      items.push(
        <span key="project" className="text-sm font-medium">
          {selectedProject.name}
        </span>
      );
    }

    if (selectedBoard) {
      items.push(
        <span key="board" className="text-sm font-medium text-muted-foreground">
          / {selectedBoard.name}
        </span>
      );
    }

    return items.length > 0 ? (
      <div className="flex items-center gap-2 mb-6">
        {items}
      </div>
    ) : null;
  };

  if (currentView === 'projects') {
    return (
      <div className="space-y-6">
        <ProjectSelector 
          onProjectSelect={handleProjectSelect}
          selectedProject={selectedProject}
        />
      </div>
    );
  }

  if (currentView === 'boards' && selectedProject) {
    return (
      <div className="space-y-6">
        {renderBreadcrumb()}
        <BoardSelector 
          project={selectedProject}
          onBoardSelect={handleBoardSelect}
          selectedBoard={selectedBoard}
        />
      </div>
    );
  }

  if (currentView === 'tasks' && selectedProject && selectedBoard) {
    return (
      <div className="space-y-6">
        {renderBreadcrumb()}
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BoardViewType)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <AdvancedTaskBoard project={selectedProject} board={selectedBoard} />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <TaskList project={selectedProject} board={selectedBoard} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <TaskCalendar project={selectedProject} board={selectedBoard} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
              <p className="text-muted-foreground">Timeline view with Gantt charts coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <TaskReports project={selectedProject} board={selectedBoard} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
};

export default TaskMasterMain;
